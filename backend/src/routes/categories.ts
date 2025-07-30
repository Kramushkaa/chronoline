import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Получить уникальные категории
router.get('/list', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT category FROM unique_categories');
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 