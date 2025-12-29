import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { TodoItem, RecurrencePattern } from '../models';
import { RRule } from 'rrule';

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

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
      isRecurring: false,
      recurrenceId: null,
      createdAt: serverTimestamp() as Timestamp,
      editedAt: null
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
 * Adds a new recurring todo pattern and generates upcoming instances
 * @param userId - The ID of the current user
 * @param name - The name/title of the todo
 * @param rruleString - The RRule string representing the recurrence pattern
 * @param startsOn - The date when the recurrence should start (YYYY-MM-DD format)
 * @returns Promise with the recurrence pattern document reference
 */
export const addRecurringTodo = async (
  userId: string,
  name: string,
  rruleString: string,
  startsOn: string,
) => {
  try {
    // Create the recurrence pattern
    const recurrenceData: RecurrencePattern = {
      name,
      rrule: rruleString,
      startsOn,
      createdAt: serverTimestamp() as Timestamp,
      editedAt: null,
      exceptions: {} // Initialize empty exceptions object
    };

    // Get reference to the user's recurrences collection
    const recurrencesCollectionRef = collection(db, `users/${userId}/recurrences`);
    
    // Add the recurrence pattern to Firestore
    const recurrenceDocRef = await addDoc(recurrencesCollectionRef, recurrenceData);
    const recurrenceId = recurrenceDocRef.id;
    console.log('Recurrence pattern added with ID: ', recurrenceId);
      // Generate at least today's instance to ensure it appears immediately
    const today = new Date();
    
    // Get just today's date without time component
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      // Convert startsOn string to Date object without timezone issues
    const [year, month, day] = startsOn.split('-').map(Number);
    const startsOnDate = new Date(year, month - 1, day); // month is 0-based in JS Date
    startsOnDate.setHours(0, 0, 0, 0);
    
    // Use the later of today or startsOn date as our generation start date
    const generationStartDate = startsOnDate > todayStart ? startsOnDate : todayStart;
    
    // Generate instances starting from the appropriate date
    await generateTodoInstances(
      userId,
      recurrenceId,
      name,
      rruleString,
      generationStartDate
    );
    
    return recurrenceDocRef;  } catch (error) {
    console.error('Error adding recurring todo: ', error);
    throw error;
  }
};

/**
 * Generates todo instances based on a recurrence pattern
 * @param userId - The ID of the current user
 * @param recurrenceId - The ID of the recurrence pattern
 * @param name - The name/title of the todo
 * @param rruleString - The RRule string representing the recurrence pattern
 * @param startDate - Date to start generating from (defaults to today)
 * @param endDate - Optional end date to stop generating at
 * @param startsOnDate - Optional date when the recurrence officially starts (to avoid generating instances before this date)
 */
