import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { InAppNotification } from "../../hooks/useInAppNotifications";

type NotificationCenterProps = {
  visible: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

export function NotificationCenter({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? "light"];

  const handleNotificationPress = (notification: InAppNotification) => {
    onMarkAsRead(notification.id);
    if (notification.actionRoute) {
      onClose();
      router.push(notification.actionRoute as any);
    }
  };

  const getIconName = (
    notification: InAppNotification
  ): keyof typeof Ionicons.glyphMap => {
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

  const getIconColor = (notification: InAppNotification) => {
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const renderNotification = ({
    item,
  }: {
    item: InAppNotification;
  }) => (
    <Pressable
      onPress={() => handleNotificationPress(item)}
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read
            ? colorScheme === "dark"
              ? "#1c1c1c"
              : "#f8f9fa"
            : colorScheme === "dark"
            ? "#2c2c2c"
            : "#ffffff",
        },
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getIconName(item)}
            size={24}
            color={getIconColor(item)}
          />
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.notificationTitle,
              { color: colors.text },
              item.read && styles.readText,
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.notificationMessage,
              { color: colors.icon },
              item.read && styles.readText,
            ]}
          >
            {item.message}
          </Text>
          <Text style={[styles.timestamp, { color: colors.icon }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        <Pressable
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color={colors.icon} />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <>
                <Pressable onPress={onMarkAllAsRead} style={styles.headerButton}>
                  <Text style={[styles.headerButtonText, { color: colors.tint }]}>
                    Mark all read
                  </Text>
                </Pressable>
                <Pressable onPress={onClearAll} style={styles.headerButton}>
                  <Text style={[styles.headerButtonText, { color: "#ff6b6b" }]}>
                    Clear all
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={colors.icon}
            />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              No notifications yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  readText: {
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
