
import { createClient } from '@supabase/supabase-js';
import { ScheduleEvent } from '@/types';

// Initialize Supabase client (with fallback to localStorage if network is down)
const supabaseUrl = 'https://bsrnelxbvfauvavmxqcu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcm5lbHhidmZhdXZhdm14cWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTE2MjY5MDMsImV4cCI6MjAwNzIwMjkwM30.A_jzkJ5NrVpOCRsWp-hfG3AyWRZbw-ChzOm_G1_YaJc';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      // Set a timeout for fetch requests to prevent long hanging requests
      const [resource, config] = args;
      return fetch(resource, { 
        ...config, 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
    }
  }
});

// Get all events from the database
export const getEvents = async (): Promise<ScheduleEvent[]> => {
  try {
    console.log("Fetching events from Supabase...");
    const { data, error } = await supabase
      .from('events')
      .select('*');

    if (error) {
      throw error;
    }

    console.log("Events fetched successfully:", data);
    
    // Convert string dates to Date objects
    return data.map((event: any) => ({
      ...event,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime)
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    
    // Try to get events from localStorage as fallback
    const cachedEvents = localStorage.getItem('cachedEvents');
    if (cachedEvents) {
      try {
        const parsedEvents = JSON.parse(cachedEvents);
        // Convert string dates to Date objects
        return parsedEvents.map((event: any) => ({
          ...event,
          startDateTime: new Date(event.startDateTime),
          endDateTime: new Date(event.endDateTime)
        }));
      } catch (parseError) {
        console.error("Error parsing cached events:", parseError);
      }
    }
    
    // If all else fails, return empty array
    return [];
  }
};

// Create a new event
export const createEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
  try {
    // Format dates to ISO strings for Supabase
    const formattedEvent = {
      ...event,
      startDateTime: event.startDateTime?.toISOString(),
      endDateTime: event.endDateTime?.toISOString()
    };

    const { data, error } = await supabase
      .from('events')
      .insert([formattedEvent])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Store in localStorage as backup
    const allEvents = await getEvents();
    localStorage.setItem('cachedEvents', JSON.stringify(allEvents));

    // Convert string dates back to Date objects
    return {
      ...data,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime)
    };
  } catch (error) {
    console.error("Error creating event:", error);
    
    // Fallback to localStorage
    const cachedEvents = localStorage.getItem('cachedEvents');
    let events = [];
    
    if (cachedEvents) {
      try {
        events = JSON.parse(cachedEvents);
      } catch (e) {
        events = [];
      }
    }
    
    // Generate a unique ID
    const newId = `local-${Date.now()}`;
    const newEvent = {
      ...event,
      id: newId,
    } as ScheduleEvent;
    
    events.push(newEvent);
    localStorage.setItem('cachedEvents', JSON.stringify(events));
    
    return newEvent;
  }
};

// Update an existing event
export const updateEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
  try {
    if (!event.id) {
      throw new Error('Event ID is required for update');
    }

    // Format dates to ISO strings for Supabase
    const formattedEvent = {
      ...event,
      startDateTime: event.startDateTime ? event.startDateTime.toISOString() : undefined,
      endDateTime: event.endDateTime ? event.endDateTime.toISOString() : undefined
    };

    const { data, error } = await supabase
      .from('events')
      .update(formattedEvent)
      .eq('id', event.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update localStorage backup
    const allEvents = await getEvents();
    localStorage.setItem('cachedEvents', JSON.stringify(allEvents));

    // Convert string dates back to Date objects
    return {
      ...data,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime)
    };
  } catch (error) {
    console.error("Error updating event:", error);
    
    // Fallback to localStorage
    const cachedEvents = localStorage.getItem('cachedEvents');
    
    if (cachedEvents) {
      try {
        let events = JSON.parse(cachedEvents);
        const eventIndex = events.findIndex((e: any) => e.id === event.id);
        
        if (eventIndex !== -1) {
          events[eventIndex] = {
            ...events[eventIndex],
            ...event
          };
          
          localStorage.setItem('cachedEvents', JSON.stringify(events));
          return events[eventIndex] as ScheduleEvent;
        }
      } catch (e) {
        console.error("Error updating cached event:", e);
      }
    }
    
    // If we can't update, return the original event
    return event as ScheduleEvent;
  }
};
