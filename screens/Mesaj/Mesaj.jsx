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
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [showCommentOptions, setShowCommentOptions] = useState(false);
  const [refreshingComments, setRefreshingComments] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [agendaTopics, setAgendaTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const navigation = useNavigation();

  const scrollViewRef = useRef(null);

  // Pagination için state'ler
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const MESSAGES_PER_PAGE = 15;

  // iOS için mesaj modal state'i
  const [showMessageModal, setShowMessageModal] = useState(false);

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

  // Yenileme işlemi için fonksiyon
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMessages().then(() => setRefreshing(false));
  }, []);

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

  // Mesajları getir - Pagination ile
  const fetchMessages = async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      const messagesRef = collection(FIRESTORE_DB, 'messages');
      let q = query(
        messagesRef, 
        orderBy('createdAt', 'desc'), 
        limit(MESSAGES_PER_PAGE)
      );
      
      if (loadMore && lastDoc) {
        q = query(
          messagesRef, 
          orderBy('createdAt', 'desc'), 
          startAfter(lastDoc), 
          limit(MESSAGES_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMessages([]);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
      setAllLoaded(querySnapshot.docs.length < MESSAGES_PER_PAGE);

      const messagesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          userId: data.userId,
          userName: data.userName,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          commentCount: data.commentCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          scale: new Animated.Value(1),
          isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
        };
      });
      
      if (loadMore) {
        setMessages(prev => [...prev, ...messagesData]);
      } else {
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // İlk yükleme ve yenileme için useEffect
  useEffect(() => {
    fetchMessages();
    
    // Mesajları gerçek zamanlı dinle
    const messagesRef = collection(FIRESTORE_DB, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    }, (error) => {
      console.error('Mesajları dinlerken hata:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Daha fazla mesaj yükle
  const loadMoreMessages = async () => {
    if (loadingMore || allLoaded || loading) return;
    setLoadingMore(true);
    await fetchMessages(true);
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
      // Optimistik güncelleme
      const tempId = Date.now().toString();
      const tempMessage = {
        id: tempId,
        ...messageData,
        scale: new Animated.Value(1),
        isLiked: false,
      };

      setMessages(prev => [tempMessage, ...prev]);
      setNewMessage('');

      // Firebase'e kaydet
      await addDoc(collection(FIRESTORE_DB, 'messages'), messageData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Yorum ekleme optimizasyonu
  const handleAddComment = async () => {
    if (!currentUser || !newComment.trim() || !selectedMessage) return;

      try {
      const commentData = {
            userId: currentUser.id,
            userName: currentUser.fullName,
            text: newComment.trim(),
        likes: 0,
            likedBy: [],
            createdAt: new Date(),
      };

      // Önce yorum sayısını güncelle
        await updateDoc(doc(FIRESTORE_DB, 'messages', selectedMessage.id), {
          commentCount: increment(1)
        });

      // Sonra yorumu ekle
      await addDoc(
        collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`),
        commentData
      );

        setNewComment('');
        
      // Sadece son 10 yorumu getir
        const commentsRef = collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`);
      const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'), limit(10));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const updatedComments = commentsSnapshot.docs.map(commentDoc => {
        const data = commentDoc.data();
        return {
          id: commentDoc.id,
          ...data,
          isLiked: currentUser ? data.likedBy?.includes(currentUser.id) : false,
        };
      });
      
        setSelectedMessage(prev => ({
          ...prev,
          commentList: updatedComments,
        comments: prev.comments + 1
        }));
        
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

  const handleLikeComment = async (messageId, commentId) => {
    if (!currentUser) {
      Alert.alert('Uyarı', 'Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      const commentRef = doc(FIRESTORE_DB, `messages/${messageId}/comments`, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const likedBy = commentDoc.data().likedBy || [];
        const isLiked = likedBy.includes(currentUser.id);
        
        await updateDoc(commentRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
        });
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Yorum beğeni işlemi sırasında hata:', error);
      Alert.alert('Hata', 'Beğeni işlemi gerçekleştirilemedi.');
    }
  };

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

  const openComments = (message) => {
    setSelectedMessage(message);
    setShowComments(true);
    Haptics.selectionAsync();
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
    if (messages.length === 0) return;

    // Tüm mesajlar için beğeni dinleyicisi
    const unsubscribers = messages.map(message => {
      const messageRef = doc(FIRESTORE_DB, 'messages', message.id);
      return onSnapshot(messageRef, (doc) => {
        if (doc.exists()) {
          const messageData = doc.data();
          setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === message.id) {
              return {
                ...msg,
                likes: messageData.likes || 0,
                likedBy: messageData.likedBy || [],
                isLiked: currentUser ? messageData.likedBy?.includes(currentUser.id) : false
              };
            }
            return msg;
          }));
        }
      });
    });

    // Cleanup
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
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

  // FlatList optimizasyonları
  const memoizedRenderItem = React.useCallback(({ item }) => (
    <MessageItem
      item={item}
      currentUser={currentUser}
      onLike={handleLikeMessage}
      onComment={openComments}
      onOptions={handleMoreOptions}
    />
  ), [currentUser]);

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

        <FlatList
          data={selectedMessage?.commentList}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshingComments}
          onRefresh={onRefreshComments}
        />
      </SafeAreaView>

        <View style={styles.commentInputWrapper}>
          <BlurView intensity={100} tint="dark" style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum ekleyin..."
              placeholderTextColor="#aaa"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </BlurView>
        </View>
    </LinearGradient>
  );

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
        
        <FlatList
          ref={scrollViewRef}
          data={messages}
          renderItem={memoizedRenderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
          contentContainerStyle={styles.messageList}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.loadingContainer}>
              {loading ? (
                <>
                  <ActivityIndicator size="large" color="#4ECDC4" />
                  <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
                </>
              ) : (
                <Text style={styles.noMessagesText}>Henüz hiç mesaj yok.</Text>
              )}
            </View>
          )}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#4ECDC4" />
              </View>
            ) : null
          )}
        />
      </SafeAreaView>

      {Platform.OS === 'ios' ? (
        <TouchableOpacity 
          style={styles.addMessageButton}
          onPress={toggleMessageModal}
        >
          <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
      ) : (
      <View style={styles.inputWrapper}>
        <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınız yazın..."
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
  
  const renderCommentItem = ({ item }) => (
    <BlurView intensity={80} tint="dark" style={styles.commentContainer}>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.userName}</Text>
          <View style={styles.commentHeaderRight}>
            <Text style={styles.commentTimestamp}>
              {item.createdAt instanceof Date ? item.createdAt.toLocaleString('tr-TR') : new Date(item.createdAt).toLocaleString('tr-TR')}
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
            {item.isLiked ? '❤️' : '🤍'} {item.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

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
    marginBottom: Platform.OS === 'ios' ? 90 : 60,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  commentsTitle: {
    fontSize: screenWidth * 0.045,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  selectedMessageContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedMessageProfileImage: {
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    borderRadius: screenWidth * 0.05,
    marginRight: 10,
  },
  selectedMessageContent: {
    flex: 1,
  },
  selectedMessageUsername: {
    fontWeight: 'bold',
    fontSize: screenWidth * 0.04,
    color: '#4ECDC4',
    marginBottom: 5,
  },
  selectedMessageText: {
    fontSize: screenWidth * 0.035,
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
    bottom: Platform.OS === 'ios' ? 130 : 60, // iOS için daha yukarı taşı
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
    paddingVertical: 20,
  },
  loadingText: {
    color: '#4ECDC4',
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
    bottom: Platform.OS === 'ios' ? screenHeight * 0.15 : screenHeight * 0.1,
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
});