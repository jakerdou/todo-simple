import { Dialog } from '@headlessui/react';

interface TodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TodoDialog({ isOpen, onClose }: TodoDialogProps) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      as="div" 
      className="relative z-50"
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container for centering the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Dialog panel */}
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl w-full transform transition-all duration-300">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Add New Todo
          </Dialog.Title>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              This is a simple dialog to add a new todo item. You can add form elements here 
              like input fields for the todo title, description, due date, etc.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p className="text-sm font-medium text-gray-700">Dummy Content</p>
              <p className="text-sm text-gray-500 mt-1">
                This is just some placeholder content. In a real implementation, you would have 
                form controls here to collect information about the new todo item.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                console.log('Todo added');
                onClose();
              }}
            >
              Add Todo
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
