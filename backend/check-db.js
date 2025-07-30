const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'chronoline_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1qwertyu'
  });

  try {
    await client.connect();
    console.log('✅ Подключение к базе данных установлено\n');

    // Проверяем количество записей
    const countResult = await client.query('SELECT COUNT(*) FROM persons');
    console.log(`📊 Всего записей в таблице persons: ${countResult.rows[0].count}\n`);

    // Получаем все записи
    const personsResult = await client.query('SELECT * FROM persons ORDER BY birth_year');
    console.log('👥 Список исторических личностей:');
    console.log('='.repeat(80));
    
    personsResult.rows.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name} (${person.birth_year} - ${person.death_year})`);
      console.log(`   Категория: ${person.category}`);
      console.log(`   Страна: ${person.country}`);
      console.log(`   Описание: ${person.description}`);
      console.log(`   Достижения: ${person.achievements.join(', ')}`);
      console.log('');
    });

    // Получаем уникальные категории
    const categoriesResult = await client.query('SELECT * FROM unique_categories');
    console.log('📂 Уникальные категории:');
    categoriesResult.rows.forEach(cat => console.log(`   - ${cat.category}`));
    console.log('');

    // Получаем уникальные страны
    const countriesResult = await client.query('SELECT * FROM unique_countries');
    console.log('🌍 Уникальные страны:');
    countriesResult.rows.forEach(country => console.log(`   - ${country.country}`));

  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase(); 