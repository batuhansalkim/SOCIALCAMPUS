import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, KeyboardAvoidingView, Platform, Modal, Alert, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, deleteDoc, getDoc, increment, arrayUnion, arrayRemove, writeBatch, onSnapshot, limit, startAfter } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MessageScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newComment, setNewComment] = useState('');
  const [refreshingComments, setRefreshingComments] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [agendaTopics, setAgendaTopics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();
  const MESSAGES_PER_PAGE = 15;
  const scrollViewRef = useRef(null);

  // İlk yükleme için useEffect
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        // Mesajları gerçek zamanlı dinle
        const messagesRef = collection(FIRESTORE_DB, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id, // Benzersiz ID'yi garanti et
              ...data,
              scale: new Animated.Value(1),
              isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
              comments: data.commentCount || 0,
              commentList: [],
              createdAt: data.createdAt?.toDate() || new Date(),
            };
          });

          // Duplicate kontrolü yaparak set et
          setMessages(prev => {
            const uniqueMessages = messagesData.filter((newMsg, index, self) =>
              index === self.findIndex((msg) => msg.id === newMsg.id)
            );
            return uniqueMessages;
          });
          
          setLoading(false);
          
          const lastVisible = snapshot.docs[snapshot.docs.length - 1];
          setLastDoc(lastVisible);
          setAllLoaded(snapshot.docs.length < MESSAGES_PER_PAGE);
        }, (error) => {
          console.error('Mesajları dinlerken hata:', error);
          setLoading(false);
          Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu.');
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Initial messages loading error:', error);
        setLoading(false);
        Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu.');
      }
    };

    loadInitialMessages();
  }, [currentUser]);

  // Mesajları dinleme fonksiyonu
  const listenToMessages = () => {
    const messagesRef = collection(FIRESTORE_DB, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));
    
    return onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scale: new Animated.Value(1),
          isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
          comments: data.commentCount || 0,
          commentList: [],
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      
      setMessages(messagesData);
      setLoading(false);
      
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setAllLoaded(snapshot.docs.length < MESSAGES_PER_PAGE);
    });
  };

  // useEffect içinde mesajları dinle
  useEffect(() => {
    const unsubscribe = listenToMessages();
    return () => unsubscribe();
  }, [currentUser]);

  // Yenileme işlemi için fonksiyon
  const onRefresh = React.useCallback(async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
        const messagesRef = collection(FIRESTORE_DB, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));
        
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              scale: new Animated.Value(1),
              isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
              comments: data.commentCount || 0,
              commentList: [],
              createdAt: data.createdAt?.toDate() || new Date(),
            };
      });

      setMessages(messagesData);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setAllLoaded(querySnapshot.docs.length < MESSAGES_PER_PAGE);
      } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, currentUser]);

  // Mesajları getir - Pagination ile
  const fetchMessages = async (loadMore = false) => {
    if (!loadMore) return; // Sadece loadMore true olduğunda çalışsın

    try {
      setLoadingMore(true);

      const messagesRef = collection(FIRESTORE_DB, 'messages');
      const q = query(
          messagesRef, 
          orderBy('createdAt', 'desc'), 
          startAfter(lastDoc), 
          limit(MESSAGES_PER_PAGE)
        );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAllLoaded(true);
        return;
      }
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setAllLoaded(querySnapshot.docs.length < MESSAGES_PER_PAGE);

      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scale: new Animated.Value(1),
          createdAt: data.createdAt?.toDate() || new Date(),
          isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
          likedBy: data.likedBy || [],
          likes: data.likes || 0,
          comments: data.commentCount || 0
        };
      });

        setMessages(prev => [...prev, ...fetchedMessages]);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Mesajlar yüklenemedi.');
    } finally {
      setLoadingMore(false);
    }
  };

  // iOS için mesaj modalını aç/kapa
  const toggleMessageModal = () => {
    setShowMessageModal(!showMessageModal);
  };

  // iOS için mesaj modalı
  const renderMessageModal = () => (
    <Modal
      transparent={true}
      visible={showMessageModal}
      animationType="slide"
      onRequestClose={toggleMessageModal}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
      <View style={styles.messageModalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.messageModalContent}>
          <View style={styles.messageModalHeader}>
            <Text style={styles.messageModalTitle}>Yeni Mesaj</Text>
            <TouchableOpacity onPress={toggleMessageModal} style={styles.messageModalClose}>
              <Ionicons name="close" size={24} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.messageModalInput}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#aaa"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            autoFocus
          />
          <TouchableOpacity 
            style={styles.messageModalSend} 
            onPress={() => {
              handleSend();
              toggleMessageModal();
            }}
          >
            <Text style={styles.messageModalSendText}>Gönder</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Kullanıcı bilgisini al
  useEffect(() => {
    getCurrentUser();
    const checkUserDataInterval = setInterval(async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          const currentUserStr = JSON.stringify(currentUser);
          const newUserStr = JSON.stringify(userData);
          
          if (currentUserStr !== newUserStr) {
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking user data updates:', error);
      }
    }, 2000); // Her 2 saniyede bir kontrol et

    return () => clearInterval(checkUserDataInterval);
  }, []); // currentUser dependency'sini kaldırdık

  // Kullanıcı bilgisini al
  const getCurrentUser = async () => {
    try {
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (userLoggedIn === 'true' && userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      setCurrentUser(null);
    }
  };

  // Mesaj gönderme optimizasyonu
  const handleSend = async () => {
    if (!currentUser || !newMessage.trim()) return;

      const messageData = {
        text: newMessage.trim(),
        userId: currentUser.id,
        userName: currentUser.fullName,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: new Date(),
      };

    try {
      setNewMessage(''); // Önce input'u temizle
      
      // Firebase'e kaydet
      const docRef = await addDoc(collection(FIRESTORE_DB, 'messages'), messageData);
      
      // Optimistik güncelleme - yeni mesajı eklerken duplicate kontrolü yap
      const newMessageObj = {
        id: docRef.id,
        ...messageData,
        scale: new Animated.Value(1),
        isLiked: false,
      };

      setMessages(prev => {
        // Duplicate kontrolü
        const isDuplicate = prev.some(msg => msg.id === newMessageObj.id);
        if (isDuplicate) return prev;
        return [newMessageObj, ...prev];
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Yorum ekleme optimizasyonu
  const handleAddComment = async () => {
    if (!currentUser || !newComment.trim() || !selectedMessage) return;

      const commentData = {
            userId: currentUser.id,
            userName: currentUser.fullName,
            text: newComment.trim(),
        likes: 0,
            likedBy: [],
            createdAt: new Date(),
      };

    try {
      // Firebase'e kaydet
      const commentRef = await addDoc(
        collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`),
        commentData
      );

      await updateDoc(doc(FIRESTORE_DB, 'messages', selectedMessage.id), {
        commentCount: increment(1)
      });

      setNewComment('');
      setShowCommentModal(false);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Yorum eklenirken hata:', error);
        Alert.alert('Hata', 'Yorum eklenemedi.');
    }
  };

  // Beğeni işlemi optimizasyonu
  const handleLikeMessage = async (message) => {
    if (!currentUser) {
      Alert.alert('Uyarı', 'Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      const isLiked = message.likedBy?.includes(currentUser.id);
      
      // Optimistik güncelleme
      setMessages(prev => prev.map(msg => {
        if (msg.id === message.id) {
          return {
            ...msg,
            likes: isLiked ? msg.likes - 1 : msg.likes + 1,
            likedBy: isLiked 
              ? msg.likedBy.filter(id => id !== currentUser.id)
              : [...(msg.likedBy || []), currentUser.id],
            isLiked: !isLiked
          };
        }
        return msg;
      }));

      // Firebase'e kaydet
      const messageRef = doc(FIRESTORE_DB, 'messages', message.id);
        await updateDoc(messageRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
        });
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata:', error);
      // Hata durumunda geri al
      setMessages(prev => prev.map(msg => {
        if (msg.id === message.id) {
          return {
            ...msg,
            likes: message.likes,
            likedBy: message.likedBy,
            isLiked: message.isLiked
          };
        }
        return msg;
      }));
    }
  };

  // Yorum beğeni fonksiyonu
  const handleLikeComment = async (messageId, commentId) => {
    if (!currentUser) return;

    try {
      const commentRef = doc(FIRESTORE_DB, `messages/${messageId}/comments`, commentId);
      
      // Optimistik güncelleme
      setSelectedMessage(prevMessage => {
        const updatedComments = prevMessage.commentList.map(comment => {
          if (comment.id === commentId) {
            const isCurrentlyLiked = comment.likedBy?.includes(currentUser.id);
            return {
              ...comment,
              likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: isCurrentlyLiked 
                ? comment.likedBy.filter(id => id !== currentUser.id)
                : [...(comment.likedBy || []), currentUser.id]
            };
          }
          return comment;
        });
        
        return {
          ...prevMessage,
          commentList: updatedComments
        };
      });

      // Firebase güncelleme
      const commentDoc = await getDoc(commentRef);
      const currentLikedBy = commentDoc.data().likedBy || [];
      const isLiked = currentLikedBy.includes(currentUser.id);

      await updateDoc(commentRef, {
        likes: isLiked ? increment(-1) : increment(1),
        likedBy: isLiked 
          ? arrayRemove(currentUser.id)
          : arrayUnion(currentUser.id)
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata:', error);
    }
  };

  // Yorumları dinleme fonksiyonu
  const listenToComments = (messageId) => {
    if (!messageId) return null;

    const commentsRef = collection(FIRESTORE_DB, `messages/${messageId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setSelectedMessage(prev => {
        if (prev?.id === messageId) {
          return {
        ...prev,
        commentList: comments
          };
        }
        return prev;
      });
    });
  };

  // useEffect içinde yorumları dinle
  useEffect(() => {
    if (selectedMessage?.id) {
      const unsubscribe = listenToComments(selectedMessage.id);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [selectedMessage?.id]);

  // Mesaj silme optimizasyonu
  const handleDeleteMessage = async () => {
    if (!currentUser || !currentMessage || currentMessage.userId !== currentUser.id) {
      Alert.alert('Uyarı', 'Bu mesajı silme yetkiniz yok.');
      return;
    }

    try {
      // Önce UI'dan kaldır
      setMessages(prev => prev.filter(msg => msg.id !== currentMessage.id));
      setShowOptions(false);

      // Sonra Firebase'den sil
      const batch = writeBatch(FIRESTORE_DB);
      
      // Yorumları sil
      const commentsRef = collection(FIRESTORE_DB, `messages/${currentMessage.id}/comments`);
      const commentsSnapshot = await getDocs(commentsRef);
      commentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Mesajı sil
      batch.delete(doc(FIRESTORE_DB, 'messages', currentMessage.id));
      await batch.commit();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
      // Hata durumunda mesajı geri getir
      fetchMessages();
      Alert.alert('Hata', 'Mesaj silinemedi.');
    }
  };

  const handleMoreOptions = (message) => {
    console.log('Options menu opened for:', message.text); // Hangi mesaj için açıldığını kontrol edin
    setCurrentMessage(message);
    setShowOptions(true);
  };

  const handleDeleteComment = async () => {
    if (!currentUser || !currentComment || currentComment.userId !== currentUser.id) {
      Alert.alert('Uyarı', 'Bu yorumu silme yetkiniz yok.');
      return;
    }

    try {
      // Yorumu sil
      await deleteDoc(doc(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`, currentComment.id));
      
      // Ana mesajın yorum sayısını güncelle
      await updateDoc(doc(FIRESTORE_DB, 'messages', selectedMessage.id), {
        commentCount: increment(-1)
      });

      // Seçili mesajın yorumlarını güncelle
      const commentsRef = collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const updatedComments = commentsSnapshot.docs.map(commentDoc => {
        const commentData = { id: commentDoc.id, ...commentDoc.data() };
        commentData.isLiked = currentUser ? commentData.likedBy?.includes(currentUser.id) : false;
        return commentData;
      });
      
      // Seçili mesajı güncelle
      setSelectedMessage(prev => ({
        ...prev,
        commentList: updatedComments,
        comments: updatedComments.length
      }));

      setShowCommentOptions(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
      Alert.alert('Hata', 'Yorum silinemedi.');
    }
  };

  const handleCommentOptions = (comment) => {
    setCurrentComment(comment);
    setShowCommentOptions(true);
  };

  // Yorumları yenileme fonksiyonu
  const onRefreshComments = React.useCallback(async () => {
    if (!selectedMessage) return;
    
    setRefreshingComments(true);
    try {
      // Yorumları getir
      const commentsRef = collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const updatedComments = commentsSnapshot.docs.map(commentDoc => {
        const commentData = { id: commentDoc.id, ...commentDoc.data() };
        commentData.isLiked = currentUser ? commentData.likedBy?.includes(currentUser.id) : false;
        return commentData;
      });
      
      // Seçili mesajı güncelle
      setSelectedMessage(prev => ({
        ...prev,
        commentList: updatedComments,
        comments: updatedComments.length
      }));
    } catch (error) {
      console.error('Yorumlar yenilenirken hata:', error);
    } finally {
      setRefreshingComments(false);
    }
  }, [selectedMessage, currentUser]);

  // Gündem konularını Firebase'den çek
  useEffect(() => {
    console.log('Fetching agenda topics...');
    const topicsQuery = query(
      collection(FIRESTORE_DB, 'agendaTopics'),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(topicsQuery, (snapshot) => {
      console.log('Snapshot received:', snapshot.size, 'documents');
      const topics = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        console.log('Topic data:', data);
        return data;
      });
      setAgendaTopics(topics);
    }, (error) => {
      console.error('Error fetching topics:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Tüm mesajlar için beğeni dinleyicisi
    const unsubscribers = messages.map(message => {
      if (!message?.id) return () => {}; // Geçersiz mesaj kontrolü

      const messageRef = doc(FIRESTORE_DB, 'messages', message.id);
      return onSnapshot(messageRef, (doc) => {
        if (doc.exists()) {
          const messageData = doc.data();
          setMessages(prevMessages => {
            if (!prevMessages) return []; // Null kontrolü
            return prevMessages.map(msg => {
            if (msg.id === message.id) {
              return {
                ...msg,
                likes: messageData.likes || 0,
                likedBy: messageData.likedBy || [],
                isLiked: currentUser ? messageData.likedBy?.includes(currentUser.id) : false
              };
            }
            return msg;
            });
          });
        }
      });
    });

    // Cleanup
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [messages, currentUser]);

  useEffect(() => {
    if (!selectedMessage) return;

    // Seçili mesajın yorumları için beğeni dinleyicisi
    const commentUnsubscribers = selectedMessage.commentList.map(comment => {
      const commentRef = doc(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`, comment.id);
      return onSnapshot(commentRef, (doc) => {
        if (doc.exists()) {
          const commentData = doc.data();
          setSelectedMessage(prevMessage => {
            if (!prevMessage) return prevMessage;
            return {
              ...prevMessage,
              commentList: prevMessage.commentList.map(c => {
                if (c.id === comment.id) {
                  return {
                    ...c,
                    likes: commentData.likes || 0,
                    likedBy: commentData.likedBy || [],
                    isLiked: currentUser ? commentData.likedBy?.includes(currentUser.id) : false
                  };
                }
                return c;
              })
            };
          });
        }
      });
    });

    // Cleanup
    return () => {
      commentUnsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [selectedMessage, currentUser]);

  // Yorumlar için gerçek zamanlı dinleyici
  useEffect(() => {
    if (!selectedMessage?.id) return;

    const commentsRef = collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`);
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(commentsQuery, {
      next: (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isLiked: currentUser ? doc.data().likedBy?.includes(currentUser.id) : false,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setSelectedMessage(prev => ({
        ...prev,
          commentList: comments,
          comments: comments.length
      }));
      },
      error: (error) => {
      console.error('Yorumları dinlerken hata:', error);
      }
    });

    return () => unsubscribe();
  }, [selectedMessage?.id, currentUser]);

  // Mesaja tıklama işleyicisi
  const handleMessagePress = async (message) => {
    if (!message) return;
    
    try {
      setLoading(true);
      setSelectedMessage(message);
      setShowComments(true);
      
      // Yorumları getir
      const commentsRef = collection(FIRESTORE_DB, `messages/${message.id}/comments`);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const comments = commentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });

      // Yorumları state'e kaydet
      setSelectedMessage(prev => ({
        ...prev,
        commentList: comments
      }));

      // Yorumlar için gerçek zamanlı dinleyici ekle
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const updatedComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isLiked: currentUser ? doc.data().likedBy?.includes(currentUser.id) : false,
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        setSelectedMessage(prev => ({
          ...prev,
          commentList: updatedComments
        }));
      });

      // Cleanup fonksiyonunu döndür
      return () => unsubscribe();

    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Yorumlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // FlatList optimizasyonları
  const memoizedRenderItem = React.useCallback(({ item }) => {
    if (!item) return null; // Null kontrolü

    return (
    <MessageItem
      item={item}
      currentUser={currentUser}
      onLike={handleLikeMessage}
        onComment={handleMessagePress}
      onOptions={handleMoreOptions}
    />
    );
  }, [currentUser]);

  const keyExtractor = React.useCallback((item) => item.id, []);

  const getItemLayout = React.useCallback((data, index) => ({
    length: 120, // Tahmini yükseklik
    offset: 120 * index,
    index,
  }), []);

  // Performans için ayrı Message bileşeni
  const MessageItem = React.memo(({ item, currentUser, onLike, onComment, onOptions }) => (
    <TouchableOpacity onPress={() => onComment(item)}>
      <BlurView intensity={80} tint="dark" style={styles.messageContainer}>
        <View style={styles.messageContent}>
          <View style={styles.headerRow}>
            <Text style={styles.username}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt instanceof Date ? item.createdAt.toLocaleString('tr-TR') : new Date(item.createdAt).toLocaleString('tr-TR')}
            </Text>
          </View>
          <Text style={styles.messageText}>{item.text}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => onLike(item)} style={styles.actionButton}>
              <Animated.View style={{ transform: [{ scale: item.scale }] }}>
                <Animated.Text style={[styles.actionText, item.isLiked ? styles.liked : null]}>
                  {item.isLiked ? '❤️' : '🤍'} {item.likes}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onComment(item)} style={styles.actionButton}>
              <Text style={styles.actionText}>💬 {item.comments}</Text>
            </TouchableOpacity>

            {currentUser && currentUser.id === item.userId && (
              <TouchableOpacity onPress={() => onOptions(item)} style={styles.moreOptionsButton}>
                <Ionicons name="menu" size={24} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  ));

  const renderComments = () => (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={100} tint="dark" style={styles.commentsHeader}>
          <TouchableOpacity onPress={() => setShowComments(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#4ECDC4" />
          </TouchableOpacity>      
          <Text style={styles.commentsTitle}>Yorumlar</Text>
        </BlurView>

        <BlurView intensity={80} tint="dark" style={styles.selectedMessageContainer}>
          <View style={styles.selectedMessageContent}>
            <Text style={styles.selectedMessageUsername}>{selectedMessage?.userName}</Text>
            <Text style={styles.selectedMessageText}>{selectedMessage?.text}</Text>
                  </View>
          </BlurView>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
          </View>
        ) : selectedMessage?.commentList?.length > 0 ? (
        <FlatList
            data={selectedMessage.commentList}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshingComments}
          onRefresh={onRefreshComments}
        />
        ) : (
          <View style={styles.noCommentsContainer}>
            <Text style={styles.noCommentsText}>Henüz yorum yapılmamış</Text>
          </View>
        )}

        {Platform.OS === 'ios' ? (
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => setShowCommentModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.commentInputWrapper}>
            <BlurView intensity={100} tint="dark" style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorumunuzu yazın..."
                placeholderTextColor="#aaa"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </BlurView>
            </View>
          )}

        <Modal
          transparent={true}
          visible={showCommentModal}
          animationType="slide"
          onRequestClose={() => setShowCommentModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={styles.commentModalContainer}>
              <BlurView intensity={100} tint="dark" style={styles.commentModalContent}>
                <View style={styles.commentModalHeader}>
                  <Text style={styles.commentModalTitle}>Yeni Yorum</Text>
                  <TouchableOpacity onPress={() => setShowCommentModal(false)} style={styles.commentModalClose}>
                    <Ionicons name="close" size={24} color="#4ECDC4" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.commentModalInput}
                  placeholder="Yorumunuzu yazın..."
                  placeholderTextColor="#aaa"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  autoFocus
                />
        <TouchableOpacity 
                  style={styles.commentModalSend} 
                  onPress={() => {
                    handleAddComment();
                    setShowCommentModal(false);
                  }}
                >
                  <Text style={styles.commentModalSendText}>Gönder</Text>
              </TouchableOpacity>
              </BlurView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
    </SafeAreaView>
    </LinearGradient>
  );

  // Klavye event listener'ları
  useEffect(() => {
    if (Platform.OS === 'ios') {
    const keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        (e) => {
        setKeyboardVisible(true);
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
      () => {
        setKeyboardVisible(false);
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'flex' }
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' }
      });
    };
    }
  }, [navigation]);

  // Modal render fonksiyonları
  const renderOptionsModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showOptions}
      onRequestClose={() => setShowOptions(false)}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.modalContent}>
          <TouchableOpacity onPress={handleDeleteMessage} style={styles.optionButton}>
            <Text style={styles.optionText}>Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOptions(false)} style={styles.optionButton}>
            <Text style={styles.optionText}>Kapat</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
  
  const renderCommentItem = ({ item }) => {
    if (!item) return null; // Null kontrolü ekle

    return (
    <BlurView intensity={80} tint="dark" style={styles.commentContainer}>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>{item.userName || 'Anonim'}</Text>
          <View style={styles.commentHeaderRight}>
            <Text style={styles.commentTimestamp}>
                {item.createdAt instanceof Date ? 
                  item.createdAt.toLocaleString('tr-TR') : 
                  new Date(item.createdAt).toLocaleString('tr-TR')}
            </Text>
            {currentUser && currentUser.id === item.userId && (
              <TouchableOpacity 
                onPress={() => handleCommentOptions(item)} 
                style={styles.commentOptionsButton}
              >
                <Ionicons name="menu" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity 
          style={styles.commentLikeButton} 
          onPress={() => handleLikeComment(selectedMessage.id, item.id)}
        >
          <Text style={[styles.commentLikeText, item.isLiked ? styles.commentLiked : null]}>
              {item.isLiked ? '❤️' : '🤍'} {item.likes || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
  };

  const renderCommentOptionsModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showCommentOptions}
      onRequestClose={() => setShowCommentOptions(false)}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.modalContent}>
          <TouchableOpacity onPress={handleDeleteComment} style={styles.optionButton}>
            <Text style={styles.optionText}>Sil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCommentOptions(false)} style={styles.optionButton}>
            <Text style={styles.optionText}>Kapat</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );

  // Daha fazla mesaj yükle
  const loadMoreMessages = async () => {
    if (loadingMore || allLoaded || loading) return;
    setLoadingMore(true);
    await fetchMessages(true);
  };

  const renderMainScreen = () => (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={80} tint="dark" style={styles.agendaContainer}>
          <View style={styles.agendaHeader}>
            <Text style={styles.agendaTitle}>🎯 Gündem Konuları</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.topicsScrollView}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {agendaTopics.length > 0 ? (
              agendaTopics.map((topic) => (
                <View
                  key={topic.id}
                  style={styles.topicCard}
                >
                  <View style={styles.topicRow}>
                    <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noTopicsContainer}>
                <Text style={styles.noTopicsText}>Gündem konuları yükleniyor...</Text>
              </View>
            )}
          </ScrollView>
        </BlurView>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
          </View>
        ) : messages && messages.length > 0 ? (
          <FlatList
            data={messages}
            renderItem={memoizedRenderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={loadingMore ? <ActivityIndicator color="#4ECDC4" /> : null}
          />
        ) : (
          <View style={styles.noTopicsContainer}>
            <Text style={styles.noTopicsText}>Henüz mesaj yok</Text>
          </View>
        )}

        {Platform.OS === 'ios' ? (
          <TouchableOpacity 
            style={styles.addMessageButton}
            onPress={() => setShowMessageModal(true)}
          >
            <Ionicons name="add" size={30} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.inputWrapper}>
            <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor="#aaa"
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
        {Platform.OS === 'ios' && renderMessageModal()}
      </SafeAreaView>
    </LinearGradient>
  );

  return (
  <>
    {showComments ? renderComments() : renderMainScreen()}
    {renderOptionsModal()}
    {renderCommentOptionsModal()}
  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  agendaContainer: {
    padding: 8,
    borderRadius: 10,
    margin: 10,
    marginBottom: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  agendaHeader: {
    marginBottom: 5,
    alignItems: 'center',
  },
  agendaTitle: {
    fontSize: screenWidth * 0.05,
    color: '#4ECDC4',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  agendaSubtitle: {
    display: 'none',
  },
  topicsScrollView: {
    marginTop: 5,
  },
  topicCard: {
    backgroundColor: 'rgba(78,205,196,0.1)',
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
    width: 'auto',
    minWidth: screenWidth * 0.3,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.2)',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  topicEmoji: {
    fontSize: screenWidth * 0.05,
    marginRight: 8,
  },
  topicTitle: {
    color: '#fff',
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
  },
  topicStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCount: {
    color: '#aaa',
    fontSize: screenWidth * 0.035,
  },
  hotBadge: {
    backgroundColor: 'rgba(255,82,82,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  hotBadgeText: {
    color: '#FF5252',
    fontSize: screenWidth * 0.035,
    fontWeight: '600',
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 70 : 60,
  },
  messageContainer: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    overflow: 'hidden',
  },
 profileImage: {
    display: 'none', // Profil resmini gizle
  },
  messageContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: screenWidth * 0.04,
    color: '#4ECDC4',
  },
  timestamp: {
    color: '#aaa',
    fontSize: screenWidth * 0.03,
  },
  messageText: {
    fontSize: screenWidth * 0.035,
    color: '#fff',
    marginBottom: 10,
  },
  actionRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start', // solda hizala
},
  actionButton: {
    flexDirection: 'row', // Align text and icon horizontally
    alignItems: 'center',
    marginRight: 15, // Add some space between buttons
  },
  actionText: {
  fontSize: screenWidth * 0.035,
  color: '#aaa',
  marginRight: 5, // butonlar arasındaki mesafeyi ayarlayın
},
  liked: {
    color: '#4ECDC4',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    height: 60,
    zIndex: 999,
    elevation: 999,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.04,
    color: '#fff',
  },
  moreOptionsButton: {
    marginLeft: 'auto', // Sağda hizalayacak
    padding: 5,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 15,
  },
  commentsTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  selectedMessageContainer: {
    padding: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedMessageContent: {
    padding: 10,
  },
  selectedMessageUsername: {
    fontSize: screenWidth * 0.04,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 5,
  },
  selectedMessageText: {
    fontSize: screenWidth * 0.04,
    color: '#fff',
  },
  commentsList: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },
  commentContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  commentProfileImage: {
    display: 'none', // Yorumlardaki profil resmini gizle
  },
  commentContent: {
    flex: 1,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#4ECDC4',
    fontSize: screenWidth * 0.035,
  },
  commentTimestamp: {
    fontSize: screenWidth * 0.03,
    color: '#aaa',
  },
  commentText: {
    fontSize: screenWidth * 0.035,
    color: '#fff',
    marginBottom: 5,
  },
  commentLikeButton: {
    alignSelf: 'flex-start',
  },
  commentLikeText: {
    fontSize: screenWidth * 0.035,
    color: '#aaa',
  },
  commentLiked: {
    color: '#ff0000',
  },
  commentInputWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 60, // Android için 60 olarak ayarlandı
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    zIndex: 999,
    elevation: 999,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: 60,
    zIndex: 999,
    elevation: 999,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.04,
    color: '#fff',
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  loadingText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    marginTop: 10,
  },
  noMessagesText: {
    color: '#aaa',
    fontSize: screenWidth * 0.04,
    textAlign: 'center',
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentOptionsButton: {
    marginLeft: 10,
    padding: 5,
  },
  noTopicsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noTopicsText: {
    color: '#aaa',
    fontSize: screenWidth * 0.04,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: screenWidth * 0.8,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,30,30,0.9)',
    padding: 20,
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    fontWeight: '500',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 130 : 60, // iOS için daha yukarı taşı
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    zIndex: 999,
    elevation: 999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    height: 60,
    zIndex: 999,
    elevation: 999,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.04,
    color: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  addMessageButton: {
    position: 'absolute',
    right: screenWidth * 0.05,
    bottom: Platform.OS === 'ios' ? screenHeight * 0.2 : screenHeight * 0.12,
    backgroundColor: '#4ECDC4',
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  addCommentButton: {
    position: 'absolute',
    right: screenWidth * 0.05,
    bottom: Platform.OS === 'ios' ? screenHeight * 0.13 : screenHeight * 0.12,
    backgroundColor: '#4ECDC4',
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 999,
  },
  messageModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageModalContent: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.3,
  },
  messageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  messageModalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  messageModalClose: {
    padding: 5,
  },
  messageModalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: screenWidth * 0.04,
    minHeight: screenHeight * 0.15,
    textAlignVertical: 'top',
  },
  messageModalSend: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  messageModalSendText: {
    color: '#000',
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
  },
  commentModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: screenHeight * 0.3,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  commentModalTitle: {
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  commentModalClose: {
    padding: 5,
  },
  commentModalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: screenWidth * 0.04,
    minHeight: screenHeight * 0.15,
    textAlignVertical: 'top',
  },
  commentModalSend: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  commentModalSendText: {
    color: '#000',
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    color: '#aaa',
    fontSize: screenWidth * 0.04,
    textAlign: 'center',
  },
});