import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "solariq.firebaseapp.com",
  databaseURL: "https://solariq-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "solariq",
  storageBucket: "solariq.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);