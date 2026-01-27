import api from './axios';
import { UserCreate, UserResponse, UserListResponse } from '../types';

export const userApi = {
  /**
   * Register a new user (public endpoint)
   */
  register: async (data: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/admin/register', data);
    return response.data;
  },

  /**
   * Get all users (admin only)
   */
  getAll: async (): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>('/admin/users/');
    return response.data;
  },

  /**
   * Approve/activate a pending user (primary admin only)
   */
  approve: async (userId: number): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(
      `/admin/users/${userId}/approve`
    );
    return response.data;
  },

  /**
   * Delete a user (primary admin only)
   */
  delete: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  /**
   * Promote user to secondary admin (primary admin only)
   */
  promote: async (userId: number): Promise<UserResponse> => {
    const response = await api.post<UserResponse>(
      `/admin/users/${userId}/promote`
    );
    return response.data;
  },
};
