import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useState } from 'react';
// import { useState, Fragment } from 'react';
import { useAuth } from '../../AuthContext';
import RecurrenceForm from './RecurrenceForm';
import { addTodoInstance, addRecurringTodo } from '../../services/create';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

interface AddTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export default function AddTodoDialog({ isOpen, onClose, selectedDate }: AddTodoDialogProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => {
    if (selectedDate) {
      return selectedDate.toISOString().split('T')[0];
    }
    return getTodayDate();
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [rruleString, setRruleString] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isRecurring && rruleString) {
        // Add as a recurring todo
        await addRecurringTodo(currentUser.uid, name, rruleString);
      } else {
        // Add as a regular todo
        await addTodoInstance(currentUser.uid, name, date);
      }      
      // Reset form
      setName('');
      setDate(selectedDate ? selectedDate.toISOString().split('T')[0] : getTodayDate());
      setIsRecurring(false);
      setRruleString(null);
      onClose();
    } catch (error) {
      console.error('Failed to add todo: ', error);
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <DialogPanel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-5 shadow-xl w-full border border-gray-700">
              <DialogTitle className="text-lg font-medium text-white">
                New Todo
              </DialogTitle>
              
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="todo-name" className="block text-sm font-medium text-gray-300">
                      Name
                    </label>
                    <div className="mt-1 flex items-center space-x-3">
                      <input
                        type="text"
                        id="todo-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="What needs to be done?"
                        required
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center whitespace-nowrap min-w-[30%]">
                        <label htmlFor="todo-recurring" className="text-sm font-medium text-gray-300 select-none cursor-pointer mr-2">
                          Recurring
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input
                            type="checkbox"
                            id="todo-recurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="sr-only peer"
                            disabled={isSubmitting}
                          />
                          <div 
                            onClick={() => !isSubmitting && setIsRecurring(!isRecurring)}
                            className="h-6 w-11 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 cursor-pointer"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!isRecurring && (                
                    <div>
                      <label htmlFor="todo-date" className="block text-sm font-medium text-gray-300">
                        Date
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="date"
                            id="todo-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                            disabled={isSubmitting}
                          />
                      </div>
                    </div>
                  )}
                  
                  {/* Recurrence Form */}
                  {isRecurring && (
                    <RecurrenceForm 
                      isRecurring={isRecurring}
                      onChange={setRruleString}
                    />
                  )}
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                    onClick={() => {
                      // Reset form
                      setName('');
                      setDate(getTodayDate());
                      setIsRecurring(false);
                      setRruleString(null);
                      onClose();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add'}
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
