import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../db/sqlite";
import { Tx, deleteTransaction } from "../db/transactionsRepo";
 
export default function ViewTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Tx | null>(null);

  useEffect(() => {
    if (id) {
      const tx = db.getFirstSync<Tx>(
        "SELECT * FROM transactions WHERE id = ?",
        [id]
      );
      setTransaction(tx);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
        "Delete Transaction",
        "Are you sure you want to delete this transaction? This action cannot be undone.",
        [
            {
              text: "Cancel",
              style:"cancel",
            },
            {
               text: "Delete",
               style: "destructive",
               onPress: async () =>{
                try{
                    await deleteTransaction(id as string);
                    router.back();
                } catch(error){
                    Alert.alert("Error", "Failed to delete transaction");
                    console.error("Delete error:", error)
                }
               }
            },
        ]
    );
  };

  if (!transaction) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={48} color="#999" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[
            styles.iconContainer,
            transaction.type === 'income' ? styles.iconContainerIncome : styles.iconContainerExpense
          ]}>
            <Ionicons 
              name={transaction.type === 'income' ? 'arrow-up-circle' : 'arrow-down-circle'} 
              size={48} 
              color={transaction.type === 'income' ? '#4CAF50' : '#f44336'} 
            />
          </View>
          <Text style={styles.title}>Transaction Details</Text>
          <View style={[
            styles.typeBadge,
            transaction.type === "income" ? styles.typeBadgeIncome : styles.typeBadgeExpense,
          ]}>
            <Text style={styles.typeBadgeText}>
              {transaction.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={[
            styles.amountValue,
            transaction.type === 'income' ? styles.amountIncome : styles.amountExpense
          ]}>
            {transaction.type === "income" ? "+" : "-"}
            {transaction.amount.toFixed(2)} IQD
          </Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{transaction.categoryId}</Text>
            </View>
          </View>

          {transaction.note && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Note</Text>
                <Text style={styles.detailValue}>{transaction.note}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.date).toLocaleTimeString("en-US")}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="sync-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Sync Status</Text>
              <View style={[
                styles.statusBadge,
                transaction.syncStatus === "synced" ? styles.statusSynced : styles.statusPending,
              ]}>
                <Ionicons 
                  name={transaction.syncStatus === "synced" ? "checkmark-circle" : "time"} 
                  size={14} 
                  color={transaction.syncStatus === "synced" ? "#4CAF50" : "#ff9800"} 
                />
                <Text style={styles.statusText}>
                  {transaction.syncStatus}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="key-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValueSmall}>{transaction.id}</Text>
            </View>
          </View>
        </View>
        
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Close</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerIncome: {
    backgroundColor: '#E8F5E9',
  },
  iconContainerExpense: {
    backgroundColor: '#FFEBEE',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeIncome: {
    backgroundColor: '#E8F5E9',
  },
  typeBadgeExpense: {
    backgroundColor: '#FFEBEE',
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: '#666',
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
  },
  amountIncome: {
    color: '#4CAF50',
  },
  amountExpense: {
    color: '#f44336',
  },
  detailsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  detailValueSmall: {
    fontSize: 12,
    color: "#1a1a1a",
    fontFamily: "monospace",
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusSynced: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  deleteButton: {
    backgroundColor: "#f44336",
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    color: "#666",
    fontSize: 17,
    fontWeight: "600",
  },
});
