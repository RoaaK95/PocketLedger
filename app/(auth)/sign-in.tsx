import { router } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { auth } from "../../firebase/config";

export default function SignIn(){
    const [email, setEmail]= useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () =>{
        // Validate email
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
            Alert.alert("Error", "Please enter your password");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.replace("/");
        } catch (error: any) {
            console.error(error);
            let message = "Failed to sign in";
            if (error.code === "auth/invalid-email") {
                message = "Invalid email address";
            } else if (error.code === "auth/user-not-found") {
                message = "No account found with this email";
            } else if (error.code === "auth/wrong-password") {
                message = "Incorrect password";
            } else if (error.code === "auth/invalid-credential") {
                message = "Invalid email or password";
            }
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return(
         <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Welcome back</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10 }} />

      <Pressable onPress={onSubmit} disabled={loading} style={{ backgroundColor: loading ? "#666" : "#111", padding: 12 }}>
        <Text style={{ color: "white", textAlign: "center" }}>{loading ? "Signing in..." : "Sign in"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("./sign-up")}>
        <Text>No account? Sign up</Text>
      </Pressable>
    </View>
    )
}