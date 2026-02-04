// src/screens/FavoritesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { usePlaybackState, State, Event, useTrackPlayerEvents } from 'react-native-track-player';
import { useTheme } from '../theme/ThemeContext';
import { getSongById } from '../api/songs';

const FAVORITES_KEY = 'FAVORITE_SONGS';

type FavoriteSong = {
  id: string;
  name: string;
  image: any[];
  primaryArtists: string;
  duration?: number;
  url?: string;
  title?: string;
  artist?: string;
  artwork?: string;
};

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  
  // Use TrackPlayer's hook for playback state
  const playbackState = usePlaybackState();
  const isPlaying = playbackState === State.Playing || playbackState === State.Buffering;

  /* ------------------ LOAD FAVORITES ------------------ */
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const favoritesJSON = await AsyncStorage.getItem(FAVORITES_KEY);
      const favoriteIds = favoritesJSON ? JSON.parse(favoritesJSON) : [];

      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      // Fetch full song details for each favorite ID
      const songsPromises = favoriteIds.map((id: string) => getSongById(id));
      const songsData = await Promise.all(songsPromises);

      const validSongs = songsData
        .filter(song => song && song.id)
        .map(song => ({
          id: song.id,
          name: song.title || song.name || 'Unknown Song',
          image: song.image || [],
          primaryArtists: song.artist || song.primaryArtists || 'Unknown Artist',
          duration: song.duration,
          url: song.url,
          title: song.title || song.name,
          artist: song.artist || song.primaryArtists,
          artwork: song.artwork || song.image?.[2]?.url || song.image?.[1]?.url || '',
        }));

      setFavorites(validSongs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  /* ------------------ RELOAD ON TAB FOCUS ------------------ */
useFocusEffect(
  useCallback(() => {
    loadFavorites();
    updateCurrentTrack();

    return () => {
      // optional cleanup
    };
  }, [loadFavorites])
);

  /* ------------------ TRACK PLAYER EVENTS ------------------ */
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.nextTrack != null) {
      setCurrentTrackId(event.nextTrack as string);
    }
  });

  /* ------------------ APP STATE LISTENER ------------------ */
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // When app comes to foreground, reload favorites
        loadFavorites();
        // Also update current track
        updateCurrentTrack();
      }
    });

    return () => {
      appStateListener.remove();
    };
  }, [loadFavorites]);

  /* ------------------ INITIAL LOAD AND TRACK UPDATE ------------------ */
  useEffect(() => {
    loadFavorites();
    updateCurrentTrack();
  }, [loadFavorites]);

  const updateCurrentTrack = async () => {
    try {
      const trackId = await TrackPlayer.getCurrentTrack();
      setCurrentTrackId(trackId);
    } catch (error) {
      console.error('Error getting current track:', error);
    }
  };

  /* ------------------ REFRESH ------------------ */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
  }, [loadFavorites]);

  /* ------------------ PLAY/PAUSE SONG ------------------ */
  const togglePlayPause = async (song: FavoriteSong) => {
    try {
      const currentTrack = await TrackPlayer.getCurrentTrack();
      const state = await TrackPlayer.getState();

      if (currentTrack === song.id) {
        if (state === State.Playing) {
          await TrackPlayer.pause();
        } else {
          await TrackPlayer.play();
        }
        return;
      }

      const fullSong = await getSongById(song.id);
      if (!fullSong?.url) {
        console.error('No URL for song:', song.id);
        return;
      }

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: fullSong.id,
        url: fullSong.url,
        title: fullSong.title || song.name,
        artist: fullSong.artist || song.primaryArtists,
        artwork: fullSong.artwork || song.image?.[2]?.url || song.image?.[1]?.url,
      });

      await TrackPlayer.play();
      setCurrentTrackId(fullSong.id);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const removeFromFavorites = async (songId: string) => {
    try {
      const favoritesJSON = await AsyncStorage.getItem(FAVORITES_KEY);
      const favoriteIds = favoritesJSON ? JSON.parse(favoritesJSON) : [];
      
      const updatedFavorites = favoriteIds.filter((id: string) => id !== songId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      
      // Update local state
      setFavorites(prev => prev.filter(song => song.id !== songId));
      
      // If the removed song was playing, stop it
      if (currentTrackId === songId) {
        await TrackPlayer.pause();
        setCurrentTrackId(null);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  /* ------------------ RENDER SONG ITEM ------------------ */
  const renderSongItem = ({ item }: { item: FavoriteSong }) => {
    const getImage = () => {
      if (item.artwork) return item.artwork;
      if (item.image?.[2]?.url) return item.image[2].url;
      if (item.image?.[1]?.url) return item.image[1].url;
      if (item.image?.[0]?.url) return item.image[0].url;
      return '';
    };

    const imageUrl = getImage();
    const isCurrentlyPlaying = currentTrackId === item.id;
    const isCurrentlyPlayingAndPlaying = isCurrentlyPlaying && isPlaying;

    const formatDuration = (sec?: number) => {
      if (!sec) return '';
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return ` • ${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
      <View style={[styles.songItem, { borderBottomColor: colors.border + '30' }]}>
        {/* Image with play overlay */}
        <TouchableOpacity 
          onPress={() => togglePlayPause(item)} 
          style={styles.imageContainer}
          activeOpacity={0.7}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.artwork}
            />
          ) : (
            <View style={[styles.artworkPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="musical-notes" size={24} color={colors.primary} />
            </View>
          )}
          
          {/* Play/Pause overlay */}
          <View style={[
            styles.playOverlay, 
            isCurrentlyPlaying ? styles.playingOverlay : styles.defaultOverlay
          ]}>
            <Ionicons
              name={isCurrentlyPlayingAndPlaying ? 'pause' : 'play'}
              size={isCurrentlyPlaying ? 24 : 20}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
        
        {/* Song Info */}
        <TouchableOpacity 
          style={styles.songInfo} 
          onPress={() => togglePlayPause(item)}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.songTitle, 
              { 
                color: isCurrentlyPlaying ? colors.primary : colors.text,
                fontWeight: isCurrentlyPlaying ? '700' : '600'
              }
            ]} 
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.primaryArtists}
            {formatDuration(item.duration)}
          </Text>
        </TouchableOpacity>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => removeFromFavorites(item.id)}
        >
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  /* ------------------ RENDER ------------------ */
  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading favorites...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Favorites
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {/* Songs List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.text + '40'} />
            <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
              No favorite songs yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the heart icon on any song to add it here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  artwork: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  defaultOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  songInfo: {
    flex: 1,
    paddingRight: 8,
  },
  songTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});