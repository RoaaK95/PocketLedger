import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { rescheduleSalaryReminder } from "../utils/pushNotifications";

/**
 * Hook to handle notification responses (when user taps on a notification)
 */
export function useNotificationObserver(userId: string | null) {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        console.log("Notification received:", notification);
        
        // Reschedule salary reminder for next month
        const data = notification.request.content.data;
        if (data?.type === "salary_reminder" && userId) {
          await rescheduleSalaryReminder(userId);
        }
      });

    // Listener for when user taps on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        console.log("Notification tapped:", response);

        const data = response.notification.request.content.data;

        // Reschedule salary reminder for next month
        if (data?.type === "salary_reminder" && userId) {
          await rescheduleSalaryReminder(userId);
        }

        // Navigate to the appropriate screen based on notification data
        if (data?.route) {
          router.push(data.route as any);
        } else if (data?.type === "salary_reminder") {
          router.push("/add-transaction");
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router, userId]);
}
