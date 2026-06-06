import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AppNavigator } from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { AuthService } from './services/authService';

// Pre-define dark palette for consistent Nexus aesthetic
const NexusDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#131324',
    card: '#1D1D35',
    text: '#FFFFFF',
    border: '#29294C',
    primary: '#7F77DD', // Purple Nexus Accent
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user state on boot
  useEffect(() => {
    const unsubscribe = AuthService.subscribeToAuthChanges((usr) => {
      setUser(usr);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7F77DD" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NexusDarkTheme}>
         {user ? (
           <AppNavigator />
         ) : (
           <AuthScreen onAuthSuccess={setUser} />
         )}
         <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#131324',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
