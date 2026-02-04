import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { getSongSuggestions } from '../utils/api'; // Import from utils
import TrackPlayer from 'react-native-track-player';

type Song = {
  id: string;
  name: string;
  image: any[];
  primaryArtists: string;
  duration?: number;
  isFavorite?: boolean;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const CLOSE_THRESHOLD = 100; // Drag distance to close
const MAX_DRAG_HEIGHT = 100; // Maximum drag up distance

const STORAGE_KEY = 'SONG_ACTION_HISTORY';
const FAVORITES_KEY = 'FAVORITE_SONGS';

const OPTIONS = [
  { icon: 'play-forward', label: 'Play Next', action: 'playNext' },
  { icon: 'add', label: 'Add to Playing Queue', action: 'addToQueue' },
  { icon: 'list', label: 'Add to Playlist', action: 'addToPlaylist' },
  { icon: 'albums', label: 'Go to Album', action: 'goToAlbum' },
  { icon: 'person', label: 'Go to Artist', action: 'goToArtist' },
  { icon: 'information-circle', label: 'Details', action: 'details' },
  { icon: 'notifications', label: 'Set as Ringtone', action: 'setRingtone' },
  { icon: 'ban', label: 'Add to Blacklist', action: 'addToBlacklist' },
  { icon: 'share-social', label: 'Share', action: 'share' },
  { icon: 'trash', label: 'Delete from Device', action: 'delete' },
];

export const SongOptionsBottomSheet = ({
  visible,
  song,
  onClose,
}: {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  // Animation refs
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Pan responder ref for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      // Allow drag when touch starts
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      
      onPanResponderMove: (_, gestureState) => {
        // Prevent dragging above initial position
        const newY = Math.max(0, gestureState.dy);
        translateY.setValue(newY);
      },
      
      onPanResponderRelease: (_, gestureState) => {
        // If dragged down enough, close the sheet
        if (gestureState.dy > CLOSE_THRESHOLD || gestureState.vy > 0.5) {
          onClose();
        } else {
          // Otherwise, snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 150,
            mass: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  /* ------------------ LOAD FAVORITE STATUS ------------------ */
  useEffect(() => {
    if (song?.id) {
      checkFavoriteStatus();
    }
  }, [song]);

  const checkFavoriteStatus = async () => {
    try {
      const favoritesJSON = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = favoritesJSON ? JSON.parse(favoritesJSON) : [];
      setIsFavorite(favorites.includes(song?.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  /* ------------------ TOGGLE FAVORITE ------------------ */
  const toggleFavorite = async () => {
    if (!song?.id) return;

    try {
      const favoritesJSON = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = favoritesJSON ? JSON.parse(favoritesJSON) : [];

      if (favorites.includes(song.id)) {
        // Remove from favorites
        favorites = favorites.filter((id: string) => id !== song.id);
        setIsFavorite(false);
      } else {
        // Add to favorites
        favorites.push(song.id);
        setIsFavorite(true);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  /* ------------------ ANIMATION ------------------ */
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: SHEET_HEIGHT,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  /* ------------------ ACTION HANDLERS ------------------ */
  const handleOptionPress = useCallback(async (action: string) => {
    if (!song) return;

    try {
      // Save action to storage
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : [];
      const newEntry = {
        songId: song.id,
        songName: song.name,
        action,
        time: Date.now(),
      };
      const updated = [newEntry, ...parsed].slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Handle specific actions
      switch (action) {
        case 'playNext':
          await handlePlayNext();
          break;
        case 'addToQueue':
          await handleAddToQueue();
          break;
        case 'addToPlaylist':
          // Implement add to playlist logic
          console.log('Add to playlist:', song.name);
          break;
        case 'goToAlbum':
          // Implement go to album logic
          console.log('Go to album:', song.name);
          break;
        case 'goToArtist':
          // Implement go to artist logic
          console.log('Go to artist:', song.primaryArtists);
          break;
        case 'details':
          // Implement show details logic
          console.log('Show details:', song.name);
          break;
        case 'setRingtone':
          // Implement set as ringtone logic
          console.log('Set as ringtone:', song.name);
          break;
        case 'addToBlacklist':
          // Implement add to blacklist logic
          console.log('Add to blacklist:', song.name);
          break;
        case 'share':
          // Implement share logic
          console.log('Share:', song.name);
          break;
        case 'delete':
          // Implement delete logic
          console.log('Delete:', song.name);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (e) {
      console.error('Action error:', e);
    } finally {
      onClose();
    }
  }, [song, onClose]);

  /* ------------------ PLAY NEXT HANDLER ------------------ */
  const handlePlayNext = async () => {
    if (!song?.id) return;

    try {
      // Get song suggestions for the current song
      const suggestions = await getSongSuggestions(song.id);
      
      if (suggestions.length > 0) {
        // Get the first suggested song
        const nextSong = suggestions[0];
        
        // Get full song details (you might need to adjust this based on your API)
        // For now, we'll assume the suggestion has the necessary data
        if (nextSong.url) {
          // Add to track player
          await TrackPlayer.add({
            id: nextSong.id,
            url: nextSong.url,
            title: nextSong.title || nextSong.name || 'Unknown Song',
            artist: nextSong.artist || nextSong.primaryArtists || 'Unknown Artist',
            artwork: nextSong.artwork || nextSong.image?.[2]?.url || nextSong.image?.[1]?.url,
          });
          
          // Play the song
          await TrackPlayer.play();
        }
      } else {
        console.log('No suggestions available for this song');
      }
    } catch (error) {
      console.error('Error playing next song:', error);
    }
  };

  /* ------------------ ADD TO QUEUE HANDLER ------------------ */
  const handleAddToQueue = async () => {
    if (!song?.id) return;

    try {
      // In a real app, you would add the song to your queue system
      // For now, we'll just add it to TrackPlayer's queue
      await TrackPlayer.add({
        id: song.id,
        url: '', // You'll need to get the actual URL from your API
        title: song.name,
        artist: song.primaryArtists,
        artwork: song.image?.[2]?.url || song.image?.[1]?.url,
      });
      console.log('Added to queue:', song.name);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return ` • ${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!song) return null;

  return (
    <>
      {/* Overlay with fade animation */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity,
            display: visible ? 'flex' : 'none',
          },
        ]}
      >
        <Pressable style={styles.overlayPressable} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet with drag gesture */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            transform: [{ translateY }],
            width: SCREEN_WIDTH,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag Handle - now draggable */}
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View
            style={[
              styles.dragHandle,
              { backgroundColor: colors.textSecondary },
            ]}
          />
        </View>

        {/* Header with Favorite Icon */}
        <View style={styles.header}>
          <Image
            source={{
              uri:
                song.image?.[2]?.url ||
                song.image?.[1]?.url ||
                'https://via.placeholder.com/48',
            }}
            style={styles.art}
          />

          <View style={styles.headerInfo}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {song.name}
            </Text>
            <Text
              style={[styles.sub, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {song.primaryArtists}
              {formatDuration(song.duration)}
            </Text>
          </View>

          {/* Favorite Icon */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF3B30' : colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {/* Options */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((item, index) => (
            <React.Fragment key={item.action}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleOptionPress(item.action)}
                activeOpacity={0.6}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={colors.text} 
                />
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>

              {index < OPTIONS.length - 1 && (
                <View
                  style={[
                    styles.optionSeparator,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Safe Area */}
        <View style={{ height: Platform.OS === 'ios' ? 34 : 24 }} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 1000,
    elevation: 1000,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
    paddingHorizontal: 20,

  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sub: {
    fontSize: 14,
    opacity: 0.8,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 8,
    opacity: 0.3,
  },
  optionsContainer: {
    paddingHorizontal: 20,

  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '400',
  },
  optionSeparator: {
    height: 1,
    marginLeft: 56,
    opacity: 0.3,
  },
});