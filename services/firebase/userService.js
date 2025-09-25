import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../configs/FirebaseConfig';

export const userService = {
  async createUser(userId, userData) {
    try {
      const userRef = doc(FIRESTORE_DB, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return userRef;
    } catch (error) {
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const userRef = doc(FIRESTORE_DB, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const userRef = doc(FIRESTORE_DB, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const userRef = doc(FIRESTORE_DB, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      throw error;
    }
  },

  async getUserByEmail(email) {
    try {
      const q = query(collection(FIRESTORE_DB, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}; 