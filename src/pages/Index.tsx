
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CalendarView from './CalendarView';
import { ScheduleEvent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getEvents } from '@/utils/supabaseClient';
import { useQuery } from '@tanstack/react-query';

const Index: React.FC = () => {
  const { toast } = useToast();
  
  // Use React Query to fetch events
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading events",
        description: "Could not load events from the database. Showing local events instead.",
        variant: "destructive"
      });
      
      // Fallback to localStorage
      const storedEvents = localStorage.getItem('scheduleEvents');
      if (storedEvents) {
        try {
          const parsedEvents = JSON.parse(storedEvents);
          // Convert string dates to Date objects
          const processedEvents = parsedEvents.map((event: any) => ({
            ...event,
            startDateTime: new Date(event.startDateTime),
            endDateTime: new Date(event.endDateTime)
          }));
        } catch (err) {
          console.error('Error parsing local events:', err);
        }
      }
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-google-dark-gray">ScheduleSync Calendar</h1>
            <p className="text-google-gray">
              View all scheduled classes and join online sessions easily
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 mb-6" />
              <Skeleton className="h-[500px] w-full rounded-md" />
            </div>
          ) : events.length > 0 ? (
            <CalendarView events={events} />
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <CalendarIcon className="mx-auto h-12 w-12 text-google-gray mb-4" />
              <h2 className="text-xl text-google-dark-gray font-medium mb-2">No scheduled events yet</h2>
              <p className="text-google-gray">
                Check back later or ask your teachers to add their schedules
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
