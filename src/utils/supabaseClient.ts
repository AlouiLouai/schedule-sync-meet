
import { createClient } from '@supabase/supabase-js';
import { ScheduleEvent, Teacher } from '@/types';

// Supabase public URLs and keys are safe to be in the frontend code
const supabaseUrl = 'https://bsrnelxbvfauvavmxqcu.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcm5lbHhidmZhdXZhdm14cWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0MzYyNTYsImV4cCI6MTk5ODAxMjI1Nn0.SHOYLmBiWEVjFmeSxVLQgL4AG_v-jPYnCM2ZgNT7KiI'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teachers
export const getTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*');
  
  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
  
  return data as Teacher[];
};

// Events
export const getEvents = async (): Promise<ScheduleEvent[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*');
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  // Convert date strings to Date objects
  return data.map((event: any) => ({
    ...event,
    startDateTime: new Date(event.startDateTime),
    endDateTime: new Date(event.endDateTime)
  }));
};

export const createEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  
  return {
    ...data,
    startDateTime: new Date(data.startDateTime),
    endDateTime: new Date(data.endDateTime)
  };
};

export const updateEvent = async (event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', event.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating event:', error);
    return null;
  }
  
  return {
    ...data,
    startDateTime: new Date(data.startDateTime),
    endDateTime: new Date(data.endDateTime)
  };
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting event:', error);
    return false;
  }
  
  return true;
};
