import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { listTxs, Tx } from "../../db/transactionsRepo";
import { syncTxs } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  const loadTransactions = useCallback(() => {
    if (!user) return;
    
    try {
      const txs = listTxs(user.uid);
      setTransactions(txs);
      
      const income = txs
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const expenses = txs
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setBalance(income - expenses);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
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
          ? "No pending changes to sync."
          : `Synced ${result.synced} of ${result.total} changes. Deleted ${result.deleted}.`;

      setLastSyncMsg(msg);
      loadTransactions(); // Reload transactions after sync
    } catch (err: any) {
      console.error("Sync error", err);
      Alert.alert("Sync failed", err?.message || "Unknown error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to Pocket Ledger</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="wallet" size={24} color="#fff" />
              </View>
              <Text style={styles.cardTitle}>Total Balance</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={[styles.mainAmount, balance < 0 && styles.negativeAmount]}>
                {formatAmount(balance)}
              </Text>
              <Text style={styles.currency}>IQD</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.smallCard, styles.incomeCard]}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
                <Text style={styles.smallCardLabel}>Income</Text>
              </View>
              <View style={styles.smallAmountRow}>
                <Text style={styles.smallAmount}>{formatAmount(totalIncome)}</Text>
                <Text style={styles.smallCurrency}>IQD</Text>
              </View>
            </View>

            <View style={[styles.smallCard, styles.expenseCard]}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="trending-down" size={20} color="#f44336" />
                <Text style={styles.smallCardLabel}>Expenses</Text>
              </View>
              <View style={styles.smallAmountRow}>
                <Text style={styles.smallAmount}>{formatAmount(totalExpenses)}</Text>
                <Text style={styles.smallCurrency}>IQD</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync</Text>
          
          <Pressable
            onPress={handleSync}
            disabled={syncing || !user}
            style={[styles.syncButton, (syncing || !user) && styles.syncButtonDisabled]}
          >
            <Ionicons 
              name="sync-outline" 
              size={20} 
              color="white" 
              style={styles.syncIcon} 
            />
            <Text style={styles.syncButtonText}>
              {syncing ? "Syncing..." : "Sync now"}
            </Text>
          </Pressable>

          {lastSyncMsg && (
            <View style={styles.syncMessageContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  statsContainer: {
    marginBottom: 32,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#4CAF50',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  negativeAmount: {
    color: '#ffcdd2',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  smallCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  smallAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  smallAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  smallCurrency: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginLeft: 4,
  },
  syncButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#9E9E9E',
    shadowOpacity: 0.1,
  },
  syncIcon: {
    marginRight: 8,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  syncMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  syncMessage: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#1a1a1a',
  },
});
