
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScheduleModalProps } from './types';
import { generateMeetLink } from '@/utils/calendarUtils';
import ScheduleForm from './ScheduleForm';

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
      setStartDate(selectedDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setMeetLink(generateMeetLink());
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
      meetLink: meetLink || generateMeetLink(),
      teacherId: teacher.id,
      teacherName: teacher.name
    });

    onClose();
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
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isViewOnly && (
            <Button type="submit" onClick={handleSave}>
              {editEvent ? 'Update' : 'Create'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
