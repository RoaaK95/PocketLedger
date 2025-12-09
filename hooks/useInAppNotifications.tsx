import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { listTxs } from "../db/transactionsRepo";

export type InAppNotification = {
  id: string;
  type: "transaction_reminder" | "sync_status" | "budget_alert" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;
  icon?: string;
  priority: "low" | "normal" | "high";
};

const NOTIFICATION_STORAGE_KEY = "in_app_notifications";
const LAST_TRANSACTION_CHECK_KEY = "last_transaction_check";

export function useInAppNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from storage
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const stored = await AsyncStorage.getItem(
        `${NOTIFICATION_STORAGE_KEY}_${userId}`
      );
      if (stored) {
        const parsed: InAppNotification[] = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [userId]);

  // Save notifications to storage
  const saveNotifications = useCallback(
    async (notifs: InAppNotification[]) => {
      if (!userId) return;

      try {
        await AsyncStorage.setItem(
          `${NOTIFICATION_STORAGE_KEY}_${userId}`,
          JSON.stringify(notifs)
        );
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Error saving notifications:", error);
      }
    },
    [userId]
  );

  // Add a new notification
  const addNotification = useCallback(
    async (
      type: InAppNotification["type"],
      title: string,
      message: string,
      options?: {
        actionRoute?: string;
        icon?: string;
        priority?: "low" | "normal" | "high";
      }
    ) => {
      const newNotification: InAppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        actionRoute: options?.actionRoute,
        icon: options?.icon,
        priority: options?.priority || "normal",
      };

      const updated = [newNotification, ...notifications];
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      const updated = notifications.filter((n) => n.id !== notificationId);
      await saveNotifications(updated);
    },
    [notifications, saveNotifications]
  );

  // Clear all notifications
  const clearAll = useCallback(async () => {
    await saveNotifications([]);
  }, [saveNotifications]);

  // Check if user has logged transactions today
  const checkTransactionReminder = useCallback(async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Get last check time
      const lastCheck = await AsyncStorage.getItem(
        `${LAST_TRANSACTION_CHECK_KEY}_${userId}`
      );
      const lastCheckDate = lastCheck ? lastCheck.split("T")[0] : null;

      // Only check once per day
      if (lastCheckDate === today) return;

      // Get today's transactions
      const allTransactions = listTxs(userId);
      const todayTransactions = allTransactions.filter((tx) => {
        const txDate = tx.date.split("T")[0];
        return txDate === today;
      });

      // If no transactions today and it's past noon, send reminder
      const currentHour = now.getHours();
      if (todayTransactions.length === 0 && currentHour >= 12) {
        // Check if we already sent this reminder today
        const existingReminder = notifications.find(
          (n) =>
            n.type === "transaction_reminder" &&
            n.timestamp.split("T")[0] === today
        );

        if (!existingReminder) {
          await addNotification(
            "transaction_reminder",
            "Haven't logged expenses today",
            "Tap to add your transactions and keep your budget on track",
            {
              actionRoute: "/add-transaction",
              icon: "calendar-outline",
              priority: "normal",
            }
          );
        }
      }

      // Update last check time
      await AsyncStorage.setItem(
        `${LAST_TRANSACTION_CHECK_KEY}_${userId}`,
        now.toISOString()
      );
    } catch (error) {
      console.error("Error checking transaction reminder:", error);
    }
  }, [userId, notifications, addNotification]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Check for reminders periodically
  useEffect(() => {
    if (!userId) return;

    // Check immediately
    checkTransactionReminder();

    // Check every 30 minutes
    const interval = setInterval(checkTransactionReminder, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId, checkTransactionReminder]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    checkTransactionReminder,
  };
}
