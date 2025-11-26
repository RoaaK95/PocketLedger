import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { v4 as uuid } from "uuid";
import { addTx } from "../db/transactionsRepo";
import { useAuth } from "../hooks/useAuth";

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

export default function AddTransaction() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState("general");

  const save = () => {
    if (!user) return;
    
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const now = new Date().toISOString();

    const transaction = {
      id: uuid(),
      userId: user.uid,
      type: type,
      amount: Number(amount),
      categoryId: categoryId,
      note,
      date: now,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending" as const,
    };

    console.log("Saving transaction with categoryId:", transaction.categoryId);
    addTx(transaction);

    router.back();
  };

  const handleTypeChange = (newType: "expense" | "income") => {
    setType(newType);
    setCategoryId(newType === "expense" ? "general" : "salary");
  };

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="add-circle" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Add Transaction</Text>
          <Text style={styles.subtitle}>Record a new financial entry</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => handleTypeChange("expense")}
              style={[
                styles.typeButton,
                type === "expense" && styles.typeButtonActive,
                styles.typeButtonLeft,
              ]}
            >
              <Ionicons 
                name="arrow-down-circle" 
                size={20} 
                color={type === "expense" ? "white" : "#EF5350"} 
                style={styles.typeIcon}
              />
              <Text style={[
                styles.typeButtonText,
                type === "expense" && styles.typeButtonTextActive,
              ]}>
                Expense
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleTypeChange("income")}
              style={[
                styles.typeButton,
                type === "income" && styles.typeButtonActiveIncome,
                styles.typeButtonRight,
              ]}
            >
              <Ionicons 
                name="arrow-up-circle" 
                size={20} 
                color={type === "income" ? "white" : "#4CAF50"} 
                style={styles.typeIcon}
              />
              <Text style={[
                styles.typeButtonText,
                type === "income" && styles.typeButtonTextActive,
              ]}>
                Income
              </Text>
            </Pressable>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[
                    styles.categoryButton,
                    categoryId === category.id && styles.categoryButtonActive,
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={categoryId === category.id ? "white" : "#666"}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    categoryId === category.id && styles.categoryButtonTextActive,
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
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <Text style={styles.currency}>IQD</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Note (optional)"
              value={note}
              onChangeText={setNote}
              style={styles.input}
              placeholderTextColor="#999"
              multiline
            />
          </View>

          <Pressable
            onPress={save}
            style={styles.saveButton}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
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
  input: {
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
  saveIcon: {
    marginRight: 8,
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
