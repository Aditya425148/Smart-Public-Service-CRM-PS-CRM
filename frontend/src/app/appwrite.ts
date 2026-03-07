import { Client, Account, Databases, Storage } from "appwrite";

// Appwrite configuration — set these in .env.local to enable Appwrite features
const APPWRITE_ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "";

// Database & collection IDs — create these in the Appwrite Console
export const DATABASE_ID =
  import.meta.env.VITE_APPWRITE_DATABASE_ID || "civicpulse_db";
export const COMPLAINTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_COMPLAINTS_COLLECTION_ID || "complaints";
export const BUCKET_ID =
  import.meta.env.VITE_APPWRITE_BUCKET_ID || "complaint_photos";

// Initialize Appwrite client
const client = new Client();
if (APPWRITE_PROJECT_ID) {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

export default client;
