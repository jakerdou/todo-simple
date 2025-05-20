import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { TodoItem } from '../models';

/**
 * Checks for orphaned instances - instances that have a recurrenceId 
 * but that recurrenceId doesn't exist in the recurrences collection
 */
async function findOrphanedInstances() {
  try {
    // Ensure user is logged in
    if (!auth.currentUser) {
      console.error('No user is signed in. Please sign in before running this script.');
      return;
    }

    const userId = auth.currentUser.uid;
    console.log(`Running orphaned instance check for user: ${userId}`);

    // Step 1: Get all instances with recurrenceId
    const instancesCollection = collection(db, `users/${userId}/instances`);
    const instancesWithRecurrenceQuery = query(
      instancesCollection,
      where('recurrenceId', '!=', null)
    );
    
    const instancesSnapshot = await getDocs(instancesWithRecurrenceQuery);
    
    if (instancesSnapshot.empty) {
      console.log('No instances with recurrenceId found.');
      return;
    }

    // Step 2: Get all valid recurrence patterns
    const recurrencesCollection = collection(db, `users/${userId}/recurrences`);
    const recurrencesSnapshot = await getDocs(recurrencesCollection);
    
    // Create a Set of valid recurrence IDs for fast lookup
    const validRecurrenceIds = new Set<string>();
    recurrencesSnapshot.forEach(doc => {
      validRecurrenceIds.add(doc.id);
    });

    console.log(`Found ${validRecurrenceIds.size} valid recurrence patterns.`);

    // Step 3: Find instances with orphaned recurrenceIds
    const orphanedInstances: TodoItem[] = [];
    
    instancesSnapshot.forEach(doc => {
      const instance = doc.data() as TodoItem;
      instance.id = doc.id;
      
      // If this instance has a recurrenceId that doesn't exist in our set of valid IDs
      if (instance.recurrenceId && !validRecurrenceIds.has(instance.recurrenceId)) {
        orphanedInstances.push(instance);
      }
    });

    // Step 4: Output results
    if (orphanedInstances.length === 0) {
      console.log('No orphaned instances found. All instances with recurrenceId have a matching recurrence pattern.');
    } else {
      console.log(`Found ${orphanedInstances.length} orphaned instances:`);
      
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
        console.log(`\nRecurrenceId: ${recurrenceId} (${instances.length} instances):`);
        instances.forEach(instance => {
          console.log(`  - ID: ${instance.id}, Name: ${instance.name}, Date: ${instance.date}, Completed: ${instance.completed}`);
        });
      });
      
      console.log('\nTotal orphaned instances:', orphanedInstances.length);
    }
    
    return orphanedInstances;
  } catch (error) {
    console.error('Error finding orphaned instances:', error);
    throw error;
  }
}

/**
 * Create a script that can be run directly
 * This ensures we can handle the asynchronous nature
 */
if (require.main === module) {
  // Running as a script
  // Check if a user is already logged in, otherwise this won't work
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('No user is currently logged in. Please run this from the browser where you are already authenticated.');
    process.exit(1);
  } else {
    findOrphanedInstances()
      .then(() => {
        console.log('Script completed successfully.');
        process.exit(0);
      })
      .catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
      });
  }
}

// Export for use in other files
export { findOrphanedInstances };
