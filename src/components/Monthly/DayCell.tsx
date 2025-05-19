import RechartsChart from './RechartsChart';

interface DayCellProps {
  day: number;
  isCurrentMonth?: boolean;
  completedTodos?: number;
  totalTodos?: number;
  onClick?: () => void;
  isCurrentDay?: boolean;
  date?: Date; // Add date prop
}

export default function DayCell({ 
  day, 
  isCurrentMonth = true, 
  completedTodos = 0, 
  totalTodos = 0,
  onClick,
  isCurrentDay = false,
  date
}: DayCellProps) {  
    // if (totalTodos > 0) {
    //   console.log(`[DayCell] Day ${day} has ${completedTodos}/${totalTodos} todos`);
    // }
    // else {
    //   console.log(`[DayCell] Day ${day} has no todos`);
    // }
    return (    
        <div 
          className={`
              h-full w-full border 
              p-2 flex flex-col cursor-pointer 
              ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-900 text-gray-500'}
              ${isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-700 hover:bg-gray-700'}
              transition-colors duration-200 hover:shadow-md
          `}
          onClick={onClick}
        >
          <div className="text-lg font-medium">{day}</div>
          {totalTodos > 0 && (
            <div className="mt-1 p-1 text-xs bg-gray-700 rounded-md inline-block">
            <span className={`${completedTodos === totalTodos && totalTodos > 0 ? 'text-green-400' : completedTodos > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                {completedTodos}/{totalTodos}
            </span>
            </div>      
          )}      
          {totalTodos > 0 && date && (
            <div className="mt-2 flex justify-center">
                {/* Only show the Recharts pie chart for current date or past dates */}
                {(date <= new Date() || isCurrentDay) && (
                    <RechartsChart completed={completedTodos} total={totalTodos} />
                )}
            </div>
          )}
          <div className="flex-grow"></div>
        </div>
    );
}
