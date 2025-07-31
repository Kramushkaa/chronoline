import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Получить уникальные страны (включая отдельные страны из составных записей)
router.get('/list', async (req: Request, res: Response) => {
  try {
    // Используем SQL для разбиения составных стран
    const result = await pool.query(`
      SELECT DISTINCT trim(individual_country) as country 
      FROM persons,
      LATERAL unnest(
        CASE 
          WHEN country LIKE '%/%' THEN 
            string_to_array(country, '/')
          ELSE 
            ARRAY[country]
        END
      ) AS individual_country
      WHERE trim(individual_country) != ''
      ORDER BY country
    `);
    
    const countries = result.rows.map(row => row.country);
    res.json(countries);
  } catch (error) {
    console.error('Ошибка при получении стран:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 