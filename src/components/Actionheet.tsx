import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Image,
  Share,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';

const { height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  onPlay?: () => void;
  onPlayNext?: () => void;
};

export default function ActionSheet({
  visible,
  onClose,
  id,
  title,
  subtitle,
  image,
  onPlay,
  onPlayNext,
}: Props) {
  const { colors } = useTheme();
  const translateY = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  /* ================= ACTIONS ================= */

  const addToFavorites = async () => {
    try {
      const raw = await AsyncStorage.getItem('favoriteArtists');
      const list = raw ? JSON.parse(raw) : [];

      const exists = list.find((i: any) => i.id === id);
      if (!exists) {
        list.push({ id, title, image, subtitle });
        await AsyncStorage.setItem(
          'favoriteArtists',
          JSON.stringify(list)
        );
      }

      onClose();
    } catch (e) {
      console.error('Save favorite error', e);
    }
  };

  const shareArtist = async () => {
    try {
      await Share.share({
        message: `Check out ${title} on Mume 🎶`,
      });
    } catch (e) {
      console.error('Share error', e);
    }
  };

  const Item = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY }],
          },
        ]}
      >
        {/* HANDLE */}
        <View style={styles.handle} />

        {/* HEADER (IMAGE + TEXT) */}
        <View style={styles.header}>
          {image && (
            <Image source={{ uri: image }} style={styles.avatar} />
          )}
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.text + '80' },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* ACTIONS */}
        <Item icon="play" label="Play" onPress={onPlay} />
        <Item
          icon="play-skip-forward"
          label="Play Next"
          onPress={onPlayNext}
        />
        <Item
          icon="add-circle-outline"
          label="Add to Playlist"
          onPress={addToFavorites}
        />
        <Item
          icon="share-social-outline"
          label="Share"
          onPress={shareArtist}
        />
      </Animated.View>
    </Pressable>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 96,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    alignSelf: 'center',
    marginVertical: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  label: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
  },
});
