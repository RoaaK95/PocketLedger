import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { initDb } from "../../db/sqlite";
export default function TabsLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <Tabs>
      <Tabs.Screen
       name="index"
       options={{
         title: "Dashboard",
         tabBarIcon:  ({color, size}) =>(
          <Ionicons name="home" size={size} color={color} />
         ),    
        }}
      />
      <Tabs.Screen
       name="transactions"
        options={{ 
          title: "Transactions",
          tabBarIcon: ({color,size}) =>(
           <Ionicons name="list" size={size} color={color} />
          ),
           }}
            />
      <Tabs.Screen
       name="settings"
        options={{
           title: "Settings",
           tabBarIcon: ({color, size}) => (
            <Ionicons name="settings" size={size} color={color} />
           )
            }}
             />
    </Tabs>
  );
}
