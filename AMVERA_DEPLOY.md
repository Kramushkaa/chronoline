# Деплой Chronoline на Amvera

## Стратегия деплоя

Из-за проблем с компиляцией frontend на Amvera, мы используем следующую стратегию:

1. **Backend деплоится на Amvera** - API работает полностью
2. **Frontend собирается локально** и загружается отдельно
3. **Временная страница** показывается, пока frontend не готов

## Подготовка проекта

### 1. Сборка frontend локально

```bash
# Собираем frontend локально
chmod +x build-frontend.sh
./build-frontend.sh
```

### 2. Загрузка собранного frontend на Amvera

После успешной сборки, скопируйте папку `frontend/dist/` в корень проекта:

```bash
# Копируем собранные файлы в корень
cp -r frontend/dist/* .
```

## Структура деплоя

```
chronoline/
├── amvera.yml              # Конфигурация Amvera (только backend)
├── package.json            # Корневые зависимости
├── backend/
│   ├── amvera-server.js   # Универсальный сервер
│   └── .env              # Переменные окружения
└── dist/                  # Собранный frontend (добавляется вручную)
    ├── index.html
    ├── assets/
    └── ...
```

## Процесс деплоя

### 1. Подготовка backend

```bash
# Установка зависимостей backend
cd backend && npm install && cd ..
```

### 2. Сборка frontend

```bash
# Сборка frontend локально
cd frontend && npm install && npm run build && cd ..
```

### 3. Загрузка на Amvera

1. Загрузите проект в Git репозиторий
2. Подключите репозиторий к Amvera
3. Amvera автоматически:
   - Установит зависимости backend (`cd backend && npm install`)
   - Запустит сервер (`cd backend && node amvera-server.js`)

### 4. Настройка переменных окружения

В панели Amvera создайте переменные окружения:

```env
DB_HOST=amvera-kramushka-cnpg-chronoline-rw
DB_PORT=5432
DB_NAME=chronoline
DB_USER=Kramushka
DB_PASSWORD=1qwertyu
PORT=3001
NODE_ENV=production
```

## Особенности Amvera сервера

`backend/amvera-server.js` - это универсальный сервер, который:

1. **Обслуживает API** на `/api/*` маршрутах
2. **Обслуживает статические файлы** из `dist/` (если есть)
3. **Показывает временную страницу** если frontend не собран
4. **Настроен CORS** для кросс-доменных запросов

## Проверка работы

После деплоя:

- **Backend API**: `https://your-app.amvera.io/api/persons`
- **Временная страница**: `https://your-app.amvera.io/`
- **Frontend** (после загрузки): `https://your-app.amvera.io/`

## Обновление

### Backend:
1. Внесите изменения в backend код
2. Зафиксируйте в Git
3. Запушьте в репозиторий
4. Amvera автоматически перезапустит сервер

### Frontend:
1. Соберите frontend локально: `./build-frontend.sh`
2. Скопируйте `frontend/dist/` в корень проекта
3. Зафиксируйте и запушьте изменения

## Полезные команды

```bash
# Локальная сборка frontend
./build-frontend.sh

# Тестирование сервера локально
cd backend && node amvera-server.js

# Проверка API
curl http://localhost:3001/api/persons

# Проверка статических файлов
ls -la dist/
```

## Решение проблем

### Если frontend не собирается:
- Проверьте версию Node.js (должна быть 16+)
- Убедитесь, что все зависимости установлены
- Проверьте логи сборки

### Если API не работает:
- Проверьте переменные окружения в Amvera
- Убедитесь, что база данных доступна
- Проверьте логи сервера в панели Amvera 