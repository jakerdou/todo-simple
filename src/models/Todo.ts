import { Timestamp } from 'firebase/firestore';

export interface TodoItem {
  id?: string;
  name: string;
  date: string;  // YYYY-MM-DD format
  completed: boolean;
  createdAt: Timestamp;
  editedAt: Timestamp | null;
  isRecurring?: boolean;
  recurrenceId?: string | null;
}

export interface RecurrencePattern {
  id?: string;
  name: string;
  rrule: string;
  startsOn: string;  // YYYY-MM-DD format for the start date
  createdAt: Timestamp;
  editedAt: Timestamp | null;
}
