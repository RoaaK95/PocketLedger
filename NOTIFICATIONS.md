# In-App Notification System

This notification system provides transaction reminders and other alerts directly within the PocketLedger app.

## Features Implemented

### Transaction Reminder Notification
- **What it does**: Reminds users to log their daily expenses
- **When it triggers**: After 12:00 PM if no transactions have been logged today
- **Frequency**: Checks every 30 minutes
- **Action**: Taps opens the Add Transaction screen

## Components

### 1. `useInAppNotifications` Hook
**Location**: `hooks/useInAppNotifications.tsx`

Manages all notification logic:
- Stores notifications in AsyncStorage per user
- Checks for daily transaction activity
- Provides functions to add, read, and delete notifications
- Tracks unread notification count

**Usage**:
```typescript
const {
  notifications,        // All notifications
  unreadCount,         // Count of unread notifications
  addNotification,     // Add a new notification
  markAsRead,          // Mark notification as read
  markAllAsRead,       // Mark all as read
  deleteNotification,  // Delete a notification
  clearAll,            // Clear all notifications
} = useInAppNotifications(userId);
```

### 2. `NotificationBanner` Component
**Location**: `components/ui/notification-banner.tsx`

Displays notifications as animated banners at the top of the screen:
- Slides in from top with fade animation
- Auto-dismisses after 5 seconds
- Tappable to navigate to action route
- Different colors based on priority (high/normal/low)

**Props**:
```typescript
{
  notification: InAppNotification;
  onDismiss: () => void;
  autoHideDuration?: number; // Default: 5000ms
}
```

### 3. `NotificationCenter` Component
**Location**: `components/ui/notification-center.tsx`

Full-screen modal showing all notifications:
- List view with icons and timestamps
- Mark as read/unread
- Delete individual notifications
- Clear all notifications
- Relative time display (e.g., "2h ago")

## Notification Types

```typescript
type InAppNotification = {
  id: string;
  type: "transaction_reminder" | "sync_status" | "budget_alert" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;  // Navigate on tap
  icon?: string;         // Ionicons icon name
  priority: "low" | "normal" | "high";
};
```

## How It Works

### 1. Automatic Transaction Reminders

The system automatically checks if the user has logged any transactions today:

```typescript
// In useInAppNotifications hook
useEffect(() => {
  if (!userId) return;
  
  // Check immediately
  checkTransactionReminder();
  
  // Check every 30 minutes
  const interval = setInterval(checkTransactionReminder, 30 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [userId, checkTransactionReminder]);
```

### 2. Display Logic

In the Dashboard (`app/(tabs)/index.tsx`):

1. **Banner Display**: Shows the latest unread notification as a banner
2. **Bell Icon**: Displays unread count badge
3. **Notification Center**: Opens when bell icon is tapped

## Adding Custom Notifications

You can add custom notifications anywhere in your app:

```typescript
import { useInAppNotifications } from '../hooks/useInAppNotifications';

function MyComponent() {
  const { addNotification } = useInAppNotifications(userId);
  
  const notifyUser = async () => {
    await addNotification(
      "budget_alert",                    // type
      "Budget Warning",                  // title
      "You've reached 80% of your budget", // message
      {
        actionRoute: "/transactions",    // optional: where to go on tap
        icon: "alert-circle-outline",   // optional: custom icon
        priority: "high"                // optional: priority level
      }
    );
  };
  
  return <Button onPress={notifyUser} />;
}
```

## Future Enhancement Ideas

1. **More Notification Types**:
   - Weekly spending summary
   - Budget exceeded alerts
   - Sync completion notifications
   - Savings milestone celebrations

2. **Smart Scheduling**:
   - Customize reminder times per user
   - Different schedules for weekdays/weekends
   - Snooze functionality

3. **Analytics**:
   - Track which notifications users interact with
   - Optimize timing based on user behavior

4. **Settings**:
   - Enable/disable specific notification types
   - Customize reminder frequency
   - Quiet hours

## Testing

To test the transaction reminder:

1. **Method 1**: Wait until after 12:00 PM without adding transactions
2. **Method 2**: Manually trigger in the hook (for development):

```typescript
// In useInAppNotifications.tsx - for testing only
useEffect(() => {
  if (userId) {
    // Force trigger for testing
    checkTransactionReminder();
  }
}, [userId]);
```

3. **Method 3**: Adjust the time check in `checkTransactionReminder`:

```typescript
// Change from:
if (todayTransactions.length === 0 && currentHour >= 12)

// To (for testing):
if (todayTransactions.length === 0 && currentHour >= 0)
```

## Storage Keys

The system uses AsyncStorage with these keys:

- `in_app_notifications_${userId}` - All notifications for user
- `last_transaction_check_${userId}` - Last time we checked for reminders

## Performance Considerations

- Notifications are stored in AsyncStorage (persistent across sessions)
- Check interval is 30 minutes (configurable)
- Only checks once per day to avoid duplicate reminders
- Banner auto-dismisses to avoid UI clutter
- Maximum of 1 banner shown at a time
