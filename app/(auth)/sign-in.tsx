import { router } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { auth } from "../../firebase/config";

export default function SignIn(){
    const [email, setEmail]= useState("");
    const [password, setPassword] = useState("");

    const onSubmit = async () =>{
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/");
    };

    return(
         <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Welcome back</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10 }} />

      <Pressable onPress={onSubmit} style={{ backgroundColor: "#111", padding: 12 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Sign in</Text>
      </Pressable>

      <Pressable onPress={() => router.push("./sign-up")}>
        <Text>No account? Sign up</Text>
      </Pressable>
    </View>
    )
}