import { API_ENDPOINTS } from "../config/api";
import { apiRequest } from "../utils/request";
import type { FilterOptions } from "../types";

export const filtersApi = {
  getFilterOptions: async (): Promise<FilterOptions> => {
    return apiRequest<FilterOptions>(API_ENDPOINTS.FILTER_OPTIONS);
  },

  getSubjects: async (): Promise<string[]> => {
    return apiRequest<string[]>(API_ENDPOINTS.SUBJECTS);
  },

  getPublishers: async (): Promise<string[]> => {
    return apiRequest<string[]>(API_ENDPOINTS.PUBLISHERS);
  },
};
