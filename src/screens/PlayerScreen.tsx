import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
  State,
  usePlaybackState,
} from 'react-native-track-player';
import { useTheme } from '../theme/ThemeContext';

import { getArtistById } from '../api/artists';
import { getSongById } from '../api/songs';

type Song = {
  id: string;
  name: string;
  image?: any[];
  primaryArtists?: string;
  duration?: number;
};

export default function PlayerScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const playbackState = usePlaybackState();

  const { id } = route.params;

  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  /* ================= LOAD ARTIST ================= */

  useEffect(() => {
    loadArtist();
  }, []);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const data = await getArtistById(id);
      setArtist(data);
      setSongs(data.songs || []);
    } catch (e) {
      console.error('Artist load error', e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PLAY / PAUSE SONG ================= */

  const playSong = async (song: Song) => {
    try {
      const activeId = await TrackPlayer.getCurrentTrack();

      // SAME SONG → TOGGLE PLAY / PAUSE
      if (activeId === song.id) {
        playbackState === State.Playing
          ? await TrackPlayer.pause()
          : await TrackPlayer.play();
        return;
      }

      // NEW SONG
      const fullSong = await getSongById(song.id);
      if (!fullSong?.url) return;

      await TrackPlayer.reset();

      await TrackPlayer.add({
        id: fullSong.id,
        url: fullSong.url,
        title: fullSong.title,
        artist: fullSong.artist,
        artwork: fullSong.artwork,
      });

      await TrackPlayer.play();
      setCurrentSongId(song.id);

      // 👉 OPEN FULL MUSIC PLAYER
      navigation.navigate('MusicPlayer', {
        songId: song.id,
      });
    } catch (e) {
      console.error('Play song error', e);
    }
  };

  /* ================= SHUFFLE ================= */

  const shuffleSongs = async () => {
    if (!songs.length) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    await playSong(shuffled[0]);
  };

  /* ================= HELPERS ================= */

  const getImage = (imgArr?: any[]) =>
    imgArr?.[2]?.url || imgArr?.[1]?.url || '';

  /* ================= SONG ITEM ================= */

  const renderSong = ({ item }: { item: Song }) => {
    const isPlaying =
      currentSongId === item.id &&
      playbackState === State.Playing;

    return (
      <View style={styles.songRow}>
        <Image
          source={{ uri: getImage(item.image) }}
          style={styles.songArt}
        />

        <View style={styles.songInfo}>
          <Text
            numberOfLines={1}
            style={[styles.songTitle, { color: colors.text }]}
          >
            {item.name}
          </Text>
          <Text style={styles.songArtist}>{artist?.name}</Text>
        </View>

        <TouchableOpacity onPress={() => playSong(item)}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={30}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* ARTIST IMAGE */}
      <Image source={{ uri: artist.image }} style={styles.cover} />

      {/* ARTIST INFO */}
      <Text style={[styles.artistName, { color: colors.text }]}>
        {artist.name}
      </Text>

      <Text style={styles.meta}>
        {artist.albums?.length || 1} Album • {songs.length} Songs
      </Text>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={shuffleSongs}
        >
          <Ionicons name="shuffle" size={18} color="#fff" />
          <Text style={styles.btnText}>Shuffle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnSecondary, { backgroundColor: colors.card }]}
          onPress={() => songs[0] && playSong(songs[0])}
        >
          <Ionicons name="play" size={18} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>
            Play
          </Text>
        </TouchableOpacity>
      </View>

      {/* SONGS */}
      <Text style={[styles.songHeaderText, { color: colors.text }]}>
        Songs
      </Text>

      <FlatList
        data={songs}
        keyExtractor={item => item.id}
        renderItem={renderSong}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { paddingVertical: 12 },

  cover: {
    width: 220,
    height: 220,
    borderRadius: 18,
    alignSelf: 'center',
    marginTop: 10,
  },

  artistName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  meta: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 12,
  },

  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  btnText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#fff',
  },

  songHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  songArt: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },

  songInfo: {
    flex: 1,
    marginLeft: 12,
  },

  songTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  songArtist: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
