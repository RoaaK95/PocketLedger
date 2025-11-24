import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { auth, db } from "../../firebase/config";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    //create user profile and role

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      role: "user",
      currency: "IQD",
    });

    router.replace("/");
    //goes to tabs
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
        style={{ backgroundColor: "#111", padding: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Sign up</Text>
      </Pressable>

      <Pressable onPress={() => router.push("./sign-in")}>
        <Text>Already have an account? Sign in</Text>
      </Pressable>
    </View>
  );
}
