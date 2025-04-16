
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CalendarView from './CalendarView';
import { ScheduleEvent } from '@/types';

const Index: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  
  // Load all events from localStorage
  useEffect(() => {
    const storedEvents = localStorage.getItem('scheduleEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

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
          
          {events.length > 0 ? (
            <CalendarView events={events} />
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl text-google-gray font-medium mb-2">No scheduled events yet</h2>
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
