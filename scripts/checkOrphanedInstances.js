// This is a Node.js script that can be run from the command line
// to check for orphaned instances using the Firebase Admin SDK

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Create a require function for loading JSON
const require = createRequire(import.meta.url);

// Create the log file path
const logFilePath = path.resolve('./orphaned-instances.log');

// Check if service account path was provided
if (process.argv.length < 3) {
  console.error('Please provide the path to your Firebase service account key file:');
  console.error('node checkOrphanedInstances.js path/to/serviceAccountKey.json userId');
  process.exit(1);
}

// Service account file path
const serviceAccountPath = process.argv[2];

// Optional userId (if not provided, will check all users)
const specificUserId = process.argv[3];

// Initialize Firebase Admin with service account
try {
  // Load the service account JSON file
  const serviceAccount = require(path.resolve(serviceAccountPath));
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK initialized.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

const db = getFirestore();

/**
 * Find orphaned instances for a specific user
 * @param {string} userId - User ID to check
 * @returns {Promise<Array>} - Array of orphaned instances
 */
async function findOrphanedInstancesForUser(userId) {
  try {
    console.log(`Checking orphaned instances for user: ${userId}`);
    
    // Step 1: Get all instances with recurrenceId for this user
    const instancesQuery = db.collection(`users/${userId}/instances`)
                             .where('isRecurring', '==', true);
    
    const instancesSnapshot = await instancesQuery.get();
    
    if (instancesSnapshot.empty) {
      console.log(`No recurring instances found for user: ${userId}`);
      return [];
    }
    
    console.log(`Found ${instancesSnapshot.size} recurring instances for user: ${userId}`);
    
    // Step 2: Get all valid recurrence patterns for this user
    const recurrencesSnapshot = await db.collection(`users/${userId}/recurrences`).get();
    
    // Create a Set of valid recurrence IDs for fast lookup
    const validRecurrenceIds = new Set();
    recurrencesSnapshot.forEach(doc => {
      validRecurrenceIds.add(doc.id);
    });
    
    console.log(`Found ${validRecurrenceIds.size} valid recurrence patterns for user: ${userId}`);
    
    // Step 3: Find instances with orphaned recurrenceIds
    const orphanedInstances = [];
    
    instancesSnapshot.forEach(doc => {
      const instance = doc.data();
      instance.id = doc.id;
      
      // If this instance has a recurrenceId that doesn't exist in our set of valid IDs
      if (instance.recurrenceId && !validRecurrenceIds.has(instance.recurrenceId)) {
        orphanedInstances.push(instance);
      }
    });
    
    // Step 4: Output results
    if (orphanedInstances.length === 0) {
      console.log(`No orphaned instances found for user: ${userId}. All instances have valid recurrence patterns.`);
      return [];
    } 
    
    console.log(`Found ${orphanedInstances.length} orphaned instances for user: ${userId}:`);
    
    // Group by recurrenceId for better readability
    const groupedByRecurrenceId = {};
    
    orphanedInstances.forEach(instance => {
      if (instance.recurrenceId) {
        if (!groupedByRecurrenceId[instance.recurrenceId]) {
          groupedByRecurrenceId[instance.recurrenceId] = [];
        }
        groupedByRecurrenceId[instance.recurrenceId].push(instance);
      }
    });
    
    // Output the groups to console
    Object.entries(groupedByRecurrenceId).forEach(([recurrenceId, instances]) => {
      console.log(`\nRecurrenceId: ${recurrenceId} (${instances.length} instances):`);
      instances.slice(0, 5).forEach(instance => {
        console.log(`  - ID: ${instance.id}, Name: ${instance.name}, Date: ${instance.date}, Completed: ${instance.completed}`);
      });
      
      if (instances.length > 5) {
        console.log(`  ... and ${instances.length - 5} more instances`);
      }
    });
    
    return orphanedInstances;
  } catch (error) {
    console.error(`Error checking orphaned instances for user ${userId}:`, error);
    return [];
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Start with a fresh log file
    fs.writeFileSync(logFilePath, `Orphaned Instances Check - ${new Date().toISOString()}\n\n`, 'utf8');
    
    let orphanedInstancesCount = 0;
    let allOrphanedInstances = [];
    
    if (specificUserId) {
      // Check for a specific user
      const orphanedInstances = await findOrphanedInstancesForUser(specificUserId);
      orphanedInstancesCount = orphanedInstances.length;
      allOrphanedInstances = orphanedInstances;
    } else {
      // Check for all users
      console.log('Checking for all users...');
      
      const usersSnapshot = await db.collection('users').get();
      
      if (usersSnapshot.empty) {
        console.log('No users found in the database.');
        return;
      }
      
      console.log(`Found ${usersSnapshot.size} users. Checking each for orphaned instances...`);
      
      // Process each user sequentially
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const orphanedInstances = await findOrphanedInstancesForUser(userId);
        orphanedInstancesCount += orphanedInstances.length;
        allOrphanedInstances = allOrphanedInstances.concat(orphanedInstances);
      }
    }
    
    // Log the first 100 orphaned instances to a file
    if (allOrphanedInstances.length > 0) {
      const instancesToLog = allOrphanedInstances.slice(0, 100); // Only log the first 100
      
      fs.appendFileSync(logFilePath, `Total orphaned instances found: ${orphanedInstancesCount}\n`, 'utf8');
      fs.appendFileSync(logFilePath, `Logging first ${Math.min(100, orphanedInstancesCount)} instances:\n\n`, 'utf8');
      
      // Group by recurrenceId for the log file
      const groupedByRecurrenceId = {};
      instancesToLog.forEach(instance => {
        if (!groupedByRecurrenceId[instance.recurrenceId]) {
          groupedByRecurrenceId[instance.recurrenceId] = [];
        }
        groupedByRecurrenceId[instance.recurrenceId].push(instance);
      });
      
      // Write grouped instances to log
      Object.entries(groupedByRecurrenceId).forEach(([recurrenceId, instances]) => {
        fs.appendFileSync(logFilePath, `\nRecurrenceId: ${recurrenceId} (${instances.length} instances):\n`, 'utf8');
        
        instances.forEach(instance => {
          fs.appendFileSync(
            logFilePath, 
            `  - ID: ${instance.id}, Name: ${instance.name}, Date: ${instance.date}, Completed: ${instance.completed}\n`, 
            'utf8'
          );
        });
      });
      
      console.log(`\nDetailed report of orphaned instances written to: ${logFilePath}`);
    }
    
    console.log(`\nCheck completed. Found a total of ${orphanedInstancesCount} orphaned instances.`);
  } catch (error) {
    console.error('Error running orphaned instances check:', error);
    fs.appendFileSync(logFilePath, `\nERROR: ${error.message}\n${error.stack}\n`, 'utf8');
  }
}

// Run the script
main().catch(error => console.error('Unhandled error:', error));
