import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from "../hooks/useAuth";

function RootNavigator() {
  const {user, loading} = useAuth();
  
  if(loading) return null
  //apply splash screen later

  return(
    <Stack screenOptions={{headerShown: false}}>
      {!user ? (
       <Stack.Screen name="(auth)" />
      ):(
      <Stack.Screen name="(tabs)" />
      )}

    </Stack>
  );
}

export default function Layout(){
  return(
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}