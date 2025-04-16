
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewMode } from '@/types';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  isTeacherView: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onViewModeChange: (value: ViewMode) => void;
  onAddEvent: () => void;
  teacher?: { id: string; name: string };
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  isTeacherView,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onViewModeChange,
  onAddEvent,
  teacher
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onGoToToday}
          className="ml-2"
        >
          Today
        </Button>
        <h2 className="text-xl font-medium ml-2">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <Tabs 
          defaultValue={viewMode}
          onValueChange={(value) => onViewModeChange(value as ViewMode)}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isTeacherView && teacher && (
          <Button onClick={onAddEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
