import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { TodoItem } from '../models';

/**
 * Checks for orphaned instances - instances that have a recurrenceId 
 * but that recurrenceId doesn't exist in the recurrences collection
 * 
 * @param userId - The ID of the current user
 * @param logResults - Whether to log results to console (default: true)
 * @returns Promise with array of orphaned instances
 */
export const findOrphanedInstances = async (
  userId: string,
  logResults: boolean = true
): Promise<TodoItem[]> => {
  try {
    if (logResults) {
      console.log(`Running orphaned instance check for user: ${userId}`);
    }

    // Step 1: Get all instances with recurrenceId
    const instancesCollection = collection(db, `users/${userId}/instances`);
    const instancesWithRecurrenceQuery = query(
      instancesCollection,
      where('isRecurring', '==', true)
    );
    
    const instancesSnapshot = await getDocs(instancesWithRecurrenceQuery);
    
    if (instancesSnapshot.empty) {
      if (logResults) console.log('No recurring instances found.');
      return [];
    }

    // Step 2: Get all valid recurrence patterns
    const recurrencesCollection = collection(db, `users/${userId}/recurrences`);
    const recurrencesSnapshot = await getDocs(recurrencesCollection);
    
    // Create a Set of valid recurrence IDs for fast lookup
    const validRecurrenceIds = new Set<string>();
    recurrencesSnapshot.forEach(doc => {
      validRecurrenceIds.add(doc.id);
    });

    if (logResults) {
      console.log(`Found ${validRecurrenceIds.size} valid recurrence patterns.`);
    }

    // Step 3: Find instances with orphaned recurrenceIds
    const orphanedInstances: TodoItem[] = [];
    const allRecurringInstances: TodoItem[] = [];
    
    instancesSnapshot.forEach(doc => {
      const instance = doc.data() as TodoItem;
      instance.id = doc.id;
      
      // Add to all recurring instances for stats
      allRecurringInstances.push(instance);
      
      // If this instance has a recurrenceId that doesn't exist in our set of valid IDs
      if (instance.recurrenceId && !validRecurrenceIds.has(instance.recurrenceId)) {
        orphanedInstances.push(instance);
      }
    });

    // Step 4: Output results
    if (logResults) {
      if (orphanedInstances.length === 0) {
        console.log(`No orphaned instances found. All ${allRecurringInstances.length} recurring instances have valid recurrence patterns.`);
      } else {
        console.log(`Found ${orphanedInstances.length} orphaned instances out of ${allRecurringInstances.length} total recurring instances.`);
        
        // Group by recurrenceId for better readability
        const groupedByRecurrenceId: Record<string, TodoItem[]> = {};
        
        orphanedInstances.forEach(instance => {
          if (instance.recurrenceId) {
            if (!groupedByRecurrenceId[instance.recurrenceId]) {
              groupedByRecurrenceId[instance.recurrenceId] = [];
            }
            groupedByRecurrenceId[instance.recurrenceId].push(instance);
          }
        });
        
        // Output the groups
        Object.entries(groupedByRecurrenceId).forEach(([recurrenceId, instances]) => {
          console.log(`\nOrphaned RecurrenceId: ${recurrenceId} (${instances.length} instances):`);
          instances.forEach(instance => {
            console.log(`  - ID: ${instance.id}, Name: ${instance.name}, Date: ${instance.date}, Completed: ${instance.completed}`);
          });
        });
      }
    }
    
    return orphanedInstances;
  } catch (error) {
    console.error('Error finding orphaned instances:', error);
    throw error;
  }
};

// Optional: Add a function to fix orphaned instances (e.g., by marking them as non-recurring)
// export const fixOrphanedInstances = async (
//   userId: string,
//   orphanedInstances: TodoItem[],
//   action: 'mark-non-recurring' | 'delete' = 'mark-non-recurring'
// ): Promise<void> => {
//   // This would be implemented in a later version if needed
//   console.log(`Would fix ${orphanedInstances.length} orphaned instances with action: ${action}`);
//   // Implementation would depend on your update.ts or delete.ts services
// };

// // Create a function that runs both checks and fixes
// export const runOrphanCheck = async (userId: string): Promise<void> => {
//   console.log('Starting orphaned instance check...');
//   const orphans = await findOrphanedInstances(userId);
  
//   if (orphans.length > 0) {
//     console.log(`Found ${orphans.length} orphaned instances. To fix them, call:`);
//     console.log(`import { fixOrphanedInstances } from './services/orphanCheck';`);
//     console.log(`fixOrphanedInstances('${userId}', [...], 'mark-non-recurring');`);
//   }
  
//   console.log('Check completed.');
// };
