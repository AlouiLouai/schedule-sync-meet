
import React from 'react';
import { format } from 'date-fns';
import { ScheduleEvent } from '@/types';
import { sortEventsByTime } from '@/utils/calendarUtils';
import EventCard from '@/components/EventCard';

interface DayViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  isTeacherView?: boolean;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventClick,
  isTeacherView = false,
}) => {
  const dayEvents = sortEventsByTime(events);
  
  return (
    <div className="mt-4">
      <h2 className="font-medium text-xl text-google-dark-gray mb-4">
        {format(currentDate, 'EEEE, MMMM d, yyyy')}
      </h2>
      
      {dayEvents.length > 0 ? (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isTeacherView={isTeacherView}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No scheduled events for this day
        </div>
      )}
    </div>
  );
};

export default DayView;
