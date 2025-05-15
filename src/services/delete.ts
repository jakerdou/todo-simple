import { collection, query, where, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Deletes a single todo instance
 * @param userId - The ID of the current user
 * @param todoId - The ID of the todo instance to delete
 * @returns Promise that resolves when the todo is deleted
 */
export const deleteTodoInstance = async (
  userId: string,
  todoId: string
): Promise<void> => {
  try {
    const todoRef = doc(db, `users/${userId}/instances/${todoId}`);
    await deleteDoc(todoRef);
    console.log('Todo instance deleted:', todoId);
  } catch (error) {
    console.error('Error deleting todo instance:', error);
    throw error;
  }
};

/**
 * Deletes a recurring todo pattern and optionally all of its instances
 * @param userId - The ID of the current user
 * @param recurrenceId - The ID of the recurrence pattern to delete
 * @param deleteInstances - Whether to also delete all instances of this recurring todo
 * @returns Promise that resolves when the recurring todo is deleted
 */
export const deleteRecurringTodo = async (
  userId: string,
  recurrenceId: string,
  deleteInstances: boolean = false
): Promise<void> => {
  try {
    // Create a batch to group operations for atomicity
    const batch = writeBatch(db);
      
    // Add recurrence pattern deletion to the batch
    const patternRef = doc(db, `users/${userId}/recurrences/${recurrenceId}`);
    batch.delete(patternRef);
    
    // If requested, find and delete all instances of this recurring todo
    if (deleteInstances) {
      const instancesCollectionRef = collection(db, `users/${userId}/instances`);
      const q = query(
        instancesCollectionRef,
        where('recurrenceId', '==', recurrenceId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} instances to delete`);
      
      // Add each instance deletion to the batch
      querySnapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
    }
      
    // Commit all the operations as a single unit
    await batch.commit();
    console.log('Recurring todo pattern and instances deleted successfully from recurrences collection');
  } catch (error) {
    console.error('Error deleting recurring todo:', error);
    throw error;
  }
};
