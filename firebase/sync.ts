 import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
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
