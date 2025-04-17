
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScheduleEvent } from '@/types';
import { Calendar } from 'lucide-react';
import { sortEventsByTime } from '@/utils/calendarUtils';
import EventCard from './EventCard';

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  onEventClick
}) => {
  const dayEvents = sortEventsByTime(
    events.filter(event => isSameDay(new Date(event.startDateTime), selectedDate))
  );
  
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-auto">
        <DialogHeader className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-google-blue" />
          <DialogTitle>{formattedDate}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {dayEvents.length > 0 ? (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onClick={() => {
                    onEventClick(event);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No scheduled events for this day
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayEventsModal;
