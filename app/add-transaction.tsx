import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { v4 as uuid } from "uuid";
import { addTx } from "../db/transactionsRepo";
import { useAuth } from "../hooks/useAuth";

export default function AddTransaction() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const save = () => {
    if (!user) return;
    
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const now = new Date().toISOString();

    addTx({
      id: uuid(),
      userId: user.uid,
      type: "expense",
      amount: Number(amount),
      categoryId: "general",
      note,
      date: now,
      createdAt: now,
      updatedAt: now,
      syncStatus: "pending",
    });

    router.back();
  };

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
  form: {
    gap: 16,
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
});
