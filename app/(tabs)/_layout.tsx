import { Tabs } from "expo-router";
import { useEffect } from "react";
import { initDb } from "../../db/sqlite";

export default function TabsLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
