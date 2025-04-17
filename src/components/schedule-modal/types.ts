
import { ScheduleEvent, Teacher } from '@/types';

export interface ScheduleFormProps {
  title: string;
  description: string;
  startDate?: Date;
  startTime: string;
  endTime: string;
  meetLink: string;
  isViewOnly?: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateChange: (date?: Date) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  disabledDays?: {
    before?: Date;
    after?: Date;
  };
  isCreatingMeetLink?: boolean;
}

export interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<ScheduleEvent>) => void;
  selectedDate?: Date;
  teacher: Teacher;
  editEvent?: ScheduleEvent;
  isViewOnly?: boolean;
}
