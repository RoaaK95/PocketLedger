import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { InAppNotification } from "../../hooks/useInAppNotifications";

type NotificationBannerProps = {
  notification: InAppNotification;
  onDismiss: () => void;
  autoHideDuration?: number;
};

export function NotificationBanner({
  notification,
  onDismiss,
  autoHideDuration = 5000,
}: NotificationBannerProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    if (notification.actionRoute) {
      handleDismiss();
      router.push(notification.actionRoute as any);
    }
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    if (notification.icon) {
      return notification.icon as keyof typeof Ionicons.glyphMap;
    }

    switch (notification.type) {
      case "transaction_reminder":
        return "calendar-outline";
      case "sync_status":
        return "cloud-done-outline";
      case "budget_alert":
        return "alert-circle-outline";
      default:
        return "information-circle-outline";
    }
  };

  const getBackgroundColor = () => {
    switch (notification.priority) {
      case "high":
        return "#ff6b6b";
      case "normal":
        return "#4dabf7";
      case "low":
        return "#51cf66";
      default:
        return "#4dabf7";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={[
          styles.banner,
          {
            borderLeftColor: getBackgroundColor(),
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIconName()}
            size={24}
            color={getBackgroundColor()}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            style={styles.message}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
        </View>

        <Pressable onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#666" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: '#1a1a1a',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    color: '#666',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
