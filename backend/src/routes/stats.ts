import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Получить статистику
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_persons,
        MIN(birth_year) as earliest_birth,
        MAX(death_year) as latest_death,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(DISTINCT country) as unique_countries
      FROM persons
    `);
    
    const categoryStatsResult = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM persons
      GROUP BY category
      ORDER BY count DESC
    `);
    
    const countryStatsResult = await pool.query(`
      SELECT country, COUNT(*) as count
      FROM persons
      GROUP BY country
      ORDER BY count DESC
    `);
    
    res.json({
      overview: statsResult.rows[0],
      categories: categoryStatsResult.rows,
      countries: countryStatsResult.rows
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 