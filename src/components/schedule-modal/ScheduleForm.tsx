
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Video, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScheduleFormProps } from './types';

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  title,
  description,
  startDate,
  startTime,
  endTime,
  meetLink,
  isViewOnly = false,
  onTitleChange,
  onDescriptionChange,
  onStartDateChange,
  onStartTimeChange,
  onEndTimeChange,
  disabledDays,
  isCreatingMeetLink
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Class title"
          disabled={isViewOnly}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add details about the class"
          disabled={isViewOnly}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                disabled={isViewOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                disabled={disabledDays}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            disabled={isViewOnly}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            disabled={isViewOnly}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meetLink">Google Meet Link</Label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Input
                id="meetLink"
                value={meetLink}
                readOnly
                className="pr-10"
              />
              {isCreatingMeetLink && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-google-blue" />
                </div>
              )}
            </div>
            {!isViewOnly && !isCreatingMeetLink && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="shrink-0"
                onClick={() => window.open(meetLink, '_blank')}
              >
                <Video className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
