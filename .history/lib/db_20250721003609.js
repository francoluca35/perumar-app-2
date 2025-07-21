import clientPromise from "./mongodb";

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(); // Usamos la base por default del URI
  return db;
}
