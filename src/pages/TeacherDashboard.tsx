
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import CalendarView from './CalendarView';
import { ScheduleEvent, Teacher } from '@/types';
import { getTeacherColor } from '@/utils/calendarUtils';
import { getEvents, createEvent, updateEvent } from '@/utils/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TeacherDashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load teacher info from localStorage
  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacherInfo');
    
    if (storedTeacher) {
      try {
        setTeacher(JSON.parse(storedTeacher));
      } catch (error) {
        console.error('Error parsing teacher info:', error);
        navigate('/teacher-login');
        toast({
          title: "Authentication Error",
          description: "Please log in again.",
          variant: "destructive"
        });
      }
    } else {
      // No teacher info found, redirect to login
      navigate('/teacher-login');
    }
  }, [navigate, toast]);

  // Fetch events for this teacher
  const { data: allEvents = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    enabled: !!teacher, // Only run query when teacher is loaded
    retry: 2, // Retry failed requests twice
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    meta: {
      onError: (err: Error) => {
        console.error('Error fetching events in dashboard:', err);
        toast({
          title: "Could not load events",
          description: "Using locally cached events if available.",
          variant: "destructive"
        });
      }
    }
  });

  // Filter events to show only this teacher's events
  const teacherEvents = teacher
    ? allEvents.filter(event => event.teacherId === teacher.id)
    : [];

  // Mutations for creating and updating events
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: "Could not save to database",
        description: "Your event was saved locally.",
        variant: "destructive"
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: "Could not update in database",
        description: "Your changes were saved locally.",
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('teacherInfo');
    localStorage.removeItem('googleAuthCredentials');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const handleAddEvent = async (event: Partial<ScheduleEvent>) => {
    if (!teacher) return;
    
    // Create a new event with color based on teacher ID
    const newEvent: Partial<ScheduleEvent> = {
      ...event,
      color: getTeacherColor(teacher.id),
      teacherPhotoUrl: teacher.photoUrl
    };
    
    try {
      // Add new event or update existing one
      if (event.id && allEvents.some(e => e.id === event.id)) {
        await updateEventMutation.mutateAsync(newEvent);
        toast({
          title: "Schedule Updated",
          description: `Your ${event.title} schedule has been updated.`,
        });
      } else {
        await createEventMutation.mutateAsync(newEvent);
        toast({
          title: "Schedule Created",
          description: `Your ${event.title} schedule has been added.`,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save your schedule. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-medium text-google-dark-gray mb-2">Loading...</h2>
          <p className="text-google-gray">Please wait while we load your profile</p>
        </div>
      </div>
    );
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
          
          {error ? (
            <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                There was a problem connecting to the database. You're currently working with locally cached data.
              </p>
            </div>
          ) : null}
          
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