export const generateTodoInstances = async (
  userId: string,
  recurrenceId: string,
  name: string,
  rruleString: string,
  startDate: Date = new Date(),
  endDate?: Date,
  startsOnDate?: Date
) => {
  try {
    // console.log('start date', startDate, 'starts on date', startsOnDate);
    // Parse the RRule string
    const parsedRule = RRule.fromString(rruleString);
    
    // Adjust start date to beginning of day to ensure we capture all events
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);
    // If startsOnDate is provided, use the later of adjustedStartDate or startsOnDate
    if (startsOnDate) {
      // startsOnDate is already a Date object here, just create a new instance to avoid modifying original
      const adjustedStartsOnDate = new Date(startsOnDate);
      adjustedStartsOnDate.setHours(0, 0, 0, 0);
      if (adjustedStartsOnDate > adjustedStartDate) {
        adjustedStartDate.setTime(adjustedStartsOnDate.getTime());
      }
    }

    // IMPORTANT: Anchor the recurrence rule to the series start.
    // If the RRULE string has no DTSTART, rrule defaults DTSTART to "now",
    // which prevents generating occurrences earlier in the current month.
    // When refreshing, we pass startsOnDate from the stored pattern.
    const rule = startsOnDate
      ? new RRule({
          ...(((parsedRule as any).origOptions ?? parsedRule.options) as any),
          dtstart: (() => {
            const dt = new Date(startsOnDate);
            dt.setHours(0, 0, 0, 0);
            return dt;
          })()
        })
      : parsedRule;
      
    // Get occurrences based on the provided parameters
    let occurrences: Date[];
      if (endDate) {
      // If we have both start and end dates, get instances between them, inclusive
      // Set the end date to 11:59:59 PM to include the entire end date
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      console.log('adjustedStartDate', adjustedStartDate, 'adjustedEndDate', adjustedEndDate);
      console.log('rule', rule)
      occurrences = rule.between(adjustedStartDate, adjustedEndDate, true);
      console.log('occurences', occurrences);
    } else {
      // If no end date, generate just for the start date (for one day)
      const nextDay = new Date(adjustedStartDate);
      nextDay.setDate(nextDay.getDate() + 1);
      occurrences = rule.between(adjustedStartDate, nextDay, true);
    }
    
    const instancesCollectionRef = collection(db, `users/${userId}/instances`);
    // Get the recurrence pattern to check for exceptions
    const recurrencesCollectionRef = collection(db, `users/${userId}/recurrences`);
    const recurrenceDocRef = doc(recurrencesCollectionRef, recurrenceId);
    const recurrenceDoc = await getDoc(recurrenceDocRef);
    
    if (!recurrenceDoc.exists()) {
      throw new Error(`Recurrence pattern with ID ${recurrenceId} not found.`);
    }
    
    const recurrenceData = recurrenceDoc.data();
    const exceptions = recurrenceData.exceptions || {};
    
    // Check if we already have instances for this recurrence pattern
    const existingInstancesQuery = query(
      instancesCollectionRef, 
      where("recurrenceId", "==", recurrenceId)
    );
    const existingInstancesSnapshot = await getDocs(existingInstancesQuery);
    const existingDates = new Set(
      existingInstancesSnapshot.docs.map(doc => doc.data().date)
    );
   
    let occurencesCreated = 0;
    // Create a batch of todo instances for each occurrence date
    const createInstancePromises = occurrences.map(date => {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Skip if we already have an instance for this date or it's in exceptions as deleted
      if (existingDates.has(dateString) || (exceptions[dateString] && exceptions[dateString].type === 'deleted')) {
        if (exceptions[dateString]) {
          console.log(`Skipping instance for ${dateString} due to exception:`, exceptions[dateString]);
        }
        return Promise.resolve(null);
      }
      
      // Create recurring todo instance
      const todoData: TodoItem = {
        name,
        date: dateString,
        completed: false,
        isRecurring: true,
        recurrenceId,
        createdAt: serverTimestamp() as Timestamp,
        editedAt: null
      };
      
      occurencesCreated++;
      return addDoc(instancesCollectionRef, todoData);
    });
    
    await Promise.all(createInstancePromises);
    
    // console.log(`Generated ${occurencesCreated} todo instances`);
  } catch (error) {
    console.error('Error generating todo instances: ', error);
    throw error;
  }
};

/**
 * Regenerates instances for all recurrence patterns or a specific pattern
 * @param userId - The ID of the current user
 * @param startDate - The date to generate instances for
 * @param endDate - Optional end date to stop generating at
 */
export const refreshRecurringTodoInstances = async (
  userId: string,
  startDate: Date = new Date(),
  endDate?: Date
) => {
  try {
    // Fetch all recurrence patterns
    const patterns = await fetchRecurrencePatterns(userId);
    
    if (patterns.length === 0) {
      console.log('No recurrence patterns found.');
      return;
    }
      // Generate instances for each pattern for the specified date
    const refreshPromises = patterns.map(pattern => {
      // console.log('pattern', pattern);
      // Parse the date without timezone conversion by splitting and extracting parts
      const [year, month, day] = pattern.startsOn.split('-').map(Number);
      const startsOnDate = new Date(year, month - 1, day); // month is 0-based in JS Date
      return generateTodoInstances(
        userId,
        pattern.id!,
        pattern.name,
        pattern.rrule,
        startDate,
        endDate,
        startsOnDate // Pass the startsOn date from the pattern
      );
    });
    
    await Promise.all(refreshPromises);
    // console.log(`Refreshed instances for ${patterns.length} recurrence patterns.`);
  } catch (error) {
    console.error('Error refreshing recurring todo instances: ', error);
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
        startsOn: data.startsOn || getTodayDate(), // Default to today if not found (for backward compatibility)
        createdAt: data.createdAt,
        editedAt: data.editedAt || null,
        exceptions: data.exceptions || {} // Include exceptions or default to empty object
      });
    });
    
    return patterns;
  } catch (error) {
    console.error('Error fetching recurrence patterns: ', error);
    throw error;
  }
};
