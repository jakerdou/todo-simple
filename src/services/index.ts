import type { TodoItem, RecurrencePattern } from '../models';

/**
 * Todo Services API
 * 
 * The services are organized by CRUD operations:
 * 
 * - create.ts: Functions for creating todos and recurrence patterns
 * - read.ts: Functions for fetching and generating todos
 * - update.ts: Functions for updating existing todos
 * - delete.ts: Functions for deleting todos and recurrence patterns
 * 
 * You can import from specific files:
 * `import { addTodoInstance } from '../../services/create';`
 * 
 * Or import everything from the index:
 * `import { addTodoInstance, fetchTodoInstances } from '../../services';`
 */

// Re-export all functions from CRUD files
export * from './create';
export * from './read';
export * from './update';
export * from './delete';

/**
 * Function Reference (for documentation purposes)
 */

/**
 * Create Operations
 */

// Adds a new todo instance to the user's instances collection in Firestore
export declare function addTodoInstance(
  userId: string,
  name: string,
  date: string
): Promise<any>;

// Adds a new recurring todo pattern and generates upcoming instances
export declare function addRecurringTodo(
  userId: string,
  name: string,
  rruleString: string,
  _unused?: number
): Promise<any>;

/**
 * Read Operations
 */

// Fetches todo instances for a user within a date range
export declare function fetchTodoInstances(
  userId: string, 
  startDate: string,
  endDate?: string
): Promise<TodoItem[]>;

// Fetches all recurrence patterns for a user
export declare function fetchRecurrencePatterns(
  userId: string
): Promise<RecurrencePattern[]>;

// Generates todo instances based on a recurrence pattern
export declare function generateTodoInstances(
  userId: string,
  recurrenceId: string,
  name: string,
  rruleString: string,
  _unused?: number,
  startDate?: Date,
  endDate?: Date
): Promise<void>;

// Regenerates instances for all recurrence patterns or a specific pattern
export declare function refreshRecurringTodoInstances(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<void>;

/**
 * Update Operations
 */

// Toggles the completion status of a todo instance
export declare function toggleTodoCompleted(
  userId: string, 
  todoId: string, 
  completed: boolean
): Promise<void>;

/**
 * Delete Operations
 */

// Deletes a single todo instance
export declare function deleteTodoInstance(
  userId: string,
  todoId: string
): Promise<void>;

// Deletes a recurring todo pattern and optionally all of its instances
export declare function deleteRecurringTodo(
  userId: string,
  recurrenceId: string,
  deleteInstances?: boolean
): Promise<void>;
