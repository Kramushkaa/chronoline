import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Получить уникальные страны
router.get('/list', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT country FROM unique_countries');
    const countries = result.rows.map(row => row.country);
    res.json(countries);
  } catch (error) {
    console.error('Ошибка при получении стран:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 