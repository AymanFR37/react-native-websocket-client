import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function App() {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const conversationId = 59; // Replace with the actual conversation ID

  useEffect(() => {
    const socketURL = 'https://socker.peaqock.com/api/ws';
  
    const socket = new SockJS(socketURL);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });
  
    client.onConnect = () => {
      console.log('Connected to WebSocket!');
  
      const topic = `/topic/conversation/${conversationId}`;
      console.log('topic :', topic);
      client.subscribe(topic, (message) => {
        const messageBody = JSON.parse(message.body); // Parse the JSON
        console.log('messageBody :', messageBody);
  
        // Update messages with the content
        setMessages((prevMessages) => [
          ...prevMessages,
          `${messageBody.sender.firstName}: ${messageBody.message}`,
        ]);
      });
    };
  
    client.onStompError = (error) => {
      console.error('STOMP Error:', error);
    };
  
    client.activate();
    setStompClient(client);
  
    return () => {
      client.deactivate();
    };
  }, [conversationId]);   // Reinitialize if conversationId changes

  const sendMessage = () => {
    if (stompClient && inputMessage) {
      const messagePayload = {
        conversationId,
        message: inputMessage,
        userId: 8953, // Replace with the actual user ID
        fileKey: null,
      };

      stompClient.publish({
        destination: '/app/message', // Matches the @MessageMapping path in the backend
        body: JSON.stringify(messagePayload),
      });
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conversation {conversationId}</Text>
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
