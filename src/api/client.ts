import axios from 'axios';

const api = axios.create({
  baseURL: 'https://saavn.sumit.co/api',
  timeout: 10000,
});

export default api;
