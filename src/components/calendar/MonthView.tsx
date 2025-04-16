
import React from 'react';
import { format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScheduleEvent } from '@/types';
import { getEventsForDate, getTeacherColor } from '@/utils/calendarUtils';

interface MonthViewProps {
  currentDate: Date;
  monthDays: Date[];
  selectedDate: Date | null;
  events: ScheduleEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  monthDays,
  selectedDate,
  events,
  onDateClick,
  onEventClick,
}) => {
  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDayLabels.map((day) => (
        <div key={day} className="px-1 py-2 text-center text-sm font-medium text-google-gray">
          {day}
        </div>
      ))}
      
      {monthDays.map((day, i) => {
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isTodayDate = isToday(day);
        const dayEvents = getEventsForDate(day, events);
        const hasEvents = dayEvents.length > 0;
        
        return (
          <div
            key={i}
            className={cn(
              "min-h-[100px] p-1 border border-transparent",
              isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
              isSelected && "border-google-blue",
              isTodayDate && "border-google-blue/50",
              hasEvents && "cursor-pointer",
              "hover:bg-gray-50 transition-colors"
            )}
            onClick={() => onDateClick(day)}
          >
            <div className="flex justify-center items-center w-8 h-8 mx-auto mb-1">
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm",
                  isTodayDate && "bg-google-blue text-white",
                  isSelected && !isTodayDate && "bg-google-blue/10 text-google-blue font-medium"
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
            
            <div className="space-y-1 overflow-y-auto max-h-[80px]">
              {dayEvents.length > 0 && dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs px-2 py-1 rounded truncate",
                    "hover:cursor-pointer"
                  )}
                  style={{ backgroundColor: `${event.color || getTeacherColor(event.teacherId)}20` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  {format(new Date(event.startDateTime), 'h:mm a')} - {event.title}
                </div>
              ))}
              
              {dayEvents.length > 2 && (
                <div className="text-xs text-center text-google-gray">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
