const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Функция для выполнения HTTP запросов
function makeRequest(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: encodeURI(path),
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (error) {
        callback(error, data);
      }
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.end();
}

// Тесты API
async function testAPI() {
  console.log('🧪 Тестирование Chronoline API...\n');

  // Тест 1: Корневой endpoint
  console.log('1️⃣ Тестирование корневого endpoint...');
  makeRequest('/', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log('✅ API доступен:', data.message);
    }
  });

  // Тест 2: Получение всех личностей
  console.log('\n2️⃣ Тестирование получения всех личностей...');
  makeRequest('/api/persons', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log(`✅ Получено ${data.length} личностей`);
      if (data.length > 0) {
        console.log(`   Пример: ${data[0].name} (${data[0].category})`);
      }
    }
  });

  // Тест 3: Фильтрация по категории
  console.log('\n3️⃣ Тестирование фильтрации по категории...');
  makeRequest('/api/persons?category=Философ', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log(`✅ Найдено ${data.length} философов`);
    }
  });

  // Тест 4: Получение категорий
  console.log('\n4️⃣ Тестирование получения категорий...');
  makeRequest('/api/categories', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log(`✅ Найдено ${data.length} категорий:`, data.join(', '));
    }
  });

  // Тест 5: Получение стран
  console.log('\n5️⃣ Тестирование получения стран...');
  makeRequest('/api/countries', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log(`✅ Найдено ${data.length} стран:`, data.slice(0, 5).join(', ') + '...');
    }
  });

  // Тест 6: Статистика
  console.log('\n6️⃣ Тестирование статистики...');
  makeRequest('/api/stats', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log('✅ Статистика получена:');
      console.log(`   Всего личностей: ${data.overview.total_persons}`);
      console.log(`   Категорий: ${data.overview.unique_categories}`);
      console.log(`   Стран: ${data.overview.unique_countries}`);
      console.log(`   Временной диапазон: ${data.overview.earliest_birth} - ${data.overview.latest_death}`);
    }
  });

  // Тест 7: Получение конкретной личности
  console.log('\n7️⃣ Тестирование получения личности по ID...');
  makeRequest('/api/persons/1', (error, data) => {
    if (error) {
      console.log('❌ Ошибка:', error.message);
    } else {
      console.log(`✅ Получена личность: ${data.name} (${data.category})`);
    }
  });
}

// Запуск тестов
console.log('🚀 Запуск тестов API...');
console.log(`📍 Базовый URL: ${BASE_URL}\n`);

testAPI();

// Ожидание завершения всех тестов
setTimeout(() => {
  console.log('\n🎉 Тестирование завершено!');
  console.log('\n💡 Если все тесты прошли успешно, API готов к работе!');
  console.log('📖 Документация API: http://localhost:3001/');
}, 3000); 