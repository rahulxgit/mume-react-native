import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  activeTab: string;
  onTabChange?: (tab: string) => void;
};

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums'];
const ACCENT = '#FF7A00';

// import logos
const darkLogo = require('../assets/darklogo.png');
const whiteLogo = require('../assets/whitelogo.png');

export default function Header({ activeTab, onTabChange }: Props) {
  const { colors, theme } = useTheme();

  const logoSource = theme === 'dark' ? whiteLogo : darkLogo;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.logoWrap}>
          <Image source={logoSource} style={styles.logo} />
        </View>

        <Ionicons name="search" size={30} color={colors.text} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange?.(tab)}
              style={styles.tabItem}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? ACCENT : '#9E9E9E' },
                ]}
              >
                {tab}
              </Text>

              {active && <View style={styles.activeLine} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  logo: {
    width: 90,
    height: 40,
    resizeMode: 'contain',
  },

  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },

  tabItem: {
    marginRight: 22,
    alignItems: 'center',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },

  activeLine: {
    marginTop: 6,
    width: 100,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
});
