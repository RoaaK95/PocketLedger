import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../../firebase/config";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter a password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      //create user profile and role

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: "user",
        currency: "IQD",
      });

      router.replace("/");
      //goes to tabs
    } catch (error: any) {
      console.error(error);
      let message = "Failed to create account";
      if (error.code === "auth/invalid-email") {
        message = "Invalid email address";
      } else if (error.code === "auth/email-already-in-use") {
        message = "An account with this email already exists";
      } else if (error.code === "auth/weak-password") {
        message = "Password is too weak";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Create account</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Pressable
        onPress={onSubmit}
        disabled={loading}
        style={{ backgroundColor: loading ? "#666" : "#111", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>{loading ? "Creating account..." : "Sign up"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("./sign-in")}>
        <Text>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
}
