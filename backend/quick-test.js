const http = require('http');

// Простой тест корневого endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
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
      console.log('✅ API работает!');
      console.log('📊 Ответ:', jsonData);
    } catch (error) {
      console.log('❌ Ошибка парсинга JSON:', error.message);
      console.log('📄 Сырой ответ:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Ошибка подключения:', error.message);
});

req.end(); 