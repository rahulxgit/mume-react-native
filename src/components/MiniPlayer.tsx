import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import TrackPlayer, {
  State,
  Event,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../theme/ThemeContext';
import { getSongSuggestions } from '../api/suggestions';
import { getSongById } from '../api/songs';
import Toast from 'react-native-toast-message';

export default function MiniPlayer() {
  const playbackState = usePlaybackState();
  const { colors } = useTheme();

  const [track, setTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /* 🔥 LOAD CURRENT TRACK */
  const syncTrack = async () => {
    try {
      const id = await TrackPlayer.getCurrentTrack();
      if (id != null) {
        const t = await TrackPlayer.getTrack(id);
        setTrack(t);
        
        // Update playback state
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing || state === State.Buffering);
      } else {
        setTrack(null);
      }
    } catch (error) {
      console.error('Error syncing track:', error);
    }
  };

  useEffect(() => {
    syncTrack();
    
    // Listen to playback state changes
    const updatePlaybackState = async () => {
      const state = await TrackPlayer.getState();
      setIsPlaying(state === State.Playing || state === State.Buffering);
    };
    
    // Initial state
    updatePlaybackState();
    
    // Subscribe to state changes
    const subscription = TrackPlayer.addEventListener(
      Event.PlaybackState,
      async (event) => {
        if (event.state === State.Playing || event.state === State.Paused) {
          setIsPlaying(event.state === State.Playing);
        }
      }
    );
    
    return () => {
      subscription.remove();
    };
  }, []);

  /* 🔥 TRACK EVENTS */
  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackQueueEnded],
    async (event) => {
      if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
        await syncTrack();
      } else if (event.type === Event.PlaybackQueueEnded) {
        // Handle queue end
        await syncTrack();
      }
    }
  );

  if (!track) return null;

  /* ================= PLAY / PAUSE ================= */
  const togglePlay = async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing || state === State.Buffering) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Toast.show({
        type: 'error',
        text1: 'Playback error',
      });
    }
  };

  /* ================= NEXT (WITH SUGGESTIONS) ================= */
  const playNext = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const index = await TrackPlayer.getCurrentTrackIndex();

      // ✅ If already has next
      if (index !== null && index < queue.length - 1) {
        await TrackPlayer.skipToNext();
        return;
      }

      // ❗ Fetch suggestions
      const suggestions = await getSongSuggestions(track.id);
      if (!suggestions.length) {
        Toast.show({
          type: 'error',
          text1: 'No next song available',
        });
        return;
      }

      const nextSong = await getSongById(suggestions[0].id);

      await TrackPlayer.add({
        id: nextSong.id,
        url: nextSong.url,
        title: nextSong.title,
        artist: nextSong.artist,
        artwork: nextSong.artwork,
      });

      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Next song error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to play next song',
      });
    }
  };

  /* ================= UI ================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Image source={{ uri: track.artwork }} style={styles.art} />

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.text }]}
        >
          {track.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.artist, { color: colors.textSecondary }]}
        >
          {track.artist}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlay} style={styles.iconButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.iconButton}>
          <Ionicons
            name="play-skip-forward"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 58, 
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 0,
    zIndex: 1, 
  },

  art: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },

  info: {
    flex: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },

  artist: {
    fontSize: 14,
    color: '#666',
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
});