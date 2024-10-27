import React, { useState } from 'react';
import { View, FlatList, Text, TextInput, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function MessageScreen() {
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      user: 'aysebi',
      text: 'KLUCAMPUS uygulaması sayesinde kampüsteki tüm etkinliklerden haberdar olabiliyorum. Gerçekten çok faydalı!',
      likes: 10,
      comments: 2,
      timestamp: '2024-10-14 12:30',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      commentList: [
        { id: '2', user: 'AliVeli', text: 'Harika bir yorum!', profileImage: 'https://randomuser.me/api/portraits/men/2.jpg', timestamp: '2024-10-14 12:35', likes: 3, isLiked: false },
        { id: '1', user: 'ZeynepS', text: 'Katılıyorum, çok kullanışlı bir uygulama.', profileImage: 'https://randomuser.me/api/portraits/women/3.jpg', timestamp: '2024-10-14 12:32', likes: 1, isLiked: false }
      ],
      isLiked: false,
      scale: new Animated.Value(1),
    },
  ]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: (messages.length + 1).toString(),
        user: 'You',
        text: newMessage,
        likes: 0,
        comments: 0,
        timestamp: new Date().toLocaleString(),
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        commentList: [],
        isLiked: false,
        scale: new Animated.Value(1),
      };
      setMessages([newMsg, ...messages]);
      setNewMessage('');
    }
  };

  const openComments = (message) => {
    setSelectedMessage(message);
    setShowComments(true);
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedMessage) {
      const newCommentObj = {
        id: (selectedMessage.commentList.length + 1).toString(),
        user: 'You',
        text: newComment,
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        timestamp: new Date().toLocaleString(),
        likes: 0,
        isLiked: false,
      };
      const updatedMessages = messages.map((msg) => {
        if (msg.id === selectedMessage.id) {
          return {
            ...msg,
            comments: msg.comments + 1,
            commentList: [newCommentObj, ...msg.commentList],
          };
        }
        return msg;
      });
      setMessages(updatedMessages);
      setNewComment('');
      setSelectedMessage(updatedMessages.find(msg => msg.id === selectedMessage.id));
    }
  };

  const handleLikeMessage = (message) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.id === message.id) {
        const newScale = msg.isLiked ? 1 : 1.5;
        Animated.spring(msg.scale, {
          toValue: newScale,
          useNativeDriver: true,
        }).start(() => {
          if (msg.isLiked) {
            Animated.spring(msg.scale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          }
        });
        
        return {
          ...msg,
          likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1,
          isLiked: !msg.isLiked,
        };
      }
      return msg;
    });
    setMessages(updatedMessages);
  };

  const handleLikeComment = (messageId, commentId) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        const updatedComments = msg.commentList.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            };
          }
          return comment;
        });
        return { ...msg, commentList: updatedComments };
      }
      return msg;
    });
    setMessages(updatedMessages);
    if (selectedMessage && selectedMessage.id === messageId) {
      setSelectedMessage(updatedMessages.find(msg => msg.id === messageId));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openComments(item)}>
      <BlurView intensity={80} tint="dark" style={styles.messageContainer}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <View style={styles.messageContent}>
          <View style={styles.headerRow}>
            <Text style={styles.username}>{item.user}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <Text style={styles.messageText}>{item.text}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={() => handleLikeMessage(item)}>
              <Animated.View style={{ transform: [{ scale: item.scale }] }}>
                <Animated.Text style={[styles.actionText, item.isLiked ? styles.liked : null]}>
                  ❤️ {item.likes}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.actionText}>💬 {item.comments}</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderCommentItem = ({ item }) => (
    <BlurView intensity={80} tint="dark" style={styles.commentContainer}>
      <Image source={{ uri: item.profileImage }} style={styles.commentProfileImage} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.user}</Text>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity 
          style={styles.commentLikeButton} 
          onPress={() => handleLikeComment(selectedMessage.id, item.id)}
        >
          <Text style={[styles.commentLikeText, item.isLiked ? styles.commentLiked : null]}>
            ❤️ {item.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );

  if (showComments && selectedMessage) {
    return (
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
            <Image source={{ uri: selectedMessage.profileImage }} style={styles.selectedMessageProfileImage} />
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
          />
          <BlurView intensity={100} tint="dark" style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum ekleyin..."
              placeholderTextColor="#aaa"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
              <Text style={styles.commentButtonText}>Ekle</Text>
            </TouchableOpacity>
          </BlurView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <BlurView intensity={80} tint="dark" style={styles.agendaContainer}>
          <Text style={styles.agendaTitle}>📅 Üniversite Gündemi</Text>
          <Text style={styles.agendaText}>Bu haftanın gündemi:</Text>
          <View style={styles.eventList}>
            <View style={styles.eventItem}>
              <MaterialIcons name="event" size={20} color="#4ECDC4" />
              <Text style={styles.eventText}>📍 Öğrenci Topluluğu Tanıtım Günü - 21 Ekim</Text>
            </View>
          </View>
        </BlurView>
        
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
        />
        <BlurView intensity={100} tint="dark" style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#aaa"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={styles.commentButtonx} onPress={handleAddComment}>
              {/* <Text style={styles.commentButtonText}>Ekle</Text> */}
              <IconButton
            icon="send"
            size={24}
            // color="#4ECDC4"
            style={styles.commentButtonTextx}
            onPress={handleSend}
          />
            </TouchableOpacity>
          
        </BlurView>
      </SafeAreaView>
    </LinearGradient>
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
    padding: 15,
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
  },
  agendaTitle: {
    fontSize: screenWidth * 0.055,
    color: '#4ECDC4',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  agendaText: {
    fontSize: screenWidth * 0.04,
    color: '#fff',
    marginBottom: 10,
  },
  eventList: {
    marginTop: 5,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78,205,196,0.1)',
    padding: 10,
    borderRadius: 5,
  },
  eventText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: screenWidth * 0.035,
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
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    marginRight: 15,
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
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: screenWidth * 0.035,
    color: '#aaa',
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
    color:  '#4ECDC4',
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
    width: screenWidth * 0.1,
    height: screenWidth * 0.1,
    borderRadius: screenWidth * 0.05,
    marginRight: 10,
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
    color: '#4ECDC4',
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
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: screenWidth * 0.035,
  },
  commentButtonTextx:{
    backgroundColor:"#4ECDC4"
  }
});