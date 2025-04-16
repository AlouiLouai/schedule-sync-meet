
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addDays, isSameWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ScheduleEvent, Teacher, ViewMode } from '@/types';
import { generateCalendarDays, generateWeekDays, getEventsForDate, getTeacherColor, sortEventsByTime } from '@/utils/calendarUtils';
import EventCard from '@/components/EventCard';
import ScheduleModal from '@/components/schedule-modal/ScheduleModal';
import ViewEventModal from '@/components/ViewEventModal';

interface CalendarViewProps {
  events: ScheduleEvent[];
  onAddEvent?: (event: Partial<ScheduleEvent>) => void;
  isTeacherView?: boolean;
  teacher?: Teacher;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  isTeacherView = false,
  teacher
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTH);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'view'>('add');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const monthDays = generateCalendarDays(currentDate);
  const weekDays = generateWeekDays(currentDate);

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (isTeacherView && teacher) {
      setModalType('add');
      setSelectedEvent(null);
      setIsModalOpen(true);
    }
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    
    if (isTeacherView) {
      setModalType('view');
      setIsModalOpen(true);
    } else {
      setIsViewModalOpen(true);
    }
  };

  const handleAddEvent = (event: Partial<ScheduleEvent>) => {
    if (onAddEvent) {
      onAddEvent(event);
    }
  };

  const renderMonthView = () => (
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
            onClick={() => handleDateClick(day)}
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
                    handleEventClick(event);
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

  const renderWeekView = () => {
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
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 mt-4 gap-2">
          {days.map((day) => {
            const dayEvents = sortEventsByTime(getEventsForDate(day, events));
            
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
                      onClick={() => handleEventClick(event)}
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

  const renderDayView = () => {
    const dayEvents = sortEventsByTime(getEventsForDate(currentDate, events));
    
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
                onClick={() => handleEventClick(event)}
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            className="ml-2"
          >
            Today
          </Button>
          <h2 className="text-xl font-medium ml-2">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <Tabs 
            defaultValue={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isTeacherView && teacher && (
            <Button 
              onClick={() => {
                setModalType('add');
                setSelectedEvent(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4">
        {viewMode === ViewMode.MONTH && renderMonthView()}
        {viewMode === ViewMode.WEEK && renderWeekView()}
        {viewMode === ViewMode.DAY && renderDayView()}
      </Card>

      {/* Teacher modal for adding/editing events */}
      {isTeacherView && teacher && isModalOpen && (
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEvent}
          selectedDate={selectedDate || currentDate}
          teacher={teacher}
          editEvent={selectedEvent || undefined}
          isViewOnly={modalType === 'view'}
        />
      )}
      
      {/* Student view modal */}
      {!isTeacherView && isViewModalOpen && selectedEvent && (
        <ViewEventModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default CalendarView;
