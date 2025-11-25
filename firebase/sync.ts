import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db as sql } from "../db/sqlite";
import { Tx } from "../db/transactionsRepo";
import { db as fs } from "./config";

export function getPendingTxs(userId: string) {
  return sql.getAllSync<Tx>(
    `SELECT * FROM transactions WHERE userId=? AND syncStatus != 'synced'`,
    [userId]
  );
}

export async function syncTxs(userId: string) {
  const pending = getPendingTxs(userId);
  const colRef = collection(fs, "users", userId, "transactions");

  for (const tx of pending) {
    const txRef = doc(colRef, tx.id);

    if (tx.syncStatus === "deleted") {
      await deleteDoc(txRef);
      sql.runSync(`DELETE FROM transactions WHERE id=?`, [tx.id]);
    } else {
      await setDoc(txRef, tx, { merge: true });
      sql.runSync(`UPDATE transactions SET syncStatus='synced' WHERE id=?`, [
        tx.id,
      ]);
    }
  }
}
