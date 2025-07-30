import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import pool from './db/connection';

const PORT = process.env.PORT || 3001;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const path = url.pathname;

    console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

    // Корневой маршрут
    if (path === '/' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Chronoline API',
        version: '1.0.0',
        endpoints: {
          persons: '/api/persons',
          categories: '/api/categories',
          countries: '/api/countries',
          stats: '/api/stats'
        }
      }));
      return;
    }

    // Получить всех исторических личностей
    if (path === '/api/persons' && req.method === 'GET') {
      const { searchParams } = url;
      const category = searchParams.get('category');
      const country = searchParams.get('country');
      const startYear = searchParams.get('startYear');
      const endYear = searchParams.get('endYear');
      
      let query = 'SELECT * FROM persons WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;
      
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }
      
      if (country) {
        query += ` AND country = $${paramIndex}`;
        params.push(country);
        paramIndex++;
      }
      
      if (startYear) {
        query += ` AND death_year >= $${paramIndex}`;
        params.push(parseInt(startYear));
        paramIndex++;
      }
      
      if (endYear) {
        query += ` AND birth_year <= $${paramIndex}`;
        params.push(parseInt(endYear));
        paramIndex++;
      }
      
      query += ' ORDER BY birth_year ASC';
      
      const result = await pool.query(query, params);
      
      const persons = result.rows.map(row => ({
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
      
      res.writeHead(200);
      res.end(JSON.stringify(persons));
      return;
    }

    // Получить историческую личность по ID
    if (path.startsWith('/api/persons/') && req.method === 'GET') {
      const id = path.split('/').pop();
      
      if (!id) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'ID не указан' }));
        return;
      }
      
      const result = await pool.query('SELECT * FROM persons WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Историческая личность не найдена' }));
        return;
      }
      
      const row = result.rows[0];
      const person = {
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
      
      res.writeHead(200);
      res.end(JSON.stringify(person));
      return;
    }

    // Получить категории
    if (path === '/api/categories' && req.method === 'GET') {
      const result = await pool.query('SELECT category FROM unique_categories');
      const categories = result.rows.map(row => row.category);
      
      res.writeHead(200);
      res.end(JSON.stringify(categories));
      return;
    }

    // Получить страны
    if (path === '/api/countries' && req.method === 'GET') {
      const result = await pool.query('SELECT country FROM unique_countries');
      const countries = result.rows.map(row => row.country);
      
      res.writeHead(200);
      res.end(JSON.stringify(countries));
      return;
    }

    // Получить статистику
    if (path === '/api/stats' && req.method === 'GET') {
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
      
      const stats = {
        overview: statsResult.rows[0],
        categories: categoryStatsResult.rows,
        countries: countryStatsResult.rows
      };
      
      res.writeHead(200);
      res.end(JSON.stringify(stats));
      return;
    }

    // 404 - маршрут не найден
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Маршрут не найден' }));

  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Внутренняя ошибка сервера' }));
  }
});

async function startServer() {
  try {
    // Проверка подключения к базе данных
    const client = await pool.connect();
    console.log('✅ Подключение к базе данных установлено');
    client.release();
    
    // Запуск сервера
    server.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 API доступен по адресу: http://localhost:${PORT}`);
      console.log(`🔗 CORS настроен для: http://localhost:5173`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Обработка завершения работы
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал завершения работы');
  await pool.end();
  console.log('✅ Подключения к базе данных закрыты');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал завершения работы');
  await pool.end();
  console.log('✅ Подключения к базе данных закрыты');
  process.exit(0);
});

startServer(); 