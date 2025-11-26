import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { listTxs, Tx } from "../../db/transactionsRepo";
import { useAuth } from "../../hooks/useAuth";


export default function Transactions() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setTxs(listTxs(user.uid));
    }, [user])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="receipt" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Track all your financial activities</Text>
      </View>

      {txs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first transaction</Text>
        </View>
      ) : (
        <FlatList
          data={txs}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/view-transaction?id=${item.id}`)}
              style={styles.transactionCard}
            >
              <View style={styles.transactionIcon}>
                <Ionicons 
                  name={item.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                  size={32} 
                  color={item.type === 'income' ? '#4CAF50' : '#f44336'} 
                />
              </View>
              <View style={styles.transactionContent}>
                <Text style={styles.transactionAmount}>
                  {item.type === 'income' ? '+' : '-'}{item.amount} IQD
                </Text>
                <Text style={styles.transactionNote} numberOfLines={1}>
                  {item.note || 'No note'}
                </Text>
                <View style={styles.transactionMeta}>
                  <Ionicons name="calendar-outline" size={12} color="#999" />
                  <Text style={styles.transactionDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={() => router.push("/add-transaction")}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  transactionNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
