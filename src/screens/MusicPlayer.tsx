import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';

import { useTheme } from '../theme/ThemeContext';
import { getSongById } from '../api/songs';

export default function MusicPlayer({ route, navigation }: any) {
  const { colors } = useTheme();
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const { songId } = route.params;

  const [song, setSong] = useState<any>(null);

  /* ================= LOAD SONG ================= */

  useEffect(() => {
    loadSong();
  }, []);

  const loadSong = async () => {
    try {
      const fullSong = await getSongById(songId);
      if (!fullSong?.url) return;

      setSong(fullSong);

      const currentId = await TrackPlayer.getCurrentTrack();

      // 🔥 Prevent resetting if same song already loaded
      if (currentId !== fullSong.id) {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: fullSong.id,
          url: fullSong.url,
          title: fullSong.title,
          artist: fullSong.artist,
          artwork: fullSong.artwork,
        });
        await TrackPlayer.play();
      }
    } catch (e) {
      console.error('MusicPlayer load error', e);
    }
  };

  /* ================= HELPERS ================= */

  const isPlaying = playbackState === State.Playing;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* ================= UI ================= */

  if (!song) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Ionicons
          name="ellipsis-horizontal"
          size={22}
          color={colors.text}
        />
      </View>

      {/* ARTWORK */}
      <Image source={{ uri: song.artwork }} style={styles.artwork} />

      {/* TITLE */}
      <Text style={[styles.title, { color: colors.text }]}>
        {song.title}
      </Text>
      <Text style={styles.artist}>{song.artist}</Text>

      {/* SLIDER */}
      <View style={styles.sliderWrap}>
        <Slider
          style={{ width: '100%' }}
          minimumValue={0}
          maximumValue={progress.duration || 1}
          value={progress.position}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor={colors.primary}
          onSlidingComplete={value => TrackPlayer.seekTo(value)}
        />

        <View style={styles.timeRow}>
          <Text style={styles.time}>
            {formatTime(progress.position)}
          </Text>
          <Text style={styles.time}>
            {formatTime(progress.duration)}
          </Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <Ionicons
          name="play-skip-back"
          size={26}
          color={colors.text}
          onPress={() => TrackPlayer.skipToPrevious()}
        />

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            isPlaying ? TrackPlayer.pause() : TrackPlayer.play()
          }
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <Ionicons
          name="play-skip-forward"
          size={26}
          color={colors.text}
          onPress={() => TrackPlayer.skipToNext()}
        />
      </View>

      {/* BOTTOM ICONS */}
      <View style={styles.bottomRow}>
        <Ionicons name="repeat" size={22} color={colors.text} />
        <Ionicons name="timer-outline" size={22} color={colors.text} />
        <Ionicons name="share-social-outline" size={22} color={colors.text} />
        <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },

  artwork: {
    width: 260,
    height: 260,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
  },

  artist: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },

  sliderWrap: {
    marginTop: 26,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  time: {
    fontSize: 12,
    color: '#6B7280',
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 30,
  },

  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 20,
  },
});
