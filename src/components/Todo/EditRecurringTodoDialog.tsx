import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import type { TodoItem } from '../../models/Todo';
import { formatDateForDisplay } from '../../utils/dateUtils';

interface EditRecurringTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todo: TodoItem | null;
  onEditThis: (todo: TodoItem) => void;
  onEditThisAndFuture: (todo: TodoItem) => void;
}

export default function EditRecurringTodoDialog({ 
  isOpen, 
  onClose, 
  todo, 
  onEditThis, 
  onEditThisAndFuture 
}: EditRecurringTodoDialogProps) {
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
          as="div"
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
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >            
            <DialogPanel className="mx-auto max-w-sm rounded-lg bg-gray-800 p-5 shadow-xl w-full border border-gray-700">              <div className="mb-4">
                <h3 className="text-lg font-medium text-white">Edit Recurring Todo</h3>
                <p className="text-sm text-gray-300 mt-2">
                  "{todo.name}" is a recurring todo. How would you like to apply your changes?
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    onEditThis(todo);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >                  <div className="text-left">
                    <div className="font-medium">This instance only</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Only change this specific occurrence on {formatDateForDisplay(todo.date)}
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    onEditThisAndFuture(todo);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="text-left">
                    <div className="font-medium">This and future instances</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Change this and all future occurrences of this habit
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Transition>
    </Dialog>
  );
}
