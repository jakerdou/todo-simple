interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

export default function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  // Go to today
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <button 
        onClick={goToPreviousDay}
        className="p-2 text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
        aria-label="Previous day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="flex flex-col items-center">
        <h3 className={`text-sm font-medium ${isToday(selectedDate) ? 'text-blue-400' : 'text-gray-400'}`}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        {!isToday(selectedDate) && (
          <button 
            onClick={goToToday}
            className="text-xs text-blue-400 hover:text-blue-300 mt-1 focus:outline-none"
          >
            Go to Today
          </button>
        )}
      </div>
      
      <button 
        onClick={goToNextDay}
        className="p-2 text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
        aria-label="Next day"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
