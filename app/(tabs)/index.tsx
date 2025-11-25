import { Pressable, Text, View } from "react-native";
import { syncTxs } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", gap:12 }}>
      <Text>Dashboard</Text>

      <Pressable
        onPress={() => user && syncTxs(user.uid)}
        style={{ backgroundColor:"#111", padding:12 }}
      >
        <Text style={{ color:"white" }}>Sync now</Text>
      </Pressable>
    </View>
  );
}
