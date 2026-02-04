import api from './client';

export const getSongById = async (id: string) => {
  const res = await api.get(`/songs/${id}`);
  const song = res.data.data[0];

  const audioUrl =
    song.downloadUrl?.find((d: any) => d.quality === '320kbps')?.url ||
    song.downloadUrl?.find((d: any) => d.quality === '160kbps')?.url ||
    song.downloadUrl?.find((d: any) => d.quality === '96kbps')?.url ||
    song.downloadUrl?.[song.downloadUrl.length - 1]?.url;

  if (!audioUrl) {
    console.error('❌ No playable audio', song.downloadUrl);
    return null;
  }

  return {
    id: song.id,
    title: song.name,
    artist: song.artists?.primary?.[0]?.name || song.primaryArtists,
    artwork:
      song.image?.[2]?.url ||
      song.image?.[1]?.url ||
      song.image?.[0]?.url,
    duration: song.duration,
    url: audioUrl, 
  };
};
