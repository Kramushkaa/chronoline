import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { Person, FilterOptions } from '../types';

const router = Router();

// Получить всех исторических личностей
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, country, startYear, endYear } = req.query;
    
    let query = 'SELECT * FROM persons WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    // Фильтрация по категории
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // Фильтрация по стране (поддержка множественных стран через "/")
    if (country) {
      const countries = (country as string).split(',');
      const countryConditions = countries.map((_, index) => {
        return `EXISTS (
          SELECT 1 FROM unnest(string_to_array(country, '/')) AS individual_country 
          WHERE trim(individual_country) = $${paramIndex + index}
        )`;
      });
      query += ` AND (${countryConditions.join(' OR ')})`;
      countries.forEach(c => params.push(c.trim()));
      paramIndex += countries.length;
    }
    
    // Фильтрация по временному диапазону
    if (startYear) {
      query += ` AND death_year >= $${paramIndex}`;
      params.push(parseInt(startYear as string));
      paramIndex++;
    }
    
    if (endYear) {
      query += ` AND birth_year <= $${paramIndex}`;
      params.push(parseInt(endYear as string));
      paramIndex++;
    }
    
    query += ' ORDER BY birth_year ASC';
    
    const result = await pool.query(query, params);
    
    // Преобразование данных в формат frontend
    const persons: Person[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      birthYear: row.birth_year,
      deathYear: row.death_year,
      category: row.category,
      country: row.country,
      description: row.description,
      achievements: row.achievements,
      imageUrl: row.image_url
    }));
    
    res.json(persons);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить историческую личность по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM persons WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Историческая личность не найдена' });
    }
    
    const row = result.rows[0];
    const person: Person = {
      id: row.id,
      name: row.name,
      birthYear: row.birth_year,
      deathYear: row.death_year,
      category: row.category,
      country: row.country,
      description: row.description,
      achievements: row.achievements,
      imageUrl: row.image_url
    };
    
    res.json(person);
  } catch (error) {
    console.error('Ошибка при получении личности:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 