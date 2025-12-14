// Firebase Helper Functions para Hotel Wari System
import {
    collection,
    doc,
    setDoc,
    getDocs,
    onSnapshot,
    query,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Guarda un array de datos en una colección de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @param {Array} data - Array de objetos a guardar
 */
export const saveToFirestore = async (collectionName, data) => {
    try {
        const batch = writeBatch(db);
        const collectionRef = collection(db, collectionName);

        // Si es un array, guardar cada elemento con su ID
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const docId = item.id?.toString() || item.numero?.toString() || `item_${index}`;
                const docRef = doc(collectionRef, docId);
                batch.set(docRef, item);
            });
        } else {
            // Si es un objeto único, guardarlo directamente
            const docRef = doc(collectionRef, 'data');
            batch.set(docRef, data);
        }

        await batch.commit();
        console.log(`✅ Datos guardados en Firestore: ${collectionName}`);
        return true;
    } catch (error) {
        console.error(`❌ Error guardando en Firestore (${collectionName}):`, error);
        return false;
    }
};

/**
 * Carga datos desde una colección de Firestore
 * @param {string} collectionName - Nombre de la colección
 * @returns {Promise<Array>} Array de documentos
 */
export const loadFromFirestore = async (collectionName) => {
    try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef);
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ ...doc.data(), _firestoreId: doc.id });
        });

        console.log(`✅ Datos cargados desde Firestore: ${collectionName} (${data.length} items)`);
        return data;
    } catch (error) {
        console.error(`❌ Error cargando desde Firestore (${collectionName}):`, error);
        return [];
    }
};

/**
 * Suscribe a cambios en tiempo real de una colección
 * @param {string} collectionName - Nombre de la colección
 * @param {Function} callback - Función que se ejecuta cuando hay cambios
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToCollection = (collectionName, callback) => {
    try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ ...doc.data(), _firestoreId: doc.id });
            });

            console.log(`🔄 Actualización en tiempo real: ${collectionName} (${data.length} items)`);
            callback(data);
        }, (error) => {
            console.error(`❌ Error en suscripción (${collectionName}):`, error);
        });

        return unsubscribe;
    } catch (error) {
        console.error(`❌ Error creando suscripción (${collectionName}):`, error);
        return () => { }; // Retornar función vacía en caso de error
    }
};

/**
 * Migra datos de localStorage a Firestore (ejecutar solo una vez)
 */
export const migrateLocalStorageToFirestore = async () => {
    console.log('🔄 Iniciando migración de localStorage a Firestore...');

    const collections = [
        'hotel-wari-habitaciones',
        'hotel-wari-inventario',
        'hotel-wari-amenities',
        'hotel-wari-historial-amenities',
        'hotel-wari-historial-ventas',
        'hotel-wari-historial-checkins',
        'hotel-wari-clientes',
        'hotel-wari-mensajes'
    ];

    const results = [];

    for (const key of collections) {
        try {
            const localData = localStorage.getItem(key);
            if (localData) {
                const data = JSON.parse(localData);
                const firestoreKey = key.replace('hotel-wari-', '');

                await saveToFirestore(firestoreKey, data);
                results.push({ collection: firestoreKey, status: 'success', items: data.length });
                console.log(`✅ Migrado: ${firestoreKey} (${data.length} items)`);
            }
        } catch (error) {
            console.error(`❌ Error migrando ${key}:`, error);
            results.push({ collection: key, status: 'error', error: error.message });
        }
    }

    console.log('✅ Migración completada:', results);
    return results;
};

/**
 * Verifica si Firestore está disponible y funcionando
 */
export const testFirestoreConnection = async () => {
    try {
        const testRef = collection(db, 'test');
        await getDocs(testRef);
        console.log('✅ Conexión a Firestore exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a Firestore:', error);
        return false;
    }
};
