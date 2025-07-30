export interface Person {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number;
  reignStart?: number;
  reignEnd?: number;
  category: string;
  country: string;
  description: string;
  achievements: string[];
  imageUrl?: string;
}

export interface FilterOptions {
  categories?: string[];
  countries?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
} 