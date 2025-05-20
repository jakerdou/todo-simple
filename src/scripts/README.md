# Orphaned Instances Checker

This tool helps you identify "orphaned instances" in your EasyHabits application. These are habit instances that reference a recurring pattern that no longer exists in the database.

## What are Orphaned Instances?

In EasyHabits, recurring habits are stored in two collections:
- `users/{userId}/recurrences` - Contains the recurring pattern definitions
- `users/{userId}/instances` - Contains individual occurrences of habits

An "orphaned instance" is an entry in the `instances` collection that has:
1. `isRecurring` set to `true`
2. A `recurrenceId` that doesn't exist in the `recurrences` collection

These can happen when:
- A recurring pattern is deleted but not all of its instances are cleaned up
- Data migration issues occur
- Manual database edits are performed incorrectly

## How to Use the Tools

### Option 1: Use the In-App Checker (Profile Tab)

The simplest way to check for orphaned instances is to use the built-in checker component in your profile tab:

1. Go to the Profile tab in the EasyHabits app
2. Find the "Database Health Check" section
3. Click "Check for Orphaned Instances"
4. Review the results

### Option 2: Use the Browser Console

You can run the check directly from your browser console while logged into the EasyHabits app:

```javascript
// Import the check function
import { runOrphanCheck } from './services/orphanCheck';

// Get the current user's ID
const userId = auth.currentUser.uid;

// Run the check
runOrphanCheck(userId);
```

### Option 3: Run the Node.js Script (Admin Access Required)

This requires Firebase Admin SDK access with a service account key.

1. Get a Firebase service account key file (JSON) with Firestore read permissions
2. Run the script:

```bash
node scripts/checkOrphanedInstances.js path/to/serviceAccountKey.json [userId]
```

If you omit the userId parameter, the script will check all users.

## Fixing Orphaned Instances

Currently, the fix must be done manually, but future versions might include automatic fixing. Options include:

1. **Mark as non-recurring**: Set `isRecurring` to `false` and `recurrenceId` to `null`
2. **Delete the instances**: Remove the orphaned instances from the database
3. **Create a new recurrence pattern**: Create a new pattern with the same ID (not recommended)

## Implementation Details

The orphaned instances check works by:
1. Fetching all instances with `isRecurring: true` for a user
2. Fetching all recurrence patterns for the user
3. Identifying instances that reference a recurrenceId that doesn't exist
4. Reporting those instances as orphaned

## Future Enhancements

Planned improvements:
- Automated fixing of orphaned instances
- Batch processing for large datasets
- Email notifications for database health issues
