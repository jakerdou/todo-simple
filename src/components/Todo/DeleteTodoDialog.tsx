import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useState } from 'react';

interface DeleteTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todoName: string;
  isRecurring: boolean;
  onDeleteConfirm: (deleteOption?: 'instance' | 'series') => void;
}

export default function DeleteTodoDialog({ 
  isOpen, 
  onClose, 
  todoName, 
  isRecurring,
  onDeleteConfirm 
}: DeleteTodoDialogProps) {
  const [selectedOption, setSelectedOption] = useState<'instance' | 'series'>('instance');
  
  const handleDelete = () => {
    // For recurring todos, pass the selected option, otherwise just call the function with no args
    if (isRecurring) {
      onDeleteConfirm(selectedOption);
    } else {
      onDeleteConfirm();
    }
    onClose();
  };

  return (
    <Transition show={isOpen} as='div'>
    {/* <Transition show={isOpen} as={Fragment}> */}      
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as='div'
          // as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">            
            <TransitionChild
              as='div'
              // as={Fragment}
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
                  <div className="mt-2">
                  <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to delete "{todoName}"?
                  </p>
                  
                  {isRecurring ? (
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-700/50 border border-gray-600 p-4 rounded-md">
                        <p className="text-sm text-blue-300 font-medium mb-2">
                          This is a recurring todo
                        </p>
                        <p className="text-sm text-gray-300 mb-4">
                          Please choose one of the following options:
                        </p>
                        
                        <fieldset className="space-y-3">
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="delete-instance"
                                name="delete-option"
                                type="radio"
                                checked={selectedOption === 'instance'}
                                onChange={() => setSelectedOption('instance')}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor="delete-instance" className="font-medium text-gray-200">
                                Delete just this instance
                              </label>
                              <p className="text-gray-400">
                                This will only remove this specific occurrence. Future occurrences will still be generated.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="delete-series"
                                name="delete-option"
                                type="radio"
                                checked={selectedOption === 'series'}
                                onChange={() => setSelectedOption('series')}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor="delete-series" className="font-medium text-gray-200">
                                Delete entire series
                              </label>
                              <p className="text-gray-400">
                                This will permanently remove all occurrences of this todo from your schedule. This action cannot be undone.
                              </p>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-red-900/30 border border-red-700 p-4 rounded-md">
                      <p className="text-sm text-gray-300">
                        This action cannot be undone.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={() => handleDelete()}
                  >
                    {isRecurring ? (selectedOption === 'instance' ? 'Delete This Instance' : 'Delete Entire Series') : 'Delete'}
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
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
