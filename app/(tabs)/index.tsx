import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { syncTxs } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

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
      Alert.alert("Sync complete", msg);
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
          <Text style={styles.subtitle}>Welcome to PocketLedger</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>$0.00</Text>
            <Text style={styles.statLabel}>Total Balance</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="arrow-down-circle-outline" size={32} color="#f44336" />
            <Text style={styles.statValue}>$0.00</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="arrow-up-circle-outline" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>$0.00</Text>
            <Text style={styles.statLabel}>Income</Text>
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
    paddingTop: 40,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
