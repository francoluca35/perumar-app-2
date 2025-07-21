import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  const uri = process.env.MONGODB_URI;

  // Solo si la variable no está definida logueamos advertencia (no crasheamos el build)
  if (!uri) {
    console.warn("MONGODB_URI no está definido en tiempo de build.");
  } else {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    };

    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
