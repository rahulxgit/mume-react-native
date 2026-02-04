import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import Header from '../components/Header';
import HomeScreen from '../screens/HomeScreen';
import SongsScreen from '../screens/SongsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import { useTheme } from '../theme/ThemeContext';

export default function HomeTabs() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('Suggested');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Songs':
        return <SongsScreen />;
      case 'Artists':
        return <ArtistsScreen />;
      case 'Albums':
        return <AlbumsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ACTIVE TAB SCREEN */}
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
