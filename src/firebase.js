// Configuración de Firebase para Hotel Wari System
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyATixBHyAwmw5qmL0yaY_YcK3T0jXWGh4o",
    authDomain: "hotel-wari-system.firebaseapp.com",
    projectId: "hotel-wari-system",
    storageBucket: "hotel-wari-system.firebasestorage.app",
    messagingSenderId: "861939303664",
    appId: "1:861939303664:web:52638c123bb55d26e6e35",
    measurementId: "G-VN534FK3R3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

export { db };
