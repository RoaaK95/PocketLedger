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
    const pendingSync = await AsyncStorage.getItem(`user_name_pending_sync_${userId}`);
    
    if (pendingSync === 'true') {
      const userName = await AsyncStorage.getItem(`user_name_${userId}`);
      
      if (userName !== null) {
        const userDocRef = doc(fs, "users", userId);
        // Update both 'name' and 'displayName' fields for consistency
        await setDoc(userDocRef, { name: userName, displayName: userName }, { merge: true });
        
        // Clear pending sync flag
        await AsyncStorage.removeItem(`user_name_pending_sync_${userId}`);
        console.log("User profile synced to Firebase:", userName);
      }
    }
  } catch (error) {
    console.error("Error syncing user profile:", error);
  }
}

export async function loadUserProfileFromFirebase(userId: string) {
  try {
    const userDocRef = doc(fs, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Check both 'name' (from sign-up) and 'displayName' (from sync)
      const displayName = data.displayName || data.name;
      if (displayName) {
        await AsyncStorage.setItem(`user_name_${userId}`, displayName);
        console.log("User profile loaded from Firebase:", displayName);
        return displayName;
      }
    }
  } catch (error) {
    console.error("Error loading user profile from Firebase:", error);
  }
  return null;
}
