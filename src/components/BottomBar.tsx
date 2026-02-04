import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';

const ACCENT = '#FF7A00'; 

export default function BottomBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          const iconMap: Record<string, string> = {
            Home: isFocused ? 'home' : 'home-outline',
            Favorites: isFocused ? 'heart' : 'heart-outline',
            Playlists: isFocused ? 'list' : 'list-outline',
            Settings: isFocused ? 'settings' : 'settings-outline',
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.item}
            >
              <Ionicons
                name={iconMap[route.name]}
                size={22}
                color={isFocused ? ACCENT : colors.text + '80'}
              />

              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? ACCENT : colors.text + '80',
                  },
                ]}
              >
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor:"transparent",
    zIndex:0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 18,
    zIndex:0,

  },
  item: {
    alignItems: 'center',
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
