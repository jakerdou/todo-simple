import MonthGrid from './MonthGrid';

interface MonthlyTabProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  switchToTodoTab: (date: Date) => void;
}

export default function MonthlyTab({ selectedDate, setSelectedDate, switchToTodoTab }: MonthlyTabProps) {
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="p-4 flex flex-col h-full bg-gray-900 transition-all duration-300">
      <div className="flex-grow flex flex-col">
        <MonthGrid 
          date={selectedDate} 
          onDateChange={handleDateChange} 
          onDayClick={switchToTodoTab} 
        />
      </div>
    </div>
  );
}
