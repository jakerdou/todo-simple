import { useState } from 'react';
import AddTodoDialog from './AddTodoDialog';

export default function TodoTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClick = () => {
    console.log('Add button clicked');
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 relative h-full flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Todo List</h2>
        <p>Your todo items will appear here.</p>
        {/* Todo items will be added here */}
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
        </button>      </div>
      
      {/* Add the dialog component */}
      <AddTodoDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}
