// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { searchSongs } from '../api/search';
import { getSongById } from '../api/songs';


export default function SearchScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const data = await searchSongs(text);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  const renderSongItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => {
        // Handle song selection
        navigation.navigate('Player', { song: item });
      }}
    >
      <Image
        source={{ uri: item.image?.[1]?.link }}
        style={styles.songImage}
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.songArtist, { color: colors.text + '80' }]} numberOfLines={1}>
          {item.primaryArtists}
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text + '80'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text + '80'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.card }]}
          placeholder="Search songs, artists, albums"
          placeholderTextColor={colors.text + '80'}
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : query.length > 2 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>No results found</Text>
        </View>
      ) : (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionTitle, { color: colors.text }]}>Browse All</Text>
          <View style={styles.suggestionGrid}>
            {['Pop', 'Hip Hop', 'Rock', 'Jazz', 'Classical', 'Electronic'].map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.genreCard, { backgroundColor: colors.card }]}
                onPress={() => handleSearch(genre)}
              >
                <Text style={[styles.genreText, { color: colors.text }]}>{genre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 44,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestions: {
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCard: {
    width: '48%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});