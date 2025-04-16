
import React from 'react';
import { format } from 'date-fns';
import { Video, Clock, User } from 'lucide-react';
import { ScheduleEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: ScheduleEvent;
  isTeacherView?: boolean;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isTeacherView = false,
  onClick
}) => {
  const formattedStartTime = format(new Date(event.startDateTime), 'h:mm a');
  const formattedEndTime = format(new Date(event.endDateTime), 'h:mm a');
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-shadow",
        "border-l-4 bg-white",
        `border-[${event.color || '#4285F4'}]`
      )}
      style={{ borderLeftColor: event.color || '#4285F4' }}
      onClick={onClick}
    >
      <h3 className="font-medium text-google-dark-gray line-clamp-1">{event.title}</h3>
      
      <div className="mt-2 space-y-1">
        <div className="flex items-center text-sm text-google-gray">
          <Clock className="w-4 h-4 mr-2" />
          <span>{formattedStartTime} - {formattedEndTime}</span>
        </div>
        
        <div className="flex items-center text-sm text-google-gray">
          <User className="w-4 h-4 mr-2" />
          <span>{event.teacherName}</span>
        </div>
      </div>
      
      {!isTeacherView && (
        <div className="mt-3">
          <Button
            variant="outline" 
            size="sm"
            className="w-full text-google-blue border-google-blue hover:bg-google-blue/10"
            onClick={(e) => {
              e.stopPropagation();
              window.open(event.meetLink, '_blank');
            }}
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
