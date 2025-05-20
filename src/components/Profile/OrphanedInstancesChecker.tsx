import { useState } from 'react';
import { findOrphanedInstances } from '../../services/orphanCheck';
import { useAuth } from '../../AuthContext';
import type { TodoItem } from '../../models';

/**
 * Component for checking and displaying orphaned instances
 */
export default function OrphanedInstancesChecker() {
  const { currentUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [orphanedInstances, setOrphanedInstances] = useState<TodoItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Group orphaned instances by recurrenceId
  const groupedByRecurrenceId: Record<string, TodoItem[]> = {};
  
  orphanedInstances.forEach(instance => {
    if (instance.recurrenceId) {
      if (!groupedByRecurrenceId[instance.recurrenceId]) {
        groupedByRecurrenceId[instance.recurrenceId] = [];
      }
      groupedByRecurrenceId[instance.recurrenceId].push(instance);
    }
  });

  const handleCheckClick = async () => {
    if (!currentUser) {
      setErrorMessage('You must be logged in to check for orphaned instances');
      return;
    }

    setChecking(true);
    setErrorMessage(null);
    
    try {
      // Find orphaned instances without logging to console
      const orphans = await findOrphanedInstances(currentUser.uid, false);
      setOrphanedInstances(orphans);
    } catch (error) {
      console.error('Error checking for orphaned instances:', error);
      setErrorMessage('An error occurred while checking for orphaned instances');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-2">Database Health Check</h3>
      <p className="text-gray-300 mb-4">
        Check for orphaned instances (habit occurrences that reference deleted recurring patterns)
      </p>
      
      <button
        onClick={handleCheckClick}
        disabled={checking || !currentUser}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {checking ? 'Checking...' : 'Check for Orphaned Instances'}
      </button>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-800 text-white rounded">
          {errorMessage}
        </div>
      )}

      {orphanedInstances.length > 0 && (
        <div className="mt-4">
          <div className="p-3 bg-amber-800 text-white rounded mb-2">
            <p className="font-medium">
              Found {orphanedInstances.length} orphaned instances across {Object.keys(groupedByRecurrenceId).length} deleted recurrence patterns.
            </p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 mb-2"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {showDetails && (
            <div className="mt-2 space-y-2">
              {Object.entries(groupedByRecurrenceId).map(([recurrenceId, instances]) => (
                <div key={recurrenceId} className="p-3 bg-gray-700 rounded">
                  <h4 className="font-medium text-white">
                    Orphaned RecurrenceId: {recurrenceId} ({instances.length} instances)
                  </h4>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs text-gray-400 uppercase">
                        <tr>
                          <th className="px-2 py-1">Name</th>
                          <th className="px-2 py-1">Date</th>
                          <th className="px-2 py-1">Completed</th>
                          <th className="px-2 py-1">ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instances.map(instance => (
                          <tr key={instance.id} className="border-t border-gray-600">
                            <td className="px-2 py-1">{instance.name}</td>
                            <td className="px-2 py-1">{instance.date}</td>
                            <td className="px-2 py-1">{instance.completed ? 'Yes' : 'No'}</td>
                            <td className="px-2 py-1 text-xs text-gray-400">{instance.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {orphanedInstances.length === 0 && !checking && !errorMessage && orphanedInstances !== undefined && (
        <div className="mt-4 p-3 bg-green-800 text-white rounded">
          No orphaned instances found. Your database is healthy!
        </div>
      )}
    </div>
  );
}
