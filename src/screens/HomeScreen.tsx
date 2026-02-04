import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { searchSongs } from '../api/saavn';
import { useTheme } from '../theme/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState('Suggested');
  const [recentSongs, setRecentSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [recent, trending] = await Promise.all([
      searchSongs('latest', 1),
      searchSongs('trending', 1),
    ]);

    setRecentSongs(recent || []);
    setArtists(trending || []);
    setMostPlayed(trending || []);
  };

  const getImage = (item) =>
    item?.image?.[2]?.url ||
    item?.image?.[1]?.url ||
    item?.image?.[0]?.url ||
    '';

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.seeAll, { color: colors.primary }]}>
        See All
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ================= RECENTLY PLAYED ================= */}
        <SectionHeader title="Recently Played" />
        <FlatList
          horizontal
          data={recentSongs.slice(0, 5)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.songCard}>
              <Image source={{ uri: getImage(item) }} style={styles.songImage} />
              <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[styles.songArtist, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.primaryArtists}
              </Text>
            </View>
          )}
        />

        {/* ================= ARTISTS ================= */}
        <SectionHeader title="Artists" />
        <FlatList
          horizontal
          data={artists.slice(0, 6)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.artistCard}>
              <Image source={{ uri: getImage(item) }} style={styles.artistImage} />
              <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          )}
        />

        {/* ================= MOST PLAYED ================= */}
        <SectionHeader title="Most Played" />
        <FlatList
          horizontal
          data={mostPlayed.slice(0, 5)}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <View style={styles.songCard}>
              <Image source={{ uri: getImage(item) }} style={styles.songImage} />
              <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[styles.songArtist, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.primaryArtists}
              </Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES (MATCH IMAGE) ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  horizontalList: {
    paddingLeft: 16,
    paddingBottom: 20,
  },

  /* SONG CARD — EXACT MATCH */
  songCard: {
    width: 150,
    marginRight: 14,
  },
  songImage: {
    width: 150,
    height: 150,
    borderRadius: 18,
    marginBottom: 8,
  },
  songTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 11,
  },

  /* ARTIST CARD */
  artistCard: {
    width: 90,
    alignItems: 'center',
    marginRight: 16,
  },
  artistImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 6,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
