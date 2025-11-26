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
          <Pressable
            onPress={() => router.push(`/view-transaction?id=${item.id}`)}
            style={{ padding: 12, borderWidth: 1, marginBottom: 8, backgroundColor: 'white', borderRadius: 8 }}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.type.toUpperCase()} - {item.amount} IQD </Text>
            <Text>{item.note}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>{new Date(item.date).toDateString()}</Text>
          </Pressable>
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
