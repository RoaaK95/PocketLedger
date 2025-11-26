import { db } from "./sqlite";

export type Tx = {
  id: string;
  userId: string;
  type: "expense" | "income";
  amount: number;
  categoryId: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: "pending" | "synced" | "deleted";
};

export function addTx(tx: Tx) {
  db.runSync(
    `INSERT INTO transactions 
     (id,userId,type,amount,categoryId,note,date,createdAt,updatedAt,syncStatus)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      tx.id, tx.userId, tx.type, tx.amount, tx.categoryId,
      tx.note ?? "", tx.date, tx.createdAt, tx.updatedAt, tx.syncStatus
    ]
  );
}

export function listTxs(userId: string) {
  return db.getAllSync<Tx>(
    `SELECT * FROM transactions 
     WHERE userId=? AND syncStatus != 'deleted' 
     ORDER BY date DESC`,
    [userId]
  );
}

export function deleteTransaction(id: string){
  //Hard delete from local database
  db.runSync(
    `DELETE FROM transactions WHERE id = ?`,
    [id]
  );
}
