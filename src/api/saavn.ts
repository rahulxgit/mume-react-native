import axios from 'axios';

const api = axios.create({
  baseURL: 'https://saavn.sumit.co/api',
});

export const searchSongs = async (query: string, page = 1) => {
  const res = await api.get('/search/songs', {
    params: { query, page },
  });
  return res.data.data.results;
};

export const getSongById = async (id: string) => {
  const res = await api.get(`/songs/${id}`);
  return res.data.data[0];
};
