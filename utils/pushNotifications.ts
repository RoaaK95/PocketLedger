import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type SalaryReminder = {
  enabled: boolean;
  dayOfMonth: number; // 1-31
  time: string; // "09:00" format
};

const SALARY_REMINDER_KEY = "salary_reminder_settings";
const PUSH_TOKEN_KEY = "expo_push_token";

/**
 * Request notification permissions and get push token
 */
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("salary-reminders", {
      name: "Salary Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4CAF50",
      sound: "default",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "6504ab0a-cafa-45aa-9464-7ae2c90d13c6",
        })
      ).data;
      
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

/**
 * Save salary reminder settings
 */
export async function saveSalaryReminderSettings(
  userId: string,
  settings: SalaryReminder
) {
  try {
    await AsyncStorage.setItem(
      `${SALARY_REMINDER_KEY}_${userId}`,
      JSON.stringify(settings)
    );

    if (settings.enabled) {
      await scheduleSalaryReminder(settings);
    } else {
      await cancelSalaryReminder();
    }
  } catch (error) {
    console.error("Error saving salary reminder settings:", error);
    throw error;
  }
}

/**
 * Get salary reminder settings
 */
export async function getSalaryReminderSettings(
  userId: string
): Promise<SalaryReminder | null> {
  try {
    const stored = await AsyncStorage.getItem(
      `${SALARY_REMINDER_KEY}_${userId}`
    );
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error("Error loading salary reminder settings:", error);
    return null;
  }
}

/**
 * Schedule salary reminder notification
 * Uses date-based triggers that work on both Android and iOS
 */
export async function scheduleSalaryReminder(settings: SalaryReminder) {
  try {
    // Cancel existing notifications first
    await cancelSalaryReminder();

    const [hours, minutes] = settings.time.split(":").map(Number);

    // Calculate next salary day
    const now = new Date();
    const nextSalaryDate = new Date();
    nextSalaryDate.setDate(settings.dayOfMonth);
    nextSalaryDate.setHours(hours);
    nextSalaryDate.setMinutes(minutes);
    nextSalaryDate.setSeconds(0);
    nextSalaryDate.setMilliseconds(0);

    // If the date has passed this month, schedule for next month
    if (nextSalaryDate <= now) {
      nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
    }

    // Handle months with fewer days (e.g., day 31 in February)
    while (nextSalaryDate.getDate() !== settings.dayOfMonth) {
      nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
      nextSalaryDate.setDate(settings.dayOfMonth);
    }

    // Schedule for the next occurrence
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Salary Day!",
        body: "Don't forget to log your income in PocketLedger",
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "salary-reminder",
        data: { type: "salary_reminder", route: "/add-transaction" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextSalaryDate,
      },
    });

    // Store notification ID and settings for rescheduling
    await AsyncStorage.setItem("salary_notification_id", notificationId);
    await AsyncStorage.setItem(
      "salary_notification_next_date",
      nextSalaryDate.toISOString()
    );

    console.log("Salary reminder scheduled for", nextSalaryDate.toLocaleString());
    return notificationId;
  } catch (error) {
    console.error("Error scheduling salary reminder:", error);
    throw error;
  }
}

/**
 * Reschedule salary reminder for next month after notification is received
 * Call this when notification is received to schedule next occurrence
 */
export async function rescheduleSalaryReminder(userId: string) {
  try {
    const settings = await getSalaryReminderSettings(userId);
    if (settings && settings.enabled) {
      await scheduleSalaryReminder(settings);
    }
  } catch (error) {
    console.error("Error rescheduling salary reminder:", error);
  }
}

/**
 * Cancel salary reminder notification
 */
export async function cancelSalaryReminder() {
  try {
    const notificationId = await AsyncStorage.getItem(
      "salary_notification_id"
    );
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem("salary_notification_id");
      console.log("Salary reminder cancelled");
    }
  } catch (error) {
    console.error("Error cancelling salary reminder:", error);
  }
}

/**
 * Send immediate test notification
 */
export async function sendTestSalaryNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💵 Salary Day!",
        body: "Don't forget to log your income in PocketLedger",
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: "salary_reminder", route: "/add-transaction" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
    console.log("Test notification sent");
  } catch (error) {
    console.error("Error sending test notification:", error);
    throw error;
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications() {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log("Scheduled notifications:", notifications);
    return notifications;
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}
