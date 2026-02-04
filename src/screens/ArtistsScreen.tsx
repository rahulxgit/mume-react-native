import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import { searchArtists } from '../api/artists';
import ActionSheet from '../components/Actionheet';


type Artist = {
  id: string;
  name: string;
  image?: { url: string }[];
  albumCount?: number;
  songCount?: number;
};

export default function ArtistsScreen() {
  const { colors } = useTheme();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
const navigation = useNavigation();


const [artists, setArtists] = useState<Artist[]>([]);
const [totalArtists, setTotalArtists] = useState(0);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /* ================= LOAD ARTISTS ================= */

const loadArtists = async (pageNo = 0) => {
  if (loadingMore || !hasMore) return;

  setLoadingMore(true);
  try {
    const { results, total } = await searchArtists('new', pageNo);

    if (pageNo === 0) {
      setTotalArtists(total); // ✅ SAVE TOTAL ONLY ON FIRST PAGE
    }

    if (!results || results.length === 0) {
      setHasMore(false);
    } else {
      setArtists(prev => {
  const map = new Map<string, Artist>();

  // keep existing artists
  prev.forEach(a => map.set(a.id, a));

  // add new ones (overwrites duplicates safely)
  results.forEach(a => map.set(a.id, a));

  return Array.from(map.values());
});

      setPage(pageNo);
    }
  } catch (e) {
    console.error('Load artists error', e);
  } finally {
    setLoadingMore(false);
  }
};


  useEffect(() => {
    loadArtists(0);
  }, []);

  /* ================= HELPERS ================= */

  const getImage = (item: Artist) =>
    item?.image?.[2]?.url ||
    item?.image?.[1]?.url ||
    item?.image?.[0]?.url ||
    '';

  /* ================= RENDER ITEM ================= */

  const renderArtist = useCallback(
    ({ item }: { item: Artist }) => (
      <View style={styles.row}>
        <Image source={{ uri: getImage(item) }} style={styles.art} />

        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.meta}>
            {item.albumCount || 1} Album • {item.songCount || 10} Songs
          </Text>
        </View>

      <TouchableOpacity onPress={() => setSelectedArtist(item)}>
  <Ionicons
    name="ellipsis-vertical"
    size={18}
    color={colors.text + '80'}
  />
</TouchableOpacity>

      </View>
    ),
    [colors]
  );

  /* ================= FOOTER ================= */

  const renderFooter = () =>
    loadingMore ? (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    ) : null;

  /* ================= UI ================= */

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.topRow}>
      <Text style={[styles.count, { color: colors.text }]}>
  {totalArtists} artists
</Text>

        <View style={styles.sort}>
          <Text style={[styles.sortText, { color: colors.primary }]}>
            Date Added
          </Text>
          <Ionicons
            name="swap-vertical"
            size={14}
            color={colors.primary}
          />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={artists}
        keyExtractor={item => item.id}
        renderItem={renderArtist}
        onEndReached={() => loadArtists(page + 1)}
        onEndReachedThreshold={0.6}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      />
<ActionSheet
  visible={!!selectedArtist}
  onClose={() => setSelectedArtist(null)}
  title={selectedArtist?.name || ''}
  subtitle={`${selectedArtist?.albumCount || 1} Album • ${
    selectedArtist?.songCount || 10
  } Songs`}
  image={selectedArtist ? getImage(selectedArtist) : undefined}

  onPlay={() => {
    if (!selectedArtist) return;

    setSelectedArtist(null);

    // ✅ REDIRECT TO PLAYER SCREEN
    navigation.navigate('Player', {
      id: selectedArtist.id,
    });
  }}

  onPlayNext={() => {
    // later: queue logic
  }}

  onAddToQueue={() => {
    // later: add artist songs to queue
  }}

  onAddToPlaylist={() => {
    // later: save artist to AsyncStorage
  }}

  onShare={() => {
    // later: Share API
  }}
/>




      
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },

  count: {
    fontSize: 14,
    fontWeight: '600',
  },

  sort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sortText: {
    fontSize: 13,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  art: {
    width: 52,
    height: 52,
    borderRadius: 26, // 🔥 CIRCLE like screenshot
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
  },

  meta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
