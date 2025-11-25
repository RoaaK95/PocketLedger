import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
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
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={txs}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, marginBottom: 8 }}>
            <Text>{item.type.toUpperCase()} - {item.amount}</Text>
            <Text>{item.note}</Text>
            <Text>{new Date(item.date).toDateString()}</Text>
          </View>
        )}
      />

      <Pressable
        onPress={() => router.push("/add-transaction")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 30,
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>+</Text>
      </Pressable>
    </View>
  );
}
