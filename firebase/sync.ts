 import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db as sql } from "../db/sqlite";
import type { Tx } from "../db/transactionsRepo";
import { db as fs } from "./config";

export function getPendingTxs(userId: string): Tx[] {
  const rows = sql.getAllSync<Tx>(
    `SELECT * FROM transactions 
     WHERE userId = ? AND syncStatus != 'synced'`,
    [userId]
  );
  console.log("Pending local transactions:", rows.length);
  return rows;
}

export async function syncTxs(userId: string) {
  console.log("syncTxs called with userId:", userId);

  // Sync user profile data first
  await syncUserProfile(userId);

  const pending = getPendingTxs(userId);
  if (!pending.length) {
    console.log("No pending transactions to sync.");
    return { total: 0, synced: 0, deleted: 0 };
  }

  const colRef = collection(fs, "users", userId, "transactions");

  let synced = 0;
  let deleted = 0;

  for (const tx of pending) {
    console.log("Syncing tx:", tx.id, "status:", tx.syncStatus);
    const txRef = doc(colRef, tx.id);

    if (tx.syncStatus === "deleted") {
      await deleteDoc(txRef);
      sql.runSync(`DELETE FROM transactions WHERE id = ?`, [tx.id]);
      deleted++;
    } else {
      // Update syncStatus to 'synced' before pushing to Firebase
      const syncedTx = { ...tx, syncStatus: "synced" as const };
      await setDoc(txRef, syncedTx, { merge: true });
      sql.runSync(`UPDATE transactions SET syncStatus = 'synced' WHERE id = ?`, [
        tx.id,
      ]);
      synced++;
    }
  }

  console.log("Sync finished. Synced:", synced, "Deleted:", deleted);
  return { total: pending.length, synced, deleted };
}

async function syncUserProfile(userId: string) {
  try {
    const pendingNameSync = await AsyncStorage.getItem(`user_name_pending_sync_${userId}`);
    const pendingImageSync = await AsyncStorage.getItem(`user_image_pending_sync_${userId}`);
    
    const updateData: any = {};
    
    // Sync name if pending
    if (pendingNameSync === 'true') {
      const userName = await AsyncStorage.getItem(`user_name_${userId}`);
      if (userName !== null) {
        updateData.name = userName;
        updateData.displayName = userName;
        await AsyncStorage.removeItem(`user_name_pending_sync_${userId}`);
        console.log("User name synced to Firebase:", userName);
      }
    }
    
    // Sync profile image if pending
    if (pendingImageSync === 'true') {
      const imageUri = await AsyncStorage.getItem(`user_image_${userId}`);
      if (imageUri) {
        try {
          // Convert image to base64 and store directly in Firestore
          const base64Image = await convertImageToBase64(imageUri);
          updateData.profileImageUrl = base64Image;
          await AsyncStorage.removeItem(`user_image_pending_sync_${userId}`);
          console.log("Profile image synced to Firebase");
        } catch (error) {
          console.error("Error uploading profile image:", error);
        }
      }
    }
    
    // Update Firestore if there's data to sync
    if (Object.keys(updateData).length > 0) {
      const userDocRef = doc(fs, "users", userId);
      await setDoc(userDocRef, updateData, { merge: true });
    }
  } catch (error) {
    console.error("Error syncing user profile:", error);
  }
}

async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error("Base64 conversion error:", error);
    throw new Error(`Failed to convert image: ${error.message}`);
  }
}

export async function loadUserProfileFromFirebase(userId: string) {
  try {
    const userDocRef = doc(fs, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      
      // Load and save display name
      const displayName = data.displayName || data.name;
      if (displayName) {
        await AsyncStorage.setItem(`user_name_${userId}`, displayName);
        console.log("User profile loaded from Firebase:", displayName);
      }
      
      // Load and save profile image URL
      if (data.profileImageUrl) {
        await AsyncStorage.setItem(`user_image_${userId}`, data.profileImageUrl);
        console.log("Profile image URL loaded from Firebase");
      }
      
      return displayName || null;
    }
  } catch (error) {
    console.error("Error loading user profile from Firebase:", error);
  }
  return null;
}
