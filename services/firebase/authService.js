import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { AUTH } from '../../configs/FirebaseConfig';

export const authService = {
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(AUTH, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(AUTH, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(AUTH);
    } catch (error) {
      throw error;
    }
  },

  onAuthStateChange(callback) {
    return onAuthStateChanged(AUTH, callback);
  },

  getCurrentUser() {
    return AUTH.currentUser;
  }
}; 