const http = require('http');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Настройка подключения к базе данных
const pool = new Pool({
  host: process.env.DB_HOST || 'amvera-kramushka-cnpg-chronoline-rw',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'chronoline',
  user: process.env.DB_USER || 'Kramushka',
  password: process.env.DB_PASSWORD || '1qwertyu',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Функция для определения MIME типа файла
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Функция для обслуживания статических файлов
function serveStaticFile(res, filePath) {
  const fullPath = path.join(__dirname, '../frontend/dist', filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // Если файл не найден, возвращаем index.html для SPA
      if (filePath !== '/') {
        return serveStaticFile(res, '/');
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

    // API маршруты
    if (pathname.startsWith('/api/')) {
      // Получить всех исторических личностей
      if (pathname === '/api/persons' && req.method === 'GET') {
        const { searchParams } = url;
        const category = searchParams.get('category');
        const country = searchParams.get('country');
        const startYear = searchParams.get('startYear');
        const endYear = searchParams.get('endYear');
        
        let query = 'SELECT * FROM persons WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        
        if (category) {
          const categoryArray = category.split(',');
          query += ` AND category = ANY($${paramIndex}::text[])`;
          params.push(categoryArray);
          paramIndex++;
        }
        
        if (country) {
          const countryArray = country.split(',').map(c => c.trim());
          query += ` AND EXISTS ( 
            SELECT 1 FROM unnest(string_to_array(country, '/')) AS c
            WHERE trim(c) = ANY($${paramIndex}::text[])
          )`;
          params.push(countryArray);
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
          reignStart: row.reign_start,
          reignEnd: row.reign_end,
          category: row.category,
          country: row.country,
          description: row.description,
          achievements: row.achievements,
          achievementYear1: row.achievement_year_1,
          achievementYear2: row.achievement_year_2,
          achievementYear3: row.achievement_year_3,
          imageUrl: row.image_url
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(persons));
        return;
      }

      // Получить категории
      if (pathname === '/api/categories' && req.method === 'GET') {
        const result = await pool.query('SELECT category FROM unique_categories');
        const categories = result.rows.map(row => row.category);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(categories));
        return;
      }

      // Получить страны
      if (pathname === '/api/countries' && req.method === 'GET') {
        const result = await pool.query('SELECT country FROM unique_countries');
        const countries = result.rows.map(row => row.country);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(countries));
        return;
      }

      // Если API маршрут не найден
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
    }

    // Статические файлы (frontend)
    serveStaticFile(res, pathname);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

async function startServer() {
  try {
    // Проверяем подключение к базе данных
    const client = await pool.connect();
    console.log('✅ Подключение к базе данных установлено');
    client.release();
    
    server.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 API доступен по адресу: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend доступен по адресу: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer(); 