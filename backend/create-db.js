const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Подключаемся к базе данных postgres (которая существует по умолчанию)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Подключаемся к системной базе данных
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1qwertyu' // Используем пароль по умолчанию
  });

  try {
    await client.connect();
    console.log('✅ Подключение к PostgreSQL установлено');

    // Проверяем, существует ли база данных
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'chronoline_db'"
    );

    if (checkResult.rows.length === 0) {
      // Создаем базу данных
      await client.query('CREATE DATABASE chronoline_db');
      console.log('✅ База данных chronoline_db создана');
    } else {
      console.log('ℹ️ База данных chronoline_db уже существует');
    }

  } catch (error) {
    console.error('❌ Ошибка при создании базы данных:', error.message);
    
    if (error.code === '28P01') {
      console.log('💡 Возможные решения:');
      console.log('1. Проверьте пароль пользователя postgres');
      console.log('2. Убедитесь, что PostgreSQL запущен');
      console.log('3. Попробуйте запустить pgAdmin для настройки пароля');
    }
  } finally {
    await client.end();
  }
}

createDatabase(); 