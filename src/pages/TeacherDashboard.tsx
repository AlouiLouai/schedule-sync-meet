
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CalendarView from './CalendarView';
import { ScheduleEvent, Teacher } from '@/types';
import { getTeacherColor } from '@/utils/calendarUtils';

const TeacherDashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load teacher info and events from localStorage
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacherInfo');
    const storedEvents = localStorage.getItem('scheduleEvents');
    
    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
    } else {
      // No teacher info found, redirect to login
      navigate('/teacher-login');
    }
    
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('teacherInfo');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleAddEvent = (event: Partial<ScheduleEvent>) => {
    if (!teacher) return;
    
    // Create a new event with color based on teacher ID
    const newEvent: ScheduleEvent = {
      ...event as ScheduleEvent,
      color: getTeacherColor(teacher.id)
    };
    
    // Add new event or update existing one
    const updatedEvents = events.some(e => e.id === newEvent.id)
      ? events.map(e => e.id === newEvent.id ? newEvent : e)
      : [...events, newEvent];
    
    // Update state and localStorage
    setEvents(updatedEvents);
    localStorage.setItem('scheduleEvents', JSON.stringify(updatedEvents));
    
    toast({
      title: event.id ? "Schedule Updated" : "Schedule Created",
      description: `Your ${event.title} schedule has been ${event.id ? "updated" : "added"}.`,
    });
  };

  // Filter events to show only this teacher's events
  const teacherEvents = teacher
    ? events.filter(event => event.teacherId === teacher.id)
    : [];

  if (!teacher) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        isTeacher={true} 
        teacherName={teacher.name} 
        teacherPhoto={teacher.photoUrl}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-google-dark-gray">My Teaching Schedule</h1>
            <p className="text-google-gray">
              Manage your classes and online sessions in one place
            </p>
          </div>
          
          <CalendarView 
            events={teacherEvents} 
            onAddEvent={handleAddEvent}
            isTeacherView={true}
            teacher={teacher}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
