// src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import PlayerScreen from '../screens/PlayerScreen';
import MiniPlayer from '../components/MiniPlayer';
import ArtistScreen from '../screens/ArtistsScreen';
import MusicPlayer from '../screens/MusicPlayer';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {



  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* MAIN APP WITH BOTTOM BAR */}
        <Stack.Screen name="MainTabs" component={BottomTabs} />

        <Stack.Screen name="Player" component={PlayerScreen} />
        <Stack.Screen name="Artist" component={ArtistScreen} />
        <Stack.Screen name="MusicPlayer" component={MusicPlayer} />
      </Stack.Navigator>

      {/* MINI PLAYER ABOVE BOTTOM BAR */}
      <MiniPlayer />
    </>
  );
}
