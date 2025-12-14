import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const router = useRouter();

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
        item.read ? styles.notificationItemRead : styles.notificationItemUnread,
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
              item.read && styles.readText,
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.notificationMessage,
              item.read && styles.readText,
            ]}
          >
            {item.message}
          </Text>
          <Text style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </Text>
        </View>

        <Pressable
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color="#666" />
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>
          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <>
                <Pressable onPress={onMarkAllAsRead} style={styles.headerButton}>
                  <Text style={styles.markReadText}>
                    Mark all read
                  </Text>
                </Pressable>
                <Pressable onPress={onClearAll} style={styles.headerButton}>
                  <Text style={styles.clearAllText}>
                    Clear all
                  </Text>
                </Pressable>
              </>
            )}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </Pressable>
          </View>
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#999"
            />
            <Text style={styles.emptyText}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: '#1a1a1a',
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
  markReadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationItemUnread: {
    backgroundColor: 'white',
  },
  notificationItemRead: {
    backgroundColor: '#f8f9fa',
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
    fontSize: 15,
    fontWeight: "600",
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
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
    color: '#666',
    marginTop: 16,
  },
});
