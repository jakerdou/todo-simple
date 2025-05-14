import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { TodoItem } from '../models';

/**
 * Adds a new todo instance to the user's instances collection in Firestore
 * @param userId - The ID of the current user
 * @param name - The name/title of the todo item
 * @param date - The date of the todo in YYYY-MM-DD format
 * @returns Promise with the new document reference
 */
export const addTodoInstance = async (
  userId: string,
  name: string,
  date: string
) => {
  try {
    // Create a new todo object
    const todoData: TodoItem = {
      name,
      date,
      completed: false,
      recurrenceId: null,
      createdAt: serverTimestamp() as Timestamp
    };

    // Get reference to the user's instances collection
    const instancesCollectionRef = collection(db, `users/${userId}/instances`);
    
    // Add the document to Firestore
    const docRef = await addDoc(instancesCollectionRef, todoData);
    
    console.log('Todo added with ID: ', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding todo: ', error);
    throw error;
  }
};

/**
 * Fetches all todo instances for a user
 * @param userId - The ID of the current user
 * @returns Promise with an array of todo items
 */
export const fetchTodoInstances = async (userId: string): Promise<TodoItem[]> => {
  try {
    const instancesCollectionRef = collection(db, `users/${userId}/instances`);
    const q = query(instancesCollectionRef, orderBy('date', 'asc'));
    
    const querySnapshot = await getDocs(q);
    
    const todos: TodoItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      todos.push({
        id: doc.id,
        name: data.name,
        date: data.date,
        completed: data.completed,
        recurrenceId: data.recurrenceId,
        createdAt: data.createdAt
      });
    });
    
    return todos;
  } catch (error) {
    console.error('Error fetching todos: ', error);
    throw error;
  }
};
