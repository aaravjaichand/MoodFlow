import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyB4kemWUZud6xGbpqwy5JadEsAWDxibRlA",
    authDomain: "moodflow-e76bc.firebaseapp.com",
    projectId: "moodflow-e76bc",
    storageBucket: "moodflow-e76bc.appspot.com",
    messagingSenderId: "27011197913",
    appId: "1:27011197913:web:default",
    databaseURL: "https://moodflow-e76bc-default-rtdb.firebaseio.com/"
    
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app; 