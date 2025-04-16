
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleFormProps } from './types';
import { useToast } from '@/hooks/use-toast';

const ScheduleForm = ({
  title,
  description,
  startDate,
  startTime,
  endTime,
  meetLink,
  isViewOnly,
  onTitleChange,
  onDescriptionChange,
  onStartDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: ScheduleFormProps) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const copyMeetLink = () => {
    navigator.clipboard.writeText(meetLink);
    setIsCopied(true);
    toast({
      title: "Link copied",
      description: "Google Meet link has been copied to clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          readOnly={isViewOnly}
          className={isViewOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          readOnly={isViewOnly}
          className={isViewOnly ? "bg-gray-100" : ""}
        />
      </div>

      <div className="grid gap-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                isViewOnly && "bg-gray-100"
              )}
              disabled={isViewOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? startDate.toLocaleDateString() : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startTime">Start Time</Label>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-gray-100" : ""}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="endTime">End Time</Label>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              readOnly={isViewOnly}
              className={isViewOnly ? "bg-gray-100" : ""}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="meetLink">Google Meet Link</Label>
        <div className="flex items-center">
          <Input
            id="meetLink"
            value={meetLink}
            readOnly
            className="bg-gray-100 flex-1"
          />
          <Button 
            size="icon" 
            variant="outline" 
            className="ml-2" 
            onClick={copyMeetLink}
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm;
