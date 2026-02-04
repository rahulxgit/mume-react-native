
//api/artiest.ts
import api from './client';


export const searchArtists = async (query: string, page = 0) => {
  const res = await api.get('/search/artists', {
    params: { query, page },
  });

return {
    results: res.data?.data?.results || [],
    total: res.data?.data?.total || 0,
  };

};



export const getArtistById = async (id: string) => {
  const res = await api.get(`/artists/${id}`);

  return {
    id: res.data.data.id,
    name: res.data.data.name,
    image: res.data.data.image?.[2]?.url,
    songs: res.data.data.topSongs,
    albums: res.data.data.topAlbums,
  };
};
