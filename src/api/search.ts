import api from './client';

export const searchSongs = async (query: string, page = 1) => {
  const res = await api.get('/search/songs', {
    params: { query, page },
  });

  const results = res.data.data.results || [];
  // attach total as a property
  (results as any).total = res.data.data.total || 0;

  return results;
};


export const searchArtists = async (query: string) => {
  const res = await api.get('/search/artists', {
    params: { query },
  });
  return res.data.data.results;
};

export const searchAlbums = async (query: string) => {
  const res = await api.get('/search/albums', {
    params: { query },
  });
  return res.data.data.results;
};
