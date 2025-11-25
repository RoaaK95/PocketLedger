import { signOut } from "firebase/auth";
import { Alert, Pressable, Text, View } from "react-native";
import { auth } from "../../firebase/config";

export default function Settings() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <View style={{ flex:1, padding:20, gap:12 }}>
      <Text style={{ fontSize:22 }}>Settings</Text>

      <Pressable
        onPress={handleLogout}
        style={{ backgroundColor:"#c00", padding:12 }}
      >
        <Text style={{ color:"white", textAlign:"center" }}>Logout</Text>
      </Pressable>
    </View>
  );
}
