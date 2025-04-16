
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ScheduleEvent, ViewMode } from '@/types';

// Generate days for a month view
export const generateCalendarDays = (currentDate: Date): Date[] => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  
  // Create array of dates from start of week to end of month + days to complete the week
  const days = eachDayOfInterval({ start: startDate, end: endOfMonth(addDays(monthEnd, 7)) });
  
  // Return only 42 days (6 weeks) to ensure consistent calendar size
  return days.slice(0, 42);
};

// Generate week days
export const generateWeekDays = (currentDate: Date): Date[] => {
  const weekStart = startOfWeek(currentDate);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
};

// Format date for display
export const formatDate = (date: Date, formatString: string = 'PPP'): string => {
  return format(date, formatString);
};

// Check if a given date has events
export const hasEventsOnDate = (date: Date, events: ScheduleEvent[]): boolean => {
  return events.some(event => 
    isSameDay(date, new Date(event.startDateTime)) || 
    isSameDay(date, new Date(event.endDateTime))
  );
};

// Get events for a specific date
export const getEventsForDate = (date: Date, events: ScheduleEvent[]): ScheduleEvent[] => {
  return events.filter(event => {
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    
    return isSameDay(date, startDate) || isSameDay(date, endDate) || 
      (date > startDate && date < endDate);
  });
};

// Generate a unique Google Meet link
export const generateMeetLink = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomChars = Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  return `https://meet.google.com/${randomChars}`;
};

// Sort events chronologically
export const sortEventsByTime = (events: ScheduleEvent[]): ScheduleEvent[] => {
  return [...events].sort((a, b) => 
    new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );
};

// Get teacher colors (for consistent color coding per teacher)
export const getTeacherColor = (teacherId: string): string => {
  const colors = [
    '#4285F4', // Google Blue
    '#EA4335', // Google Red
    '#FBBC05', // Google Yellow
    '#34A853', // Google Green
    '#9334E6'  // Purple
  ];
  
  // Simple hash function to consistently assign the same color to a teacher
  const hash = teacherId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + acc;
  }, 0);
  
  return colors[hash % colors.length];
};
