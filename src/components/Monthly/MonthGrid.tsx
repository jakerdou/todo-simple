import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import DayCell from './DayCell';
import { fetchTodoInstances } from '../../services/read';
import { refreshRecurringTodoInstances } from '../../services/create';

interface MonthGridProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void; // Added prop for navigation to Todo tab
}

// Format date to YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get all days in a month, including padding days from prev/next months
const getDaysInMonth = (year: number, month: number) => {
  // Create date for first day of the month
  const firstDay = new Date(year, month, 1);
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  
  // Create date for last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get the previous month's days that we need to display
  const prevMonthDays = [];
  if (firstDayOfWeek > 0) {
    // How many days from previous month we need to show
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }
  }
  
  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      month,
      year,
      isCurrentMonth: true
    });
  }
  
  // Calculate how many days we need from the next month
  const daysFromNextMonth = Math.max(0, 35 - (prevMonthDays.length + daysInMonth));
  
  // Next month days to fill out the remainder of the 5-row grid
  const nextMonthDays = [];
  if (daysFromNextMonth > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      nextMonthDays.push({
        day: i,
        month: nextMonth,
        year: nextMonthYear,
        isCurrentMonth: false
      });
    }
  }
  
  // Return days that fit within our 5-week grid
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays].slice(0, 35);
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TodoStats {
  [date: string]: {
    total: number;
    completed: number;
  };
}

