import { Person } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Функция для обработки ответов от API
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка сети');
  }
  return response.json();
}

// Получить всех исторических личностей с фильтрами
export async function getPersons(filters?: {
  category?: string;
  country?: string;
  startYear?: number;
  endYear?: number;
}): Promise<Person[]> {
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.startYear) queryParams.append('startYear', filters.startYear.toString());
    if (filters.endYear) queryParams.append('endYear', filters.endYear.toString());
  }

  const response = await fetch(`${API_BASE_URL}/persons?${queryParams.toString()}`);
  return handleResponse<Person[]>(response);
}

// Получить уникальные категории
export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse<string[]>(response);
}

// Получить уникальные страны
export async function getCountries(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/countries`);
  return handleResponse<string[]>(response);
} 