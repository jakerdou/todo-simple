// filepath: c:\Users\james\dev\todo-simple\src\services\read.ts
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { TodoItem, RecurrencePattern } from '../models';

/**
 * Fetches todo instances for a user within a date range
 * @param userId - The ID of the current user
 * @param startDate - The start date in YYYY-MM-DD format
 * @param endDate - Optional end date in YYYY-MM-DD format. If provided, fetches todos between startDate and endDate.
 * @returns Promise with an array of todo items
 */
export const fetchTodoInstances = async (
  userId: string, 
  startDate: string,
  endDate?: string
): Promise<TodoItem[]> => {
  try {
    const instancesCollectionRef = collection(db, `users/${userId}/instances`);
    let q;
    
    if (endDate) {
      // If endDate is provided, fetch todos between startDate and endDate (inclusive)
      q = query(
        instancesCollectionRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
    } else {
      // If only startDate is provided, fetch todos for that specific date
      q = query(
        instancesCollectionRef,
        where('date', '==', startDate),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const todos: TodoItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      todos.push({
        id: doc.id,
        name: data.name,
        date: data.date,
        completed: data.completed,
        isRecurring: data.isRecurring || false,
        recurrenceId: data.recurrenceId || null,
        createdAt: data.createdAt
      });
    });
    
    return todos;
  } catch (error) {
    console.error('Error fetching todos: ', error);
    throw error;
  }
};

/**
 * Fetches all recurrence patterns for a user
 * @param userId - The ID of the current user
 * @returns Promise with an array of recurrence patterns
 */
export const fetchRecurrencePatterns = async (userId: string): Promise<RecurrencePattern[]> => {
  try {
    const recurrencesCollectionRef = collection(db, `users/${userId}/recurrences`);
    const q = query(recurrencesCollectionRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const patterns: RecurrencePattern[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      patterns.push({
        id: doc.id,
        name: data.name,
        rrule: data.rrule,
        createdAt: data.createdAt
      });
    });
    
    return patterns;
  } catch (error) {
    console.error('Error fetching recurrence patterns: ', error);
    throw error;
  }
};
