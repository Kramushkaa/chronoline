const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testAPI() {
  console.log('🧪 Тестирование API...\n');
  
  try {
    // Тест корневого маршрута
    console.log('1. Тестирование корневого маршрута:');
    const rootResult = await makeRequest('/');
    console.log(`   Статус: ${rootResult.status}`);
    console.log(`   Данные: ${JSON.stringify(rootResult.data, null, 2)}\n`);
    
    // Тест получения всех личностей
    console.log('2. Тестирование получения всех личностей:');
    const personsResult = await makeRequest('/api/persons');
    console.log(`   Статус: ${personsResult.status}`);
    console.log(`   Количество записей: ${personsResult.data.length}`);
    if (personsResult.data.length > 0) {
      console.log(`   Первая запись: ${personsResult.data[0].name} (${personsResult.data[0].birthYear} - ${personsResult.data[0].deathYear})`);
    }
    console.log('');
    
    // Тест получения категорий
    console.log('3. Тестирование получения категорий:');
    const categoriesResult = await makeRequest('/api/categories');
    console.log(`   Статус: ${categoriesResult.status}`);
    console.log(`   Категории: ${categoriesResult.data.join(', ')}\n`);
    
    // Тест получения стран
    console.log('4. Тестирование получения стран:');
    const countriesResult = await makeRequest('/api/countries');
    console.log(`   Статус: ${countriesResult.status}`);
    console.log(`   Страны: ${countriesResult.data.join(', ')}\n`);
    
    // Тест получения статистики
    console.log('5. Тестирование получения статистики:');
    const statsResult = await makeRequest('/api/stats');
    console.log(`   Статус: ${statsResult.status}`);
    console.log(`   Общая статистика:`, statsResult.data.overview);
    console.log(`   Статистика по категориям:`, statsResult.data.categories);
    console.log(`   Статистика по странам:`, statsResult.data.countries);
    console.log('');
    
    // Тест получения конкретной личности
    if (personsResult.data.length > 0) {
      console.log('6. Тестирование получения конкретной личности:');
      const personId = personsResult.data[0].id;
      const personResult = await makeRequest(`/api/persons/${personId}`);
      console.log(`   Статус: ${personResult.status}`);
      console.log(`   Личность: ${personResult.data.name}`);
      console.log('');
    }
    
    console.log('✅ Все тесты завершены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

testAPI(); 