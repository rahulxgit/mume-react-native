import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeTabs from './HomeTabs';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomBottomBar from '../components/BottomBar';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeTabs} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
