// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();

  const Option = ({ label, value }: { label: string; value: any }) => {
    const active = theme === value;

    return (
      <TouchableOpacity
        onPress={() => setTheme(value)}
        style={[
          styles.option,
          {
            backgroundColor: active ? colors.card : 'transparent',
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: active ? '700' : '500',
          }}
        >
          {label}
        </Text>

        {active && (
          <Text style={{ color: '#FF7A00', fontWeight: '700' }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.section, { color: colors.text }]}>
          Appearance
        </Text>

        <Option label="System Default" value="system" />
        <Option label="Light Mode" value="light" />
        <Option label="Dark Mode" value="dark" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
});
