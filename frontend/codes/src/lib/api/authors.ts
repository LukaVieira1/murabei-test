import { API_ENDPOINTS } from "../config/api";
import { apiRequest } from "../utils/request";
import type { Author } from "../types";

export const authorsApi = {
  getAuthors: async (): Promise<Author[]> => {
    return apiRequest<Author[]>(API_ENDPOINTS.AUTHORS);
  },

  getAuthor: async (id: number): Promise<Author> => {
    return apiRequest<Author>(`${API_ENDPOINTS.AUTHORS}/${id}`);
  },
};
