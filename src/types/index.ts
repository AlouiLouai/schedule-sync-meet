
export interface Teacher {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  meetLink: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoUrl?: string;
  color?: string;
}

export enum ViewMode {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

