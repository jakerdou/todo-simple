import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import AddTodoDialog from './AddTodoDialog';
import DeleteTodoDialog from './DeleteTodoDialog';
import DatePicker from './DatePicker';
import { Menu, Transition } from '@headlessui/react';
// import { Menu, Transition, TransitionChild } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { fetchTodoInstances } from '../../services/read';
import { refreshRecurringTodoInstances } from '../../services/create';
import { toggleTodoCompleted } from '../../services/update';
import { deleteTodoInstance, deleteRecurringTodo } from '../../services/delete';
import type { TodoItem } from '../../models';

interface TodoTabProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export default function TodoTab({ selectedDate, setSelectedDate }: TodoTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  // Format date as YYYY-MM-DD for Firestore query using local time
  const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // Fetch todos when the component mounts, when the dialog closes, or when selected date changes
  useEffect(() => {
    if (!currentUser || isDialogOpen) return;    
    const loadTodos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create a date object for the start of the selected day
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        // Refresh recurring todos for the selected date
        await refreshRecurringTodoInstances(currentUser.uid, startOfDay);
        
        // Then fetch todos for the selected date
        const dateString = getDateString(selectedDate);
        const fetchedTodos = await fetchTodoInstances(currentUser.uid, dateString);
        setTodos(fetchedTodos);
      } catch (err) {
        console.error('Error loading todos:', err);
        setError('Failed to load your todos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTodos();
  }, [currentUser, isDialogOpen, selectedDate]); // Reload when the dialog closes or date changes

  const handleAddClick = () => {
    setIsDialogOpen(true);
  };
  const handleToggleCompleted = async (todoId: string, currentStatus: boolean) => {
    if (!currentUser || !todoId) return;
    
    try {
      // Optimistically update the UI
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === todoId ? { ...todo, completed: !currentStatus } : todo
        )
      );
      
      // Update in the database
      await toggleTodoCompleted(currentUser.uid, todoId, !currentStatus);
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      
      // Revert the UI change on error
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === todoId ? { ...todo, completed: currentStatus } : todo
        )
      );
    }
  };

  const handleOpenDeleteDialog = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setIsDeleteDialogOpen(true);
  };

  const handleEditTodo = (todo: TodoItem) => {
    // For now just log to console as per requirements
    console.log("Editing todo:", todo.name);
  };  const handleDeleteConfirm = async () => {
    if (!currentUser || !selectedTodo || !selectedTodo.id) return;
    
    try {
      if (selectedTodo.isRecurring && selectedTodo.recurrenceId) {
        // For recurring todos, always delete all instances
        await deleteRecurringTodo(currentUser.uid, selectedTodo.recurrenceId, true);
      } else {
        // Delete a regular non-recurring todo
        await deleteTodoInstance(currentUser.uid, selectedTodo.id);
      }
      
      // Refresh the todos list
      const dateString = getDateString(selectedDate);
      const updatedTodos = await fetchTodoInstances(currentUser.uid, dateString);
      setTodos(updatedTodos);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete the todo. Please try again.');
    }
  };

  return (
    <div className="p-4 relative h-full flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Todo List</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-md p-3 text-sm">
            {error}
          </div>
        ) : todos.length === 0 ? (
          <div>
            <DatePicker 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            <div className="text-center py-8 text-gray-400">
              <p>No todos for {selectedDate.toLocaleDateString()}. Add a new todo!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <DatePicker 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
              <ul className="space-y-2">
              {todos.map(todo => (                <li 
                  key={todo.id} 
                  className="bg-gray-700 rounded-md p-3 flex items-center shadow-sm cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleToggleCompleted(todo.id!, todo.completed)}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent the li onClick from firing too
                      handleToggleCompleted(todo.id!, todo.completed);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded mr-3"
                  />
                  <div className="flex-1">
                    <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {todo.name}
                    </span>
                    
                    {/* {todo.isRecurring && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300">
                        Recurring
                      </span>
                    )} */}
                  </div>
                    <Menu as="div" className="relative ml-3">
                    <Menu.Button 
                      className="flex items-center rounded-full p-1 text-gray-400 hover:text-white hover:bg-gray-600"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                    >
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>                    
                    <Transition
                    // <TransitionChild
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent toggling todo completion
                                handleEditTodo(todo);
                              }}
                              className={`${
                                active ? 'bg-gray-700' : ''
                              } flex w-full px-4 py-2 text-sm text-white`}
                            >
                              Edit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent toggling todo completion
                                handleOpenDeleteDialog(todo);
                              }}
                              className={`${
                                active ? 'bg-gray-700' : ''
                              } flex w-full px-4 py-2 text-sm text-red-400`}
                            >
                              Delete
                            </button>
                          )}
                        </Menu.Item>                      </Menu.Items>
                    </Transition>
                    {/* </TransitionChild> */}
                  </Menu>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Add button positioned at the bottom of the content area */}
      <div className="flex justify-center py-4">
        <button
          onClick={handleAddClick}
          className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          aria-label="Add new todo"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
        {/* Add the dialog component */}      <AddTodoDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        selectedDate={selectedDate}
      />
      {selectedTodo && (
        <DeleteTodoDialog 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)}
          todoName={selectedTodo.name}
          isRecurring={selectedTodo.isRecurring || false}
          onDeleteConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
