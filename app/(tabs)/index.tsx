import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { listTxs, Tx } from "../../db/transactionsRepo";
import { getPendingTxs, pullFromCloud, syncTxs } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";
const getCurrencySymbol = (currencyCode: string) => {
  return currencyCode;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [currency, setCurrency] = useState("IQD");

  const loadTransactions = useCallback(() => {
    if (!user) return;

    try {
      const txs = listTxs(user.uid);
      setTransactions(txs);

      const income = txs
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenses = txs
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);

      setTotalIncome(income);
      setTotalExpenses(expenses);
      setBalance(income - expenses);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, [user]);

  const loadCurrency = useCallback(async () => {
    if (!user) return;

    try {
      const storedCurrency = await AsyncStorage.getItem(
        `user_currency_${user.uid}`
      );
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    } catch (error) {
      console.error("Error loading currency:", error);
    }
  }, [user]);

  const checkPendingChanges = useCallback(async () => {
    if (!user) return;

    try {
      // Check for pending transactions
      const pendingTxs = getPendingTxs(user.uid);

      // Check for pending profile changes
      const pendingName = await AsyncStorage.getItem(
        `user_name_pending_sync_${user.uid}`
      );
      const pendingImage = await AsyncStorage.getItem(
        `user_image_pending_sync_${user.uid}`
      );
      const pendingCurrency = await AsyncStorage.getItem(
        `user_currency_pending_sync_${user.uid}`
      );

      const hasPending =
        pendingTxs.length > 0 ||
        pendingName === "true" ||
        pendingImage === "true" ||
        pendingCurrency === "true";
      setHasPendingChanges(hasPending);

      if (hasPending) {
        let count = pendingTxs.length;
        const profileChanges =
          (pendingName === "true" ? 1 : 0) +
          (pendingImage === "true" ? 1 : 0) +
          (pendingCurrency === "true" ? 1 : 0);

        if (count > 0 && profileChanges > 0) {
          setLastSyncMsg(
            `${count} transaction(s) and ${profileChanges} profile change(s) pending sync.`
          );
        } else if (count > 0) {
          setLastSyncMsg(`${count} transaction(s) pending sync.`);
        } else if (profileChanges > 0) {
          setLastSyncMsg(`${profileChanges} profile change(s) pending sync.`);
        }
      } else {
        setLastSyncMsg("Everything is synced!");
      }
    } catch (error) {
      console.error("Error checking pending changes:", error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadCurrency();
      checkPendingChanges();
    }, [loadTransactions, loadCurrency, checkPendingChanges])
  );

  const formatAmount = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    }
    return `${(amount / 1000).toFixed(2)}K`;
  };

  const handleSync = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      const result = await syncTxs(user.uid);

      const msg =
        result.total === 0
          ? "Everything is synced!"
          : `Synced ${result.synced} of ${result.total} changes. Deleted ${result.deleted}.`;

      setLastSyncMsg(msg);
      setHasPendingChanges(false);
      loadTransactions(); // Reload transactions after sync
    } catch (err: any) {
      console.error("Sync error", err);
      Alert.alert("Sync failed", err?.message || "Unknown error");
    } finally {
      setSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) return;

    // Check if there are pending changes
    const pendingTxs = getPendingTxs(user.uid);
    const hasPendingLocal = pendingTxs.length > 0;

    const warningMessage = hasPendingLocal
      ? `⚠️ You have ${pendingTxs.length} unsynced local transaction(s).\n\nRestoring will MERGE cloud data with your local changes.\n\nYour local changes will be kept but still need to be backed up.\n\nContinue?`
      : `This will download data from cloud and merge it with your local data.\n\nContinue?`;

    Alert.alert(
      "Restore from Cloud",
      warningMessage,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              setRestoring(true);
              const result = await pullFromCloud(user.uid);

              Alert.alert(
                "Restore Complete",
                `Restored ${result.transactions} transaction(s) and ${
                  result.profile ? "profile data" : "no profile data"
                }.${
                  hasPendingLocal
                    ? `\n\n⚠️ Your ${pendingTxs.length} local transaction(s) are still pending backup.`
                    : ""
                }`
              );

              setLastSyncMsg("Data restored from cloud!");
              loadTransactions();
              loadCurrency();
              checkPendingChanges();
            } catch (err: any) {
              console.error("Restore error", err);
              Alert.alert("Restore failed", err?.message || "Unknown error");
            } finally {
              setRestoring(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to Pocket Ledger</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Total Balance</Text>
            </View>
            <View style={styles.amountRow}>
              <Text
                style={[
                  styles.mainAmount,
                  balance < 0 && styles.negativeAmount,
                ]}
              >
                {formatAmount(balance)}
              </Text>
              <Text style={styles.currency}>{getCurrencySymbol(currency)}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.smallCard, styles.incomeCard]}>
              <View style={styles.smallCardHeader}>
                <Text style={styles.smallCardLabel}>Income</Text>
              </View>
              <View style={styles.smallAmountRow}>
                <Text style={styles.smallAmount}>
                  {formatAmount(totalIncome)}
                </Text>
                <Text style={styles.smallCurrency}>
                  {getCurrencySymbol(currency)}
                </Text>
              </View>
            </View>

            <View style={[styles.smallCard, styles.expenseCard]}>
              <View style={styles.smallCardHeader}>
                <Text style={styles.smallCardLabel}>Expenses</Text>
              </View>
              <View style={styles.smallAmountRow}>
                <Text style={styles.smallAmount}>
                  {formatAmount(totalExpenses)}
                </Text>
                <Text style={styles.smallCurrency}>
                  {getCurrencySymbol(currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync</Text>

          <View style={styles.syncButtons}>
            <Pressable
              onPress={handleSync}
              disabled={syncing || restoring || !user}
              style={[
                styles.syncButton,
                styles.uploadButton,
                (syncing || restoring || !user) && styles.syncButtonDisabled,
              ]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color="white"
                style={styles.syncIcon}
              />
              <Text style={styles.syncButtonText}>
                {syncing ? "Uploading..." : "Backup to Cloud"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleRestore}
              disabled={syncing || restoring || !user}
              style={[
                styles.syncButton,
                styles.restoreButton,
                (syncing || restoring || !user) && styles.syncButtonDisabled,
              ]}
            >
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color="white"
                style={styles.syncIcon}
              />
              <Text style={styles.syncButtonText}>
                {restoring ? "Restoring..." : "Restore from Cloud"}
              </Text>
            </Pressable>
          </View>

          {lastSyncMsg && (
            <View
              style={[
                styles.syncMessageContainer,
                hasPendingChanges && styles.syncMessagePending,
              ]}
            >
              <Ionicons
                name={hasPendingChanges ? "alert-circle" : "checkmark-circle"}
                size={16}
                color={hasPendingChanges ? "#FF9800" : "#4CAF50"}
              />
              <Text style={styles.syncMessage}>{lastSyncMsg}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  statsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0,
  },
  statCard: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  negativeAmount: {
    color: "#ffcdd2",
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  smallCardHeader: {
    marginBottom: 12,
  },
  smallCardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  smallAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  smallAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  smallCurrency: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
    marginLeft: 4,
  },
  syncButton: {
    borderRadius: 12,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  syncButtonDisabled: {
    backgroundColor: "#9E9E9E",
    shadowOpacity: 0.1,
  },
  syncIcon: {
    marginRight: 8,
  },
  syncButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  syncMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  syncMessagePending: {
    backgroundColor: "#FFF3E0",
  },
  syncMessage: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  syncButtons: {
    gap: 12,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
  },
  restoreButton: {
    backgroundColor: "#2196F3",
  },
});
