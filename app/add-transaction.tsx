import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { v4 as uuid } from "uuid";
import { addTx } from "../db/transactionsRepo";
import { useAuth } from "../hooks/useAuth";

export default function AddTransaction() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const save = () => {
    if (!user) return;
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
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22 }}>Add Transaction</Text>

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Note"
        value={note}
        onChangeText={setNote}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Pressable
        onPress={save}
        style={{ backgroundColor: "#111", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Save</Text>
      </Pressable>
    </View>
  );
}
