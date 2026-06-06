import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Home, Compass, Users, Target, Inbox, Award } from 'lucide-react-native';
import NexusNavBar from '../components/NexusNavBar';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ConnectScreen from '../screens/ConnectScreen';
import MissionScreen from '../screens/MissionScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <NexusNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Mission"
        component={MissionScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Target color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={size - 2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1C1C32',
    borderTopWidth: 1,
    borderTopColor: '#2D2D4F',
    paddingTop: 8,
    paddingBottom: 12,
    height: 64,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
