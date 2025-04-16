
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScheduleEvent, Teacher, ViewMode } from '@/types';
import { generateCalendarDays, generateWeekDays, getEventsForDate } from '@/utils/calendarUtils';
import ScheduleModal from '@/components/schedule-modal/ScheduleModal';
import ViewEventModal from '@/components/ViewEventModal';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';

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

  return (
    <div className="container mx-auto p-4">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        isTeacherView={isTeacherView}
        onPrevMonth={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
        onNextMonth={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
        onGoToToday={() => setCurrentDate(new Date())}
        onViewModeChange={(value) => setViewMode(value as ViewMode)}
        onAddEvent={() => {
          setModalType('add');
          setSelectedEvent(null);
          setIsModalOpen(true);
        }}
        teacher={teacher}
      />

      <Card className="p-4">
        {viewMode === ViewMode.MONTH && (
          <MonthView
            currentDate={currentDate}
            monthDays={monthDays}
            selectedDate={selectedDate}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        )}
        {viewMode === ViewMode.WEEK && (
          <WeekView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            isTeacherView={isTeacherView}
          />
        )}
        {viewMode === ViewMode.DAY && (
          <DayView
            currentDate={currentDate}
            events={getEventsForDate(currentDate, events)}
            onEventClick={handleEventClick}
            isTeacherView={isTeacherView}
          />
        )}
      </Card>

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
