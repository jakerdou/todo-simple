import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { fetchTodoInstances } from '../../services/read';
import { refreshRecurringTodoInstances } from '../../services/create';

// Format date to YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface RecurringTodoStats {
  recurrenceId: string;
  name: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export default function MetricsTab() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [recurringTodoStats, setRecurringTodoStats] = useState<RecurringTodoStats[]>([]);
  const isInitialRender = useRef(true);
  const todayDate = useRef(new Date());
  
  // Get current month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Format month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
  // Check if the current month is more than 3 months in the future
  useEffect(() => {
    const today = todayDate.current;
    const limitDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    
    // If user somehow navigated beyond the limit, reset to the limit
    if (new Date(year, month, 1) > limitDate) {
      setCurrentDate(new Date(limitDate.getFullYear(), limitDate.getMonth(), 1));
    }
  }, [month, year]);

  // Fetch todos for the entire month when the month changes
  useEffect(() => {
    if (!currentUser) return;
    
    // In development, React StrictMode causes double rendering
    // In production, we should always fetch data regardless
    const shouldFetchData = !isInitialRender.current || process.env.NODE_ENV === 'production';
    
    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (!shouldFetchData) {
        return;
      }
    }
      const fetchRecurringTodoStats = async () => {
      try {
        setLoading(true);
        
        // Create date for first day of the month
        const firstDay = new Date(year, month, 1);
        // Create date for last day of the month
        const lastDay = new Date(year, month + 1, 0);
        
        // Limit the lastDay to today if the month is current or future
        const today = new Date();
        const effectiveLastDay = lastDay > today ? today : lastDay;
        
        // Refresh recurring todos for the month range
        await refreshRecurringTodoInstances(currentUser.uid, firstDay, effectiveLastDay);
        
        // Format dates for API
        const startDateStr = formatDateString(firstDay);
        const endDateStr = formatDateString(effectiveLastDay);
        
        // Fetch todos for the entire month (up to today)
        const monthTodos = await fetchTodoInstances(currentUser.uid, startDateStr, endDateStr);
        
        // Filter only recurring todos
        const recurringTodos = monthTodos.filter(todo => todo.isRecurring && todo.recurrenceId);
        
        // Group todos by recurrenceId
        const todosByRecurrence: { [key: string]: { name: string, todos: any[] } } = {};
        
        recurringTodos.forEach(todo => {
          const recurrenceId = todo.recurrenceId as string;
          
          if (!todosByRecurrence[recurrenceId]) {
            todosByRecurrence[recurrenceId] = {
              name: todo.name,
              todos: []
            };
          }
          
          todosByRecurrence[recurrenceId].todos.push(todo);
        });
        
        // Calculate stats for each recurring todo
        const stats: RecurringTodoStats[] = Object.entries(todosByRecurrence)
          .map(([recurrenceId, data]) => {
            const totalCount = data.todos.length;
            const completedCount = data.todos.filter(todo => todo.completed).length;
            
            return {
              recurrenceId,
              name: data.name,
              completedCount,
              totalCount,
              completionRate: totalCount > 0 ? (completedCount / totalCount) * 100 : 0
            };
          })
          // Sort by name
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setRecurringTodoStats(stats);
      } catch (err) {
        console.error('Error loading recurring todo stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecurringTodoStats();
  }, [currentUser, month, year]);

  // Handle navigation to previous month
  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
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
    } else {
      // Provide user feedback with tooltip (handled by UI)
      // console.log('Cannot navigate more than 3 months into the future');
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-900 text-white">      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Month navigation */}      
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={handlePrevMonth}
              className="p-2 text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <h3 className="text-lg font-bold">{monthName} {year}</h3>
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

          {/* Recurring Todos Stats */}          
          {recurringTodoStats.length > 0 ? (
            <div className="flex-grow overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2 text-left">Habit Name</th>
                    <th className="py-2 text-center">Completed</th>
                    <th className="py-2 text-center">Total</th>
                    <th className="py-2 text-center">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringTodoStats.map(stat => (
                    <tr key={stat.recurrenceId} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-3">{stat.name}</td>
                      <td className="py-3 text-center">{stat.completedCount}</td>
                      <td className="py-3 text-center">{stat.totalCount}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                stat.completionRate >= 85 ? 'bg-green-500' : 
                                stat.completionRate >= 70 ? 'bg-yellow-500' : 
                                stat.completionRate >= 50 ? 'bg-orange-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${stat.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{stat.completionRate.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
              {new Date(year, month, 1) > new Date() ? (
                <>
                  <p>This month is in the future.</p>
                  <p className="mt-2 text-sm">Statistics will be available once the month begins.</p>
                </>
              ) : (
                <>
                  <p>No recurring habits found for this month.</p>
                  <p className="mt-2 text-sm">Create recurring habits to track your progress here.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
