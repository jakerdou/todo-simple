import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Toggles the completion status of a todo instance
 * @param userId - The ID of the current user
 * @param todoId - The ID of the todo instance
 * @param completed - The new completed status
 */
export const toggleTodoCompleted = async (
  userId: string,
  todoId: string,
  completed: boolean
) => {
  try {
    const todoDocRef = doc(db, `users/${userId}/instances/${todoId}`);
    await updateDoc(todoDocRef, { completed });
    console.log(`Todo ${todoId} updated, completed: ${completed}`);
  } catch (error) {
    console.error('Error updating todo: ', error);
    throw error;
  }
};
