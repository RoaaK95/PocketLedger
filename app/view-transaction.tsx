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
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transaction Details</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View
            style={[
              styles.badge,
              transaction.type === "income"
                ? styles.incomeBadge
                : styles.expenseBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                transaction.type === "income"
                  ? styles.incomeText
                  : styles.expenseText,
              ]}
            >
              {transaction.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>
            {transaction.type === "income" ? "+" : "-"}
            {transaction.amount.toFixed(2)} IQD
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{transaction.categoryId}</Text>
        </View>

        {transaction.note && (
          <View style={styles.section}>
            <Text style={styles.label}>Note</Text>
            <Text style={styles.value}>{transaction.note}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {new Date(transaction.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>
            {new Date(transaction.date).toLocaleTimeString("en-US")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={[styles.value, styles.smallText]}>{transaction.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Sync Status</Text>
          <View
            style={[
              styles.badge,
              transaction.syncStatus === "synced"
                ? styles.syncedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {transaction.syncStatus.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Pressable
        onPress={handleDelete}
        style={styles.deleteButton}
        >
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
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  value: {
    fontSize: 18,
    color: "#111",
    fontWeight: "500",
  },
  smallText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  incomeBadge: {
    backgroundColor: "#d4f4dd",
  },
  incomeText: {
    color: "#0a7827",
  },
  expenseBadge: {
    backgroundColor: "#ffd4d4",
  },
  expenseText: {
    color: "#c92a2a",
  },
  syncedBadge: {
    backgroundColor: "#d4f4dd",
  },
  pendingBadge: {
    backgroundColor: "#fff3cd",
  },
  deleteButton:{
    backgroundColor: "#c92a2a",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText:{
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 8,
    marginTop: 0,
    marginBottom: 20,
    
  },
  backButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
