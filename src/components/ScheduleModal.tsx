
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleEvent, Teacher } from '@/types';
import { generateMeetLink } from '@/utils/calendarUtils';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<ScheduleEvent>) => void;
  selectedDate?: Date;
  teacher: Teacher;
  editEvent?: ScheduleEvent;
  isViewOnly?: boolean;
}

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
  const [endDate, setEndDate] = useState<Date | undefined>(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [meetLink, setMeetLink] = useState('');

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description);
      setStartDate(new Date(editEvent.startDateTime));
      setEndDate(new Date(editEvent.endDateTime));
      setStartTime(format(new Date(editEvent.startDateTime), 'HH:mm'));
      setEndTime(format(new Date(editEvent.endDateTime), 'HH:mm'));
      setMeetLink(editEvent.meetLink);
    } else {
      setTitle('');
      setDescription('');
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setMeetLink(generateMeetLink());
    }
  }, [editEvent, selectedDate, isOpen]);

  const handleSave = () => {
    if (!startDate || !endDate || !title) return;

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(endDate);
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
              ? 'View Schedule' 
              : editEvent 
                ? 'Edit Schedule' 
                : 'Add New Schedule'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-gray-100" : ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-gray-100" : ""}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      isViewOnly && "bg-gray-100"
                    )}
                    disabled={isViewOnly}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  readOnly={isViewOnly}
                  className={isViewOnly ? "bg-gray-100" : ""}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      isViewOnly && "bg-gray-100"
                    )}
                    disabled={isViewOnly}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  readOnly={isViewOnly}
                  className={isViewOnly ? "bg-gray-100" : ""}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meetLink">Google Meet Link</Label>
            <Input
              id="meetLink"
              value={meetLink}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>

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
