import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, {
  State,
  Event,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { searchSongs } from '../api/search';
import { getSongById } from '../api/songs';
import { useTheme } from '../theme/ThemeContext';
import { setupPlayer } from '../services/trackPlayer';
import { SongOptionsBottomSheet } from '../components/SongOptionsBottomSheet';


type Song = {
  id: string;
  name: string;
  image: any[];
  primaryArtists?: string;
  duration: number;
  label?: string;
  album?: { name?: string };
  year?: string;
};

type SortOption =
  | 'ASC'
  | 'DESC'
  | 'ARTIST'
  | 'ALBUM'
  | 'YEAR'
  | 'DATE_ADDED'
  | 'DATE_MODIFIED'
  | 'COMPOSER'
  | null;

/* ================= SONG ITEM ================= */

const SongItem = React.memo(
  ({
    item,
    isActive,
    isPlaying,
    colors,
    onPress,
    onOptionsPress,
  }: any) => {
    const getImage = () =>
      item?.image?.[2]?.url || item?.image?.[1]?.url || '';

    const formatDuration = (sec?: number) => {
      if (!sec) return '0:00';
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
      <TouchableOpacity style={styles.row} onPress={() => onPress(item)}>
        <Image source={{ uri: getImage() }} style={styles.art} />

        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              { color: isActive ? colors.primary : colors.text },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: isActive ? colors.primary : '#9CA3AF' },
            ]}
            numberOfLines={1}
          >
            {item?.label || 'Unknown'} | {formatDuration(item.duration)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.playButton,
            {
              backgroundColor: isActive ? colors.primary : 'transparent',
              borderWidth: isActive ? 0 : 1,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => onPress(item)}
        >
          <Ionicons
            name={isActive && isPlaying ? 'pause' : 'play'}
            size={16}
            color={isActive ? '#fff' : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => onOptionsPress(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
);

/* ================= MAIN SCREEN ================= */

export default function SongsScreen() {
  const { colors } = useTheme();

  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const [sortOption, setSortOption] = useState<SortOption>(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [totalSongs, settotalSongs] = useState(0);


  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const playbackState = usePlaybackState();
  const isPlaying =
    playbackState === State.Playing ||
    playbackState === State.Buffering;

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setupPlayer().then(() => setPlayerReady(true));
  }, []);

  /* ================= LOAD SONGS ================= */

  const loadSongs = async (pageNo = 1) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      // searchSongs RETURNS ARRAY DIRECTLY
      const results = await searchSongs('song', pageNo);

       if (pageNo === 1 && results?.total) {
      settotalSongs(results.total);
    }


      if (!Array.isArray(results) || results.length === 0) {
        setHasMore(false);
        return;
      }

      setSongs(prev =>
        pageNo === 1 ? results : [...prev, ...results]
      );
      

      setPage(pageNo);
    } catch (e) {
      console.error('❌ loadSongs error', e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSongs(1);
  }, []);

  /* ================= TRACK EVENTS ================= */

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.nextTrack != null) {
      setCurrentTrackId(event.nextTrack as string);
    }
  });

  /* ================= PLAY / PAUSE ================= */

  const handlePlayPress = async (song: Song) => {
    if (!playerReady) return;

    const currentTrack = await TrackPlayer.getCurrentTrack();
    const state = await TrackPlayer.getState();

    if (currentTrack === song.id) {
      state === State.Playing
        ? await TrackPlayer.pause()
        : await TrackPlayer.play();
      return;
    }

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
    setCurrentTrackId(fullSong.id);
  };

  /* ================= SORTING ================= */

  const sortedSongs = useMemo(() => {
    // 👇 DO NOT SORT INITIALLY
    if (!sortOption) return songs;

    const list = [...songs];

    switch (sortOption) {
      case 'ASC':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'DESC':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case 'ARTIST':
        return list.sort((a, b) =>
          (a.primaryArtists || '').localeCompare(b.primaryArtists || '')
        );
      case 'ALBUM':
        return list.sort((a, b) =>
          (a.album?.name || '').localeCompare(b.album?.name || '')
        );
      case 'YEAR':
        return list.sort(
          (a, b) => Number(b.year || 0) - Number(a.year || 0)
        );
      default:
        return list;
    }
  }, [songs, sortOption]);

  /* ================= RENDER ================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.countText, { color: colors.text }]}>
          {totalSongs} songs
        </Text>

        {/* 👇 UI SHOWS DESCENDING ALWAYS INITIALLY */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortVisible(true)}
        >
          <Text style={{ color: colors.primary }}>
            {sortOption ?? 'DESCENDING'}
          </Text>
          <Ionicons name="swap-vertical" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={sortedSongs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongItem
            item={item}
            isActive={currentTrackId === item.id}
            isPlaying={isPlaying}
            colors={colors}
            onPress={handlePlayPress}
            onOptionsPress={song => {
              setSelectedSong(song);
              setSheetVisible(true);
            }}
          />
        )}
        onEndReached={() => loadSongs(page + 1)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      />

      {sortVisible && (
        <Pressable
          style={styles.sortOverlay}
          onPress={() => setSortVisible(false)}
        >
          <View style={[styles.sortMenu, { backgroundColor: colors.card }]}>
            {[
              { label: 'Ascending', value: 'ASC' },
              { label: 'Descending', value: 'DESC' },
              { label: 'Artist', value: 'ARTIST' },
              { label: 'Album', value: 'ALBUM' },
              { label: 'Year', value: 'YEAR' },
            ].map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.sortItem}
                onPress={() => {
                  setSortOption(item.value as SortOption);
                  setSortVisible(false);
                }}
              >
                <Text style={[styles.sortText, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Ionicons
                  name={
                    sortOption === item.value
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      )}

      <SongOptionsBottomSheet
        visible={sheetVisible}
        song={selectedSong}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  countText: { fontSize: 16, fontWeight: '600' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  art: { width: 54, height: 54, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionsButton: { padding: 8, marginLeft: 4 },
  sortOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'flex-end',
  },
  sortMenu: {
    width: 220,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 60,
    marginRight: 16,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sortText: { fontSize: 14 },
});
