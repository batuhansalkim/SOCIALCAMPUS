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
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../configs/FirebaseConfig';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const mealService = {
  async addReaction(mealId, userId, reactionType) {
    try {
      // Local user ise AsyncStorage'a kaydet
      if (userId.startsWith('local_')) {
        const localReactions = await this.getLocalReactions(mealId);
        localReactions[userId] = reactionType;
        await AsyncStorage.setItem(`meal_reactions_${mealId}`, JSON.stringify(localReactions));
        return;
      }

      // Firebase user ise Firestore'a kaydet
      const reactionRef = doc(FIRESTORE_DB, 'meal_reactions', `${mealId}_${userId}`);
      await setDoc(reactionRef, {
        mealId,
        userId,
        reactionType,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  },

  async removeReaction(mealId, userId) {
    try {
      // Local user ise AsyncStorage'dan sil
      if (userId.startsWith('local_')) {
        const localReactions = await this.getLocalReactions(mealId);
        delete localReactions[userId];
        await AsyncStorage.setItem(`meal_reactions_${mealId}`, JSON.stringify(localReactions));
        return;
      }

      // Firebase user ise Firestore'dan sil
      const reactionRef = doc(FIRESTORE_DB, 'meal_reactions', `${mealId}_${userId}`);
      await deleteDoc(reactionRef);
    } catch (error) {
      throw error;
    }
  },

  async getUserReaction(mealId, userId) {
    try {
      // Local user ise AsyncStorage'dan al
      if (userId.startsWith('local_')) {
        const localReactions = await this.getLocalReactions(mealId);
        const reactionType = localReactions[userId];
        return reactionType ? { reactionType } : null;
      }

      // Firebase user ise Firestore'dan al
      const reactionRef = doc(FIRESTORE_DB, 'meal_reactions', `${mealId}_${userId}`);
      const reactionSnap = await getDoc(reactionRef);
      
      if (reactionSnap.exists()) {
        return reactionSnap.data();
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  async getMealReactions(mealId) {
    try {
      const reactions = {
        like: 0,
        dislike: 0
      };

      // Local reactions'ları al
      const localReactions = await this.getLocalReactions(mealId);
      Object.values(localReactions).forEach(reactionType => {
        if (reactionType === 'like') {
          reactions.like++;
        } else if (reactionType === 'dislike') {
          reactions.dislike++;
        }
      });

      // Firebase reactions'ları al
      const q = query(collection(FIRESTORE_DB, 'meal_reactions'), where('mealId', '==', mealId));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.reactionType === 'like') {
          reactions.like++;
        } else if (data.reactionType === 'dislike') {
          reactions.dislike++;
        }
      });
      
      return reactions;
    } catch (error) {
      throw error;
    }
  },

  async getLocalReactions(mealId) {
    try {
      const localReactionsStr = await AsyncStorage.getItem(`meal_reactions_${mealId}`);
      return localReactionsStr ? JSON.parse(localReactionsStr) : {};
    } catch (error) {
      console.error('Error getting local reactions:', error);
      return {};
    }
  },

  onMealReactionsChange(mealId, callback) {
    // Local reactions için basit bir callback sistemi
    // Gerçek zamanlı güncellemeler için Firebase'i kullan
    const q = query(collection(FIRESTORE_DB, 'meal_reactions'), where('mealId', '==', mealId));
    return onSnapshot(q, async (snapshot) => {
      const reactions = {
        like: 0,
        dislike: 0
      };
      
      // Local reactions'ları ekle
      const localReactions = await this.getLocalReactions(mealId);
      Object.values(localReactions).forEach(reactionType => {
        if (reactionType === 'like') {
          reactions.like++;
        } else if (reactionType === 'dislike') {
          reactions.dislike++;
        }
      });

      // Firebase reactions'ları ekle
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.reactionType === 'like') {
          reactions.like++;
        } else if (data.reactionType === 'dislike') {
          reactions.dislike++;
        }
      });
      
      callback(reactions);
    });
  }
}; 