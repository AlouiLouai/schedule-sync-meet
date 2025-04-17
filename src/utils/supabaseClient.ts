
import { createClient } from '@supabase/supabase-js';
import { ScheduleEvent, Teacher } from '@/types';

// Supabase public URLs and keys are safe to be in the frontend code
const supabaseUrl = 'https://bsrnelxbvfauvavmxqcu.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcm5lbHhidmZhdXZhdm14cWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzYyNTYsImV4cCI6MTk5ODAxMjI1Nn0.SHOYLmBiWEVjFmeSxVLQgL4AG_v-jPYnCM2ZgNT7KiI'; // Replace with your Supabase anon key

// Create supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      // Using timeout to prevent hanging connections
      const controller = new AbortController();
      const signal = controller.signal;
      
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      return fetch(...args, { signal })
        .finally(() => clearTimeout(timeoutId));
    }
  }
});

// Local storage keys
const EVENTS_STORAGE_KEY = 'scheduleEvents';
const TEACHERS_STORAGE_KEY = 'cachedTeachers';

// Helper function to get data from localStorage
const getLocalData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error reading from localStorage (${key}):`, e);
    return null;
  }
};

// Helper function to save data to localStorage
const saveLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Error saving to localStorage (${key}):`, e);
    return false;
  }
};

// Teachers
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Cache the results in localStorage
    saveLocalData(TEACHERS_STORAGE_KEY, data);
    return data as Teacher[];
  } catch (error) {
    console.error('Error fetching teachers:', error);
    
    // Fall back to cached data if available
    const cachedTeachers = getLocalData(TEACHERS_STORAGE_KEY);
    if (cachedTeachers) {
      console.log('Using cached teacher data');
      return cachedTeachers;
    }
    
    return [];
  }
};

// Events
export const getEvents = async (): Promise<ScheduleEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Process and cache the results
    const processedEvents = data.map((event: any) => ({
      ...event,
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime)
    }));
    
    saveLocalData(EVENTS_STORAGE_KEY, data);
    return processedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Fall back to localStorage if available
    const cachedEvents = getLocalData(EVENTS_STORAGE_KEY);
    if (cachedEvents) {
      console.log('Using cached event data');
      return cachedEvents.map((event: any) => ({
        ...event,
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime)
      }));
    }
    
    return [];
  }
};

export const createEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const processedEvent = {
      ...data,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime)
    };
    
    // Update local cache
    const cachedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    saveLocalData(EVENTS_STORAGE_KEY, [...cachedEvents, data]);
    
    return processedEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Fallback to localStorage if database fails
    const storedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    const newEvent = { 
      ...event, 
      id: event.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    
    storedEvents.push(newEvent);
    saveLocalData(EVENTS_STORAGE_KEY, storedEvents);
    
    return {
      ...newEvent,
      startDateTime: new Date(newEvent.startDateTime as string),
      endDateTime: new Date(newEvent.endDateTime as string)
    } as ScheduleEvent;
  }
};

export const updateEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', event.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const processedEvent = {
      ...data,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime)
    };
    
    // Update local cache
    const cachedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    const updatedCache = cachedEvents.map((e: any) => 
      e.id === event.id ? { ...e, ...event } : e
    );
    saveLocalData(EVENTS_STORAGE_KEY, updatedCache);
    
    return processedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    
    // Fallback to localStorage if database fails
    const storedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    const updatedEvents = storedEvents.map((e: any) => 
      e.id === event.id ? { ...e, ...event, updated_at: new Date().toISOString() } : e
    );
    
    saveLocalData(EVENTS_STORAGE_KEY, updatedEvents);
    
    const updatedEvent = updatedEvents.find((e: any) => e.id === event.id);
    if (updatedEvent) {
      return {
        ...updatedEvent,
        startDateTime: new Date(updatedEvent.startDateTime),
        endDateTime: new Date(updatedEvent.endDateTime)
      } as ScheduleEvent;
    }
    
    return null;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // Update local cache
    const cachedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    const updatedCache = cachedEvents.filter((e: any) => e.id !== id);
    saveLocalData(EVENTS_STORAGE_KEY, updatedCache);
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    
    // Fallback to localStorage if database fails
    const storedEvents = getLocalData(EVENTS_STORAGE_KEY) || [];
    const updatedEvents = storedEvents.filter((e: any) => e.id !== id);
    
    saveLocalData(EVENTS_STORAGE_KEY, updatedEvents);
    
    return true;
  }
};
