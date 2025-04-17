
import React, { useState, useEffect } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScheduleModalProps } from './types';
import { createGoogleMeetLink } from '@/utils/googleMeetUtils';
import ScheduleForm from './ScheduleForm';
import { useToast } from '@/components/ui/use-toast';

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate = new Date(),
  teacher,
  editEvent,
  isViewOnly = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [meetLink, setMeetLink] = useState('');
  const [isCreatingMeetLink, setIsCreatingMeetLink] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description);
      setStartDate(new Date(editEvent.startDateTime));
      setStartTime(format(new Date(editEvent.startDateTime), 'HH:mm'));
      setEndTime(format(new Date(editEvent.endDateTime), 'HH:mm'));
      setMeetLink(editEvent.meetLink);
    } else {
      setTitle('');
      setDescription('');
      // Ensure selectedDate is not in the past
      const today = startOfDay(new Date());
      setStartDate(isBefore(startOfDay(selectedDate), today) ? today : selectedDate);
      setStartTime('09:00');
      setEndTime('10:00');
      
      // Only create new meet link for new events
      setIsCreatingMeetLink(true);
      createGoogleMeetLink()
        .then(link => {
          setMeetLink(link);
          setIsCreatingMeetLink(false);
        })
        .catch(error => {
          console.error('Error creating Google Meet link:', error);
          setMeetLink('https://meet.google.com/error-creating-link');
          setIsCreatingMeetLink(false);
          toast({
            title: "Error creating Meet link",
            description: "Using a placeholder link instead. Please try again later.",
            variant: "destructive"
          });
        });
    }
  }, [editEvent, selectedDate, isOpen]);

  const handleSave = () => {
    if (!startDate || !title) return;

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(startDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    onSave({
      id: editEvent?.id || Math.random().toString(36).substring(2, 9),
      title,
      description,
      startDateTime,
      endDateTime,
      meetLink,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherPhotoUrl: teacher.photoUrl
    });

    onClose();
  };

  // Disallow selecting past dates
  const disabledDays = {
    before: startOfDay(new Date()),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isViewOnly 
              ? 'Class Details' 
              : editEvent 
                ? 'Edit Schedule' 
                : 'Add New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <ScheduleForm
          title={title}
          description={description}
          startDate={startDate}
          startTime={startTime}
          endTime={endTime}
          meetLink={meetLink}
          isViewOnly={isViewOnly}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          disabledDays={disabledDays}
          isCreatingMeetLink={isCreatingMeetLink}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isViewOnly && (
            <Button 
              type="submit" 
              onClick={handleSave}
              disabled={isCreatingMeetLink || !title || !startDate}
            >
              {editEvent ? 'Update' : 'Create'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
