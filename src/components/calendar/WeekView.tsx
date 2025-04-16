
import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScheduleEvent } from '@/types';
import { sortEventsByTime } from '@/utils/calendarUtils';
import EventCard from '@/components/EventCard';

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  events: ScheduleEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
  isTeacherView?: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateClick,
  onEventClick,
  isTeacherView = false,
}) => {
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(currentDate);
  const days = [];
  let day = startDate;
  
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="text-center p-2">
            <div className="text-sm font-medium text-google-gray mb-1">
              {format(day, 'EEE')}
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 mx-auto rounded-full text-sm",
                isToday(day) && "bg-google-blue text-white",
                selectedDate && isSameDay(day, selectedDate) && !isToday(day) && 
                  "bg-google-blue/10 text-google-blue font-medium"
              )}
              onClick={() => onDateClick(day)}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 mt-4 gap-2">
        {days.map((day) => {
          const dayEvents = sortEventsByTime(events.filter(event => 
            isSameDay(new Date(event.startDateTime), day)
          ));
          
          if (dayEvents.length === 0) return null;
          
          return (
            <div key={day.toISOString()} className="mb-4">
              <h3 className="font-medium text-google-dark-gray mb-2">
                {format(day, 'EEEE, MMMM d')}
              </h3>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isTeacherView={isTeacherView}
                    onClick={() => onEventClick(event)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
