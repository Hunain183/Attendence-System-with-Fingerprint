import api from './axios';
import { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  /**
   * Admin login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/login', credentials);
    return response.data;
  },

  /**
   * Verify token is still valid
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};
