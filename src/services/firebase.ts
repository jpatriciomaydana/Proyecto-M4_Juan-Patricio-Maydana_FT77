import { initializeApp } from "firebase/app"; //conecta con servidores firebase//
import { getAuth } from "firebase/auth"; //manejar usuarios //
import { getFirestore } from "firebase/firestore"; //bases de datos en tiempo real //


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

//inicializa la app//

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);        //autorización
export const db = getFirestore(app);       //base de datos
