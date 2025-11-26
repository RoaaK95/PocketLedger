import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { db } from "../db/sqlite";
import { Tx, deleteTransaction, updateTransaction } from "../db/transactionsRepo";

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const EXPENSE_CATEGORIES: Category[] = [
  { id: "food", name: "Food & Dining", icon: "restaurant" },
  { id: "transport", name: "Transportation", icon: "car" },
  { id: "shopping", name: "Shopping", icon: "cart" },
  { id: "entertainment", name: "Entertainment", icon: "game-controller" },
  { id: "bills", name: "Bills & Utilities", icon: "receipt" },
  { id: "health", name: "Health", icon: "medical" },
  { id: "education", name: "Education", icon: "school" },
  { id: "general", name: "General", icon: "folder" },
];

const INCOME_CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", icon: "wallet" },
  { id: "business", name: "Business", icon: "briefcase" },
  { id: "investment", name: "Investment", icon: "trending-up" },
  { id: "gift", name: "Gift", icon: "gift" },
  { id: "other", name: "Other", icon: "cash" },
];
 
export default function ViewTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Tx | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState<"expense" | "income">("expense");
  const [editCategoryId, setEditCategoryId] = useState("general");

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = () => {
    const tx = db.getFirstSync<Tx>(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );
    setTransaction(tx);
    if (tx) {
      setEditAmount(tx.amount.toString());
      setEditNote(tx.note || "");
      setEditType(tx.type);
      setEditCategoryId(tx.categoryId);
    }
  };

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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!transaction) return;

    if (!editAmount || Number(editAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const updatedTx: Tx = {
        ...transaction,
        type: editType,
        amount: Number(editAmount),
        categoryId: editCategoryId,
        note: editNote,
        updatedAt: new Date().toISOString(),
      };

      updateTransaction(updatedTx);
      setTransaction(updatedTx);
      setIsEditMode(false);
      Alert.alert("Success", "Transaction updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update transaction");
      console.error("Update error:", error);
    }
  };

  const handleEditTypeChange = (newType: "expense" | "income") => {
    setEditType(newType);
    setEditCategoryId(newType === "expense" ? "general" : "salary");
  };

  const handleCancelEdit = () => {
    if (transaction) {
      setEditAmount(transaction.amount.toString());
      setEditNote(transaction.note || "");
      setEditType(transaction.type);
      setEditCategoryId(transaction.categoryId);
    }
    setIsEditMode(false);
  };

  const editCategories = editType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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
              <Text style={styles.detailValueSmall}>
                {new Date(transaction.date).toLocaleTimeString("en-US")}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="create-outline" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.detailValueSmall}>
                {new Date(transaction.updatedAt).toLocaleTimeString("en-US")}
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
          onPress={handleEdit}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.editButtonText}>Edit Transaction</Text>
        </Pressable>

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

      <Modal
        visible={isEditMode}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="create" size={48} color="#2196F3" />
              </View>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <Text style={styles.modalSubtitle}>Update transaction details</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.typeSelector}>
                <Pressable
                  onPress={() => handleEditTypeChange("expense")}
                  style={[
                    styles.typeButton,
                    editType === "expense" && styles.typeButtonActive,
                    styles.typeButtonLeft,
                  ]}
                >
                  <Ionicons 
                    name="arrow-down-circle" 
                    size={20} 
                    color={editType === "expense" ? "white" : "#EF5350"} 
                    style={styles.typeIcon}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    editType === "expense" && styles.typeButtonTextActive,
                  ]}>
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleEditTypeChange("income")}
                  style={[
                    styles.typeButton,
                    editType === "income" && styles.typeButtonActiveIncome,
                    styles.typeButtonRight,
                  ]}
                >
                  <Ionicons 
                    name="arrow-up-circle" 
                    size={20} 
                    color={editType === "income" ? "white" : "#4CAF50"} 
                    style={styles.typeIcon}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    editType === "income" && styles.typeButtonTextActive,
                  ]}>
                    Income
                  </Text>
                </Pressable>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {editCategories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setEditCategoryId(category.id)}
                      style={[
                        styles.categoryButton,
                        editCategoryId === category.id && styles.categoryButtonActive,
                      ]}
                    >
                      <Ionicons
                        name={category.icon}
                        size={24}
                        color={editCategoryId === category.id ? "white" : "#666"}
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        editCategoryId === category.id && styles.categoryButtonTextActive,
                      ]}>
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Amount"
                  keyboardType="numeric"
                  value={editAmount}
                  onChangeText={setEditAmount}
                  style={styles.inputField}
                  placeholderTextColor="#999"
                />
                <Text style={styles.currency}>IQD</Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Note (optional)"
                  value={editNote}
                  onChangeText={setEditNote}
                  style={styles.inputField}
                  placeholderTextColor="#999"
                  multiline
                />
              </View>

              <Pressable
                onPress={handleSaveEdit}
                style={styles.saveButton}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>

              <Pressable
                onPress={handleCancelEdit}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  editButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    padding: 24,
    paddingTop: 80,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  typeButtonLeft: {
    borderRightWidth: 0.5,
    borderRightColor: '#e0e0e0',
  },
  typeButtonRight: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#EF5350',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#4CAF50',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    minHeight: 56,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 17,
    fontWeight: '600',
  },
  sectionContainer: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryButton: {
    width: '32%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
    alignItems: 'center',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
});
