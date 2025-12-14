import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    getSalaryReminderSettings,
    registerForPushNotifications,
    SalaryReminder,
    saveSalaryReminderSettings,
    sendTestSalaryNotification,
} from "../../utils/pushNotifications";

type SalaryReminderSettingsProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
};

export function SalaryReminderSettings({
  visible,
  onClose,
  userId,
}: SalaryReminderSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadSettings = async () => {
    try {
      const settings = await getSalaryReminderSettings(userId);
      if (settings) {
        setEnabled(settings.enabled);
        setDayOfMonth(settings.dayOfMonth.toString());
        setTime(settings.time);
      }

      // Check notification permissions
      const token = await registerForPushNotifications();
      setHasPermission(!!token);
    } catch (error) {
      console.error("Error loading salary reminder settings:", error);
    }
  };

  const handleSave = async () => {
    const day = parseInt(dayOfMonth);

    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert("Invalid Day", "Please enter a day between 1 and 31");
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Invalid Time", "Please enter time in HH:MM format (e.g., 09:00)");
      return;
    }

    setLoading(true);
    try {
      const settings: SalaryReminder = {
        enabled,
        dayOfMonth: day,
        time,
      };

      await saveSalaryReminderSettings(userId, settings);

      Alert.alert(
        "Success",
        enabled
          ? `Salary reminder set for day ${day} at ${time}`
          : "Salary reminder disabled"
      );
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save settings. Please try again.");
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Please enable notifications to test this feature"
      );
      return;
    }

    try {
      await sendTestSalaryNotification();
      Alert.alert(
        "Test Sent",
        "You should receive a test notification in a few seconds"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
      console.error("Error sending test notification:", error);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (value && !hasPermission) {
      Alert.alert(
        "Permission Required",
        "Please allow notifications to use this feature",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              const token = await registerForPushNotifications();
              if (token) {
                setHasPermission(true);
                setEnabled(true);
              } else {
                Alert.alert(
                  "Permission Denied",
                  "Please enable notifications in your device settings"
                );
              }
            },
          },
        ]
      );
    } else {
      setEnabled(value);
    }
  };

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
            💵 Salary Reminder
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#666" />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Enable/Disable Switch */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>
                  Enable Salary Reminder
                </Text>
                <Text style={styles.description}>
                  Get notified on your salary day to log income
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggle}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={enabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {enabled && (
            <>
              {/* Day of Month */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Salary Day (Day of Month)
                </Text>
                <Text style={styles.description}>
                  Enter the day of the month you receive your salary (1-31)
                </Text>
                <TextInput
                  style={styles.input}
                  value={dayOfMonth}
                  onChangeText={setDayOfMonth}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor="#999"
                  maxLength={2}
                />
              </View>

              {/* Time */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Reminder Time
                </Text>
                <Text style={styles.description}>
                  Time to receive the notification (24-hour format)
                </Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="09:00"
                  placeholderTextColor="#999"
                  maxLength={5}
                />
              </View>

              {/* Example */}
              <View style={styles.exampleBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.exampleText}>
                  You&apos;ll receive a notification on day {dayOfMonth} at {time}{" "}
                  every month
                </Text>
              </View>

              {/* Test Button */}
              <Pressable
                style={styles.testButton}
                onPress={handleTestNotification}
              >
                <Ionicons name="flask-outline" size={20} color="#9b59b6" />
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              </Pressable>
            </>
          )}

          {/* Permission Status */}
          {!hasPermission && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#ff9800" />
              <Text style={styles.warningText}>
                Notification permission is required. Tap &quot;Enable&quot; to grant
                access.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.saveButton,
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Settings"}
            </Text>
          </Pressable>
        </View>
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
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#666',
  },
  input: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
  },
  exampleBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    backgroundColor: '#e3f2fd',
  },
  exampleText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#1a1a1a',
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 8,
     borderColor: '#9b59b6',
    backgroundColor: 'white',
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9b59b6",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#e65100",
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: "center",
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9E9E9E",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
