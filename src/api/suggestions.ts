import api from './client';

export const getSongSuggestions = async (id: string) => {
  const res = await api.get(`/songs/${id}/suggestions`);
  return res.data.data || [];
};
