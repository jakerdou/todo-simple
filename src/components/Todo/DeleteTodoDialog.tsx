import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface DeleteTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todoName: string;
  isRecurring: boolean;
  onDeleteConfirm: () => void;
}

export default function DeleteTodoDialog({ 
  isOpen, 
  onClose, 
  todoName, 
  isRecurring,
  onDeleteConfirm 
}: DeleteTodoDialogProps) {
  
  const handleDelete = () => {
    onDeleteConfirm();
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                  Delete Todo
                </DialogTitle>
                
                <div className="mt-2">                  <p className="text-sm text-gray-300">
                    Are you sure you want to delete "{todoName}"?
                  </p>
                  
                  {isRecurring && (
                    <div className="mt-4 bg-red-900/30 border border-red-700 p-4 rounded-md">
                      <p className="text-sm text-red-300 font-medium mb-2">
                        Warning: This is a recurring todo
                      </p>
                      <p className="text-sm text-gray-300 mb-4">
                        Deleting this todo will permanently remove all occurrences from your schedule.
                        This action cannot be reversed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={() => handleDelete()}
                  >
                    {isRecurring ? 'Delete All Occurrences' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-500 hover:bg-gray-600 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
