import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function App() {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');

  useEffect(() => {
    const socketURL = 'http://10.0.2.2:9090/api/ws'; // this is a local url

    // Initialize SockJS and STOMP
    const socket = new SockJS(socketURL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket!');

      // subscribe to a topic
      client.subscribe('/topic/messages', (message) => {
        setMessages((prevMessages) => [...prevMessages, message.body]);
      });
    };

    client.onStompError = (error) => {
      console.error('Detailed STOMP Error:', error);
      console.log('Connection Details:', {
        url: socketURL,
        readyState: socket.readyState
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && inputMessage) {
      const messagePayload = {
        conversationId: 59,
        message: inputMessage,
        userId: 2,
        fileKey: null
      };
  
      stompClient.publish({
        destination: '/app/message',
        body: JSON.stringify(messagePayload),
      });
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>WebSocket Test Client</Text>
      <ScrollView style={styles.messageContainer}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>
            {msg}
          </Text>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder="Enter a message"
      />
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messageContainer: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    marginVertical: 5,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
