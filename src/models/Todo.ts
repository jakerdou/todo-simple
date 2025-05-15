import { Timestamp } from 'firebase/firestore';

export interface TodoItem {
  id?: string;
  name: string;
  date: string;  // YYYY-MM-DD format
  completed: boolean;
  createdAt?: Timestamp;
  isRecurring?: boolean;
  recurrenceId?: string | null;
}

export interface RecurrencePattern {
  id?: string;
  name: string;
  rrule: string;
  createdAt?: Timestamp;
}
