import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, KeyboardAvoidingView, Platform, Modal, Alert, ActivityIndicator, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, deleteDoc, getDoc, increment, arrayUnion, arrayRemove, writeBatch, onSnapshot } from 'firebase/firestore';
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

  // Mesajları getir
  useEffect(() => {
    fetchMessages();

    // Her 10 saniyede bir mesajları güncelle
    const messageInterval = setInterval(() => {
      fetchMessages();
    }, 10000);

    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(messageInterval);
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesRef = collection(FIRESTORE_DB, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const messagesData = [];
      for (const doc of querySnapshot.docs) {
        const messageData = { id: doc.id, ...doc.data() };
        
        // Her mesaj için scale değeri ekle
        messageData.scale = new Animated.Value(1);
        
        // Mesajın beğenilip beğenilmediğini kontrol et
        messageData.isLiked = currentUser ? messageData.likedBy?.includes(currentUser.id) : false;
        
        // Yorumları getir ve en yeniden eskiye sırala
        const commentsRef = collection(FIRESTORE_DB, `messages/${doc.id}/comments`);
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        messageData.commentList = commentsSnapshot.docs.map(commentDoc => {
          const commentData = { id: commentDoc.id, ...commentDoc.data() };
          commentData.isLiked = currentUser ? commentData.likedBy?.includes(currentUser.id) : false;
          return commentData;
        });
        
        messageData.comments = messageData.commentList.length;
        messagesData.push(messageData);
      }
      
      setMessages(messagesData);
      setLoading(false);
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      if (!messages.length) { // Sadece hiç mesaj yoksa hata göster
        Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu.');
      }
    }
  };

  const handleSend = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Uyarı', 'Mesaj göndermek için giriş yapmalısınız.');
        return;
      }

      if (!newMessage.trim()) {
        return;
      }

      const messageData = {
        text: newMessage.trim(),
        userId: currentUser.id,
        userName: currentUser.fullName,
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(FIRESTORE_DB, 'messages'), messageData);
      console.log('Message sent successfully by:', currentUser.fullName);

      setNewMessage('');
      await fetchMessages();
      
      // Yeni mesaj gönderildikten sonra en üste scroll yap
      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleAddComment = async () => {
    if (!currentUser) {
      Alert.alert('Uyarı', 'Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    if (newComment.trim() && selectedMessage) {
      try {
        const commentRef = await addDoc(
          collection(FIRESTORE_DB, `messages/${selectedMessage.id}/comments`),
          {
            userId: currentUser.id,
            userName: currentUser.fullName,
            text: newComment.trim(),
        likes: 0,
            likedBy: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );

        // Ana mesajn yorum sayısını güncelle
        await updateDoc(doc(FIRESTORE_DB, 'messages', selectedMessage.id), {
          commentCount: increment(1)
        });

        setNewComment('');
        
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

        // Tüm mesajları da güncelle
        fetchMessages();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Yorum eklenirken hata:', error);
        Alert.alert('Hata', 'Yorum eklenemedi.');
      }
    }
  };

  const handleLikeMessage = async (message) => {
    if (!currentUser) {
      Alert.alert('Uyarı', 'Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      const messageRef = doc(FIRESTORE_DB, 'messages', message.id);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const likedBy = messageDoc.data().likedBy || [];
        const isLiked = likedBy.includes(currentUser.id);
        
        await updateDoc(messageRef, {
          likes: isLiked ? increment(-1) : increment(1),
          likedBy: isLiked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id)
        });
        
        fetchMessages(); // Mesajları yenile
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Beğeni işlemi sırasında hata:', error);
      Alert.alert('Hata', 'Beğeni işlemi gerçekleştirilemedi.');
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
        
        // Seçili mesajın yorumlarını hemen güncelle
        const updatedComments = selectedMessage.commentList.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !isLiked
            };
          }
          return comment;
        });

        setSelectedMessage(prev => ({
          ...prev,
          commentList: updatedComments
        }));
        
        // Arka planda tüm mesajları da güncelle
        fetchMessages();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Yorum beğeni işlemi sırasında hata:', error);
      Alert.alert('Hata', 'Beğeni işlemi gerçekleştirilemedi.');
    }
  };

  const handleDeleteMessage = async () => {
    if (!currentUser || !currentMessage || currentMessage.userId !== currentUser.id) {
      Alert.alert('Uyarı', 'Bu mesajı silme yetkiniz yok.');
      return;
    }

    try {
      // Önce mesajın tüm yorumlarını sil
      const commentsRef = collection(FIRESTORE_DB, `messages/${currentMessage.id}/comments`);
      const commentsSnapshot = await getDocs(commentsRef);
      const batch = writeBatch(FIRESTORE_DB);
      
      commentsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Sonra mesajı sil
      batch.delete(doc(FIRESTORE_DB, 'messages', currentMessage.id));
      await batch.commit();

      setMessages(messages.filter(msg => msg.id !== currentMessage.id));
      setShowOptions(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openComments(item)}>
      <BlurView intensity={80} tint="dark" style={styles.messageContainer}>
        <View style={styles.messageContent}>
          <View style={styles.headerRow}>
            <Text style={styles.username}>{item.userName}</Text>
            <Text style={styles.timestamp}>
              {item.createdAt?.toDate().toLocaleString('tr-TR')}
            </Text>
          </View>
          <Text style={styles.messageText}>{item.text}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleLikeMessage(item)} style={styles.actionButton}>
              <Animated.View style={{ transform: [{ scale: item.scale }] }}>
                <Animated.Text style={[styles.actionText, item.isLiked ? styles.liked : null]}>
                  {item.isLiked ? '❤️' : '🤍'} {item.likes}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openComments(item)} style={styles.actionButton}>
              <Text style={styles.actionText}>💬 {item.comments}</Text>
            </TouchableOpacity>

            {currentUser && currentUser.id === item.userId && (
              <TouchableOpacity onPress={() => handleMoreOptions(item)} style={styles.moreOptionsButton}>
                <Ionicons name="menu" size={24} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderOptionsModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showOptions}
      onRequestClose={() => setShowOptions(false)}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={100} tint="dark" style={styles.modalContent}>
          {/* <TouchableOpacity onPress={handleEditMessage} style={styles.optionButton}>
            <Text style={styles.optionText}>Düzenle</Text>
          </TouchableOpacity> */}
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
            {item.createdAt?.toDate().toLocaleString('tr-TR')}
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

  const renderComments = () => (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={100} tint="dark" style={styles.commentsHeader}>
          <TouchableOpacity onPress={() => setShowComments(false)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#4ECDC4" />
          </TouchableOpacity>      
          <Text style={styles.commentsTitle}>Yorumlar</Text>
        </BlurView>
        <BlurView intensity={80} tint="dark" style={styles.selectedMessageContainer}>
          <View style={styles.selectedMessageContent}>
            <Text style={styles.selectedMessageUsername}>{selectedMessage.user}</Text>
            <Text style={styles.selectedMessageText}>{selectedMessage.text}</Text>
          </View>
        </BlurView>
        <FlatList
          data={selectedMessage.commentList}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshingComments}
          onRefresh={onRefreshComments}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
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
        </KeyboardAvoidingView>
      </SafeAreaView>
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
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
          }}
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
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
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
      // Ekran kapandığında navigation bar'ı tekrar göster
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' }
      });
    };
  }, [navigation]);

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
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: screenWidth * 0.035,
    color: '#fff',
  },
  commentButton: {
    marginLeft: 10,
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
});