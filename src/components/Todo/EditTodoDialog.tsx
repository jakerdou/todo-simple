import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import type { TodoItem } from '../../models';

interface EditTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoItem | null;
  onSave: (updatedTodo: TodoItem) => void;
}

export default function EditTodoDialog({ isOpen, onClose, todo, onSave }: EditTodoDialogProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  // Update form when todo changes
  useEffect(() => {
    if (todo) {
      setName(todo.name);
      setDate(todo.date);
    }
  }, [todo]);
  
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !todo) {
      console.error('No user logged in or no todo to edit');
      return;
    }
    
    // Validate that todos can't be created in the past
    // Parse the selected date using local timezone
    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
    
    // Get today's date at midnight in local timezone
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setDateError("Cannot set tasks in the past. Please select today or a future date.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the updated todo object
      const updatedTodo: TodoItem = {
        ...todo,
        name,
        date,
        editedAt: todo.editedAt // This will be updated in the service function
      };
      
      // Call the passed-in save function
      onSave(updatedTodo);
      
      // Reset form and close dialog
      setDateError(null);
      onClose();
    } catch (error) {
      console.error('Failed to update todo: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!todo) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      as="div" 
      className="relative z-50"
    >
      <Transition show={isOpen} as="div">
        {/* Background overlay */}
        <TransitionChild
          as='div'
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </TransitionChild>
        
        {/* Full-screen container for centering the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Dialog panel */}
          <TransitionChild
            as='div'
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >            
            <DialogPanel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-5 shadow-xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-4">Edit Todo</h3>
              
              <form onSubmit={handleSubmit} className="mt-2">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-todo-name" className="block text-sm font-medium text-gray-300">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="edit-todo-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="What needs to be done?"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="edit-todo-date" className="block text-sm font-medium text-gray-300">
                      Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="date"
                        id="edit-todo-date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setDateError(null); // Clear error when date changes
                        }}
                        className={`block w-full rounded-md border ${dateError ? 'border-red-500' : 'border-gray-600'} bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 ${dateError ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                        required
                        disabled={isSubmitting}
                        min={getTodayDate()} // Set minimum date to today
                      />
                    </div>
                    {dateError && (
                      <p className="mt-1 text-sm text-red-500">{dateError}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Transition>
    </Dialog>
  );
}
