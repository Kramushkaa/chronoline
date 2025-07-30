import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Chronoline API',
    version: '1.0.0',
    endpoints: {
      persons: '/api/persons',
      categories: '/api/categories',
      countries: '/api/countries',
      stats: '/api/stats'
    }
  });
});

// Получить всех исторических личностей
app.get('/api/persons', async (req, res) => {
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
    
    // Фильтрация по стране
    if (country) {
      query += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
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
    const persons = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      birthYear: row.birth_year,
      deathYear: row.death_year,
      reignStart: row.reign_start,
      reignEnd: row.reign_end,
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
app.get('/api/persons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM persons WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Историческая личность не найдена' });
    }
    
    const row = result.rows[0];
    const person = {
      id: row.id,
      name: row.name,
      birthYear: row.birth_year,
      deathYear: row.death_year,
      reignStart: row.reign_start,
      reignEnd: row.reign_end,
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

// Получить категории
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT category FROM unique_categories');
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить страны
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT country FROM unique_countries');
    const countries = result.rows.map(row => row.country);
    res.json(countries);
  } catch (error) {
    console.error('Ошибка при получении стран:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить статистику
app.get('/api/stats', async (req, res) => {
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

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

export default app; 