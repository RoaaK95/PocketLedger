import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { syncTxs } from "../../firebase/sync";
import { useAuth } from "../../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncMsg, setLastSyncMsg] = useState<string | null>(null);

  const handleSync = async () => {
    if (!user) return;

    try {
      setSyncing(true);
      const result = await syncTxs(user.uid);

      const msg =
        result.total === 0
          ? "No pending changes to sync."
          : `Synced ${result.synced} of ${result.total} changes. Deleted ${result.deleted}.`;

      setLastSyncMsg(msg);
      Alert.alert("Sync complete", msg);
    } catch (err: any) {
      console.error("Sync error", err);
      Alert.alert("Sync failed", err?.message || "Unknown error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 8 }}>Dashboard</Text>

      <Pressable
        onPress={handleSync}
        disabled={syncing || !user}
        style={{
          backgroundColor: syncing ? "#666" : "#111",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          opacity: syncing ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          {syncing ? "Syncing..." : "Sync now"}
        </Text>
      </Pressable>

      {lastSyncMsg && (
        <Text style={{ marginTop: 8, fontSize: 14, textAlign: "center" }}>
          {lastSyncMsg}
        </Text>
      )}
    </View>
  );
}
