
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Video, Clock, User, CalendarIcon } from 'lucide-react';
import { ScheduleEvent } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduleEvent;
}

const ViewEventModal: React.FC<ViewEventModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = format(new Date(event.startDateTime), 'PPP');
  const formattedStartTime = format(new Date(event.startDateTime), 'h:mm a');
  const formattedEndTime = format(new Date(event.endDateTime), 'h:mm a');

  const copyMeetLink = () => {
    navigator.clipboard.writeText(event.meetLink);
    setIsCopied(true);
    toast({
      title: "Link copied",
      description: "Google Meet link has been copied to clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const joinMeeting = () => {
    window.open(event.meetLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={event.teacherPhotoUrl || '/placeholder.svg'} 
                alt={`${event.teacherName}'s avatar`} 
              />
              <AvatarFallback>{event.teacherName.charAt(0)}</AvatarFallback>
            </Avatar>
            <DialogTitle>{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {event.description && (
            <div className="text-gray-700">
              {event.description}
            </div>
          )}
          
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-google-gray">
              <CalendarIcon className="w-5 h-5 mr-3" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center text-google-gray">
              <Clock className="w-5 h-5 mr-3" />
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>
            
            <div className="flex items-center text-google-gray">
              <User className="w-5 h-5 mr-3" />
              <span>{event.teacherName}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="mb-2 font-medium text-sm text-google-dark-gray">Google Meet</div>
            <div className="flex space-x-2">
              <Button 
                className="flex-1"
                onClick={joinMeeting}
              >
                <Video className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyMeetLink}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEventModal;

