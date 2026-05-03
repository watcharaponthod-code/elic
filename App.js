import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './screens/LoginScreen';
import LoginApp from './screens/LoginApp';
import SignUpApp from './screens/SignUpApp';
import ChatScreen from './screens/ChatScreen';
import ForgotPassword from './screens/ForgotPassword';
import Menu from './screens/menu';
import ProfileScreen from './screens/profile';
import WordGame from './screens/game/WordGame';
import Translation from './screens/game/Translation';
import Match from './screens/game/Match';
import Rank from './screens/game/Rank';
import Scoreboard from './screens/game/Scoreboard';
import 'react-native-gesture-handler';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#452A0D" />
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FEF8E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineUser, setOfflineUser] = useState(null);

  const setupAuthAndOfflineSupport = async () => {
    try {
      const [offlineUserData, firebaseUserData] = await Promise.all([
        AsyncStorage.getItem('offlineUser'),
        AsyncStorage.getItem('user')
      ]);

      if (offlineUserData || firebaseUserData) {
        const userData = JSON.parse(offlineUserData || firebaseUserData);
        setOfflineUser(userData);
        setIsAuthenticated(true);
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              lastLoginAt: new Date().toISOString(),
              isAuthenticated: true
            };
            await Promise.all([
              AsyncStorage.setItem('offlineUser', JSON.stringify(userData)),
              AsyncStorage.setItem('user', JSON.stringify(userData))
            ]);
            setOfflineUser(userData);
            setIsAuthenticated(true);
          } else {
            await Promise.all([
              AsyncStorage.removeItem('offlineUser'),
              AsyncStorage.removeItem('user')
            ]);
            setOfflineUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error managing auth state:', error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error in setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setupAuthAndOfflineSupport();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "ChatScreen" : "LoginScreen"}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginApp" component={LoginApp} options={{ headerShown: true, headerTransparent: true, headerTitle: '' }} />
        <Stack.Screen name="SignUpApp" component={SignUpApp} options={{ headerShown: true, headerTransparent: true, headerTitle: '' }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: true, headerTransparent: true, headerTitle: '' }} />
        <Stack.Screen name="Menu" component={Menu} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WordGame" component={WordGame} options={{ headerShown: false }} />
        <Stack.Screen name="Translation" component={Translation} options={{ headerShown: false }} />
        <Stack.Screen name="Match" component={Match} options={{ headerShown: false }} />
        <Stack.Screen name="Rank" component={Rank} options={{ headerShown: false }} />
        <Stack.Screen name="Scoreboard" component={Scoreboard} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
