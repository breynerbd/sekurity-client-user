import axios from "axios";
import { AUTH_SERVICE_URL, SERVER_USER_URL } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";

function createClient(baseURL) {
  const client = axios.create({ baseURL, timeout: 15000 });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Cliente para el auth-service (.NET)
export const authApi = createClient(AUTH_SERVICE_URL);

// Cliente para el server-user (Node/Express: zones, reports, comments, ratings, users)
export const userApi = createClient(SERVER_USER_URL);