export default function MonthGrid({ date = new Date(), onDateChange, onDayClick }: MonthGridProps) {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(date);
  const [todoStats, setTodoStats] = useState<TodoStats>({});
  const [loading, setLoading] = useState<boolean>(false);
  const isInitialRender = useRef(true);
  const todayDate = useRef(new Date()); // Store the actual current date
  
  // Get current month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Get the days for the grid
  const days = getDaysInMonth(year, month);
  
  // Format month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
  // Fetch todos for the entire month when the month changes
  useEffect(() => {
    if (!currentUser) return;
    
    // In development, React StrictMode causes double rendering
    // In production, we should always fetch data regardless
    const shouldFetchData = !isInitialRender.current || process.env.NODE_ENV === 'production';
    
    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (!shouldFetchData) {
        console.log('[MonthGrid] Skipping initial call in development mode');
        return;
      }
    }
    
    const fetchMonthlyTodos = async () => {
      try {
        console.log('[MonthGrid] Starting to fetch monthly todos');
        setLoading(true);
        
        // Create date for first day of the month
        const firstDay = new Date(year, month, 1);
        // Create date for last day of the month
        const lastDay = new Date(year, month + 1, 0);
        
        console.log(`[MonthGrid] Date range: ${formatDateString(firstDay)} to ${formatDateString(lastDay)}`);
        
        // Refresh recurring todos for the month range
        await refreshRecurringTodoInstances(currentUser.uid, firstDay, lastDay);
        console.log('[MonthGrid] Refreshed recurring todos');
        
        // Format dates for API
        const startDateStr = formatDateString(firstDay);
        const endDateStr = formatDateString(lastDay);
        
        console.log(`[MonthGrid] Fetching todos for date range: ${startDateStr} to ${endDateStr}`);
          // Fetch todos for the entire month
        const monthTodos = await fetchTodoInstances(currentUser.uid, startDateStr, endDateStr);
        console.log(`[MonthGrid] Fetched ${monthTodos.length} todos for month`);
        console.log('[MonthGrid] First few todos:', monthTodos.slice(0, 3));
        
        // Calculate stats for each day
        const stats: TodoStats = {};
        
        console.log('[MonthGrid] Processing todos to calculate stats');
        monthTodos.forEach(todo => {
          console.log(`[MonthGrid] Processing todo: ${todo.name}, date: ${todo.date}, completed: ${todo.completed}`);
          if (!stats[todo.date]) {
            stats[todo.date] = { total: 0, completed: 0 };
          }
          
          stats[todo.date].total++;
          if (todo.completed) {
            stats[todo.date].completed++;
          }
        });
          console.log('[MonthGrid] Stats calculated:', JSON.stringify(stats, null, 2));
        setTodoStats(stats);
        
        // Add a timeout to check if todoStats is updated correctly after setState
        setTimeout(() => {
          console.log('[MonthGrid] TodoStats state after update:', JSON.stringify(todoStats, null, 2));
        }, 100);
      } catch (err) {
        console.error('Error loading monthly todos:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyTodos();
    console.log('Fetching todos for month:', month, 'year:', year);
  }, [currentUser, month, year]);
  // Handle navigation to previous month
  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };
  
  // Handle navigation to next month, with a limit of 3 months into the future
  const handleNextMonth = () => {
    // Calculate the limit: today's date + 3 months
    const today = todayDate.current;
    const limitDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    
    // Calculate the target date we'd navigate to
    const targetDate = new Date(year, month + 1, 1);
    
    // Only navigate if the target date is not beyond our limit
    if (targetDate <= limitDate) {
      setCurrentDate(targetDate);
      if (onDateChange) onDateChange(targetDate);
    } else {
      // Provide user feedback with tooltip (handled by UI)
      console.log('Cannot navigate more than 3 months into the future');
    }
  };
  console.log('todoStats:', todoStats);
  return (
    <div className="flex flex-col h-full text-white bg-gray-900">      {/* Month navigation */}      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-2 text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">{monthName} {year}</h2>
        <div className="relative group">
          <button 
            onClick={handleNextMonth}
            className={`p-2 ${
              new Date(year, month + 1, 1) <= new Date(todayDate.current.getFullYear(), todayDate.current.getMonth() + 3, 1)
              ? 'text-gray-400 hover:text-blue-400'
              : 'text-gray-600 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full`}
            aria-label="Next month"
            disabled={new Date(year, month + 1, 1) > new Date(todayDate.current.getFullYear(), todayDate.current.getMonth() + 3, 1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          {new Date(year, month + 1, 1) > new Date(todayDate.current.getFullYear(), todayDate.current.getMonth() + 3, 1) && (
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-xs text-white p-1 rounded shadow-lg whitespace-nowrap">
              Cannot navigate beyond 3 months from today
            </div>
          )}
        </div>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="py-2 text-center font-semibold text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>      {/* Calendar grid */}
      <div 
        className="grid grid-cols-7 grid-rows-5 gap-1 flex-grow transition-all duration-200"
        style={{ height: 'calc(100% - 80px)' }}
      >{days.map((day, index) => {
          // Create date string for this day to match todo.date format
          const dateStr = formatDateString(new Date(day.year, day.month, day.day));
          const stats = todoStats[dateStr] || { total: 0, completed: 0 };
          
          // Check if this is the current day (today)
          const today = new Date();
          const isCurrentDay = day.day === today.getDate() && 
                              day.month === today.getMonth() && 
                              day.year === today.getFullYear();
            
          // Handler for day cell click
          const handleDayClick = () => {
            const newDate = new Date(day.year, day.month, day.day);
            setCurrentDate(newDate);
            if (onDateChange) onDateChange(newDate);
            
            // Navigate to Todo tab with the selected date
            if (onDayClick) onDayClick(newDate);
          };

          // console.log(`[MonthGrid] Rendering day ${day.day} (${day.month + 1}/${day.year}) with stats:`, stats);
          
          return (
            <div key={`${day.month}-${day.day}-${index}`} className="h-full relative">              
                <DayCell 
                    day={day.day} 
                    isCurrentMonth={day.isCurrentMonth}
                    completedTodos={stats.completed}
                    totalTodos={stats.total}
                    onClick={handleDayClick}
                    isCurrentDay={isCurrentDay}
                    date={new Date(day.year, day.month, day.day)}
                />
            </div>
          );
        })}
      </div>
        {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
