import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { playSong } from '../services/trackPlayer';
import { usePlayerStore } from '../store/playerStore';

export default function SongCard({ song }: any) {
  const setSong = usePlayerStore((s) => s.setSong);

  const onPlay = async () => {
    setSong(song);
    await playSong(song);
  };

  return (
    <TouchableOpacity onPress={onPlay} style={{ flexDirection: 'row', padding: 10 }}>
      <Image
        source={{ uri: song.image[1].link }}
        style={{ width: 50, height: 50, borderRadius: 8 }}
      />
      <View style={{ marginLeft: 10 }}>
        <Text>{song.name}</Text>
        <Text>{song.primaryArtists}</Text>
      </View>
    </TouchableOpacity>
  );
}
