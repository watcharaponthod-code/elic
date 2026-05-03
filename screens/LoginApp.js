import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, ScrollView, Image, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, reload, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

// ✅ แทนที่ด้วย Web Client ID จาก Firebase Console > Authentication > Google > Web SDK config
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

const LoginApp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const fadeInValue = useSharedValue(50);
  const slideUpValue = useSharedValue(100);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(fadeInValue.value, { duration: 1000, easing: Easing.out(Easing.ease) }),
    transform: [{ translateY: withTiming(slideUpValue.value, { duration: 1000, easing: Easing.out(Easing.ease) }) }],
  }));

  useEffect(() => {
    requestAnimationFrame(() => {
      fadeInValue.value = 1;
      slideUpValue.value = 0;
    });
    checkPersistedLogin();
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      showMessage({ message: "Google Sign-In Error", description: "Unable to sign in with Google. Please try again.", type: "danger", duration: 3000, icon: "danger" });
    }
  }, [response]);

  const handleGoogleResponse = async (googleResponse) => {
    setIsGoogleLoading(true);
    try {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        uid: user.uid,
        accountName: user.displayName || 'Google User',
        displayName: user.displayName || 'Google User',
        email: user.email,
        photoURL: user.photoURL || null,
        lastLoginAt: serverTimestamp(),
        isAuthenticated: true,
        emailVerified: true,
        loginMethod: 'google',
      };

      if (!userDoc.exists()) {
        await setDoc(userDocRef, { ...userData, createdAt: serverTimestamp() });
      } else {
        await updateDoc(userDocRef, { lastLoginAt: serverTimestamp(), emailVerified: true });
      }

      await AsyncStorage.setItem('user', JSON.stringify({ ...userData, isAuthenticated: true }));
      navigation.reset({ index: 0, routes: [{ name: 'ChatScreen' }] });
    } catch (error) {
      console.error('Google sign-in error:', error);
      showMessage({ message: "Error", description: "Google sign-in failed. Please try again.", type: "danger", duration: 3000, icon: "danger" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const checkPersistedLogin = async () => {
    try {
      const [offlineUser, firebaseUser] = await Promise.all([
        AsyncStorage.getItem('offlineUser'),
        AsyncStorage.getItem('user')
      ]);
      if (offlineUser || firebaseUser) {
        const userData = JSON.parse(offlineUser || firebaseUser);
        if (userData && userData.isAuthenticated) {
          const currentUser = auth.currentUser;
          if (currentUser && !currentUser.emailVerified && userData.loginMethod !== 'google') return;
          navigation.reset({ index: 0, routes: [{ name: 'ChatScreen' }] });
        }
      }
    } catch (error) {
      console.error('Error checking persisted login:', error);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!email || !password) {
        showMessage({ message: "Oops!", description: "Please enter your email and password", type: "warning", duration: 3000, icon: "warning" });
        return;
      }
      if (!validateEmail(email)) {
        showMessage({ message: "Oops!", description: "Invalid email format", type: "warning", duration: 3000, icon: "warning" });
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      await reload(user);

      if (!user.emailVerified) {
        showMessage({ message: "Email not verified", description: "Please verify your email before logging in.", type: "info", duration: 4000, icon: "info", backgroundColor: "#3498db" });
        await auth.signOut();
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { lastLoginAt: serverTimestamp(), emailVerified: true });
        await AsyncStorage.setItem('user', JSON.stringify({ ...userDoc.data(), isAuthenticated: true, emailVerified: true }));
        navigation.reset({ index: 0, routes: [{ name: 'ChatScreen' }] });
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error) => {
    const messages = {
      'auth/invalid-email': 'Email format is invalid.',
      'auth/user-not-found': 'Email or password is incorrect.',
      'auth/wrong-password': 'Email or password is incorrect.',
      'auth/invalid-login-credentials': 'Email or password is incorrect.',
      'auth/too-many-requests': 'Too many login attempts. Please wait.',
    };
    showMessage({ message: "Oops!", description: messages[error.code] || 'Please try again.', type: "danger", duration: 5000, icon: "danger", backgroundColor: "#C0392B" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false} bounces={false}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <View style={styles.view}>
            <Image source={require('../assets/elic.png')} resizeMode="contain" style={styles.logo} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Elic</Text>
            <Text style={styles.subtitle}>Your English Learning Companion</Text>
          </View>

          <View style={styles.formCard}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => setEmail(t.replace(/\s+/g, '').trim())}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              placeholderTextColor="#999"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholderTextColor="#999"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeBtn}>
                <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={20} color="#452A0D" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity style={[styles.loginBtn, isLoading && styles.btnDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? <ActivityIndicator size="small" color="#FEF8E2" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.googleBtn, (isGoogleLoading || !request) && styles.btnDisabled]}
              onPress={() => { setIsGoogleLoading(true); promptAsync(); }}
              disabled={isGoogleLoading || !request}
              activeOpacity={0.85}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#452A0D" />
              ) : (
                <>
                  <Image source={{ uri: 'https://www.google.com/favicon.ico' }} style={styles.googleIcon} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity onPress={() => navigation.navigate('SignUpApp')} style={styles.signupLink}>
              <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupBold}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <FlashMessage position="top" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF8E2' },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1, paddingBottom: 40 },
  view: { alignItems: 'center', marginTop: '12%', marginBottom: 8 },
  logo: { width: 90, height: 90 },
  titleContainer: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#452A0D', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8D6E52' },
  formCard: {
    backgroundColor: '#452A0D',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  label: { color: '#E0DBC2', fontSize: 14, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  input: {
    backgroundColor: '#EAE7DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#303233',
    marginBottom: 16,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eyeBtn: { padding: 12, marginLeft: 8 },
  forgotContainer: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#E0DBC2', fontSize: 13 },
  loginBtn: {
    backgroundColor: '#E0DBC2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  loginBtnText: { color: '#452A0D', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#6B4226' },
  dividerText: { color: '#AF9880', marginHorizontal: 12, fontSize: 13 },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleBtnText: { color: '#303233', fontSize: 15, fontWeight: '600' },
  signupLink: { alignItems: 'center' },
  signupText: { color: '#AF9880', fontSize: 14 },
  signupBold: { color: '#E0DBC2', fontWeight: 'bold' },
});

export default LoginApp;
