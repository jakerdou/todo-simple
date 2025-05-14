import { Timestamp } from 'firebase/firestore';

export interface TodoItem {
  id?: string;
  name: string;
  date: string;  // YYYY-MM-DD format
  completed: boolean;
  recurrenceId: string | null;
  createdAt?: Timestamp;
}
