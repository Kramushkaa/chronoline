# Деплой Chronoline на Amvera

## Подготовка проекта

Проект уже настроен для деплоя на Amvera. Основные файлы:

- `amvera.yml` - конфигурация для Amvera
- `backend/amvera-server.js` - универсальный сервер (API + статические файлы)
- `frontend/src/services/api.ts` - настроен для работы в продакшене

## Структура деплоя

```
chronoline/
├── amvera.yml              # Конфигурация Amvera
├── package.json            # Корневые зависимости
├── frontend/
│   ├── dist/              # Собранные файлы (создается при сборке)
│   └── src/               # Исходный код
└── backend/
    ├── amvera-server.js   # Универсальный сервер
    ├── simple-server.js   # Обычный сервер для разработки
    └── .env              # Переменные окружения
```

## Процесс деплоя

### 1. Подготовка

```bash
# Установка зависимостей
npm run install:all

# Сборка frontend
cd frontend && npm run build && cd ..
```

### 2. Загрузка на Amvera

1. Загрузите проект в Git репозиторий
2. Подключите репозиторий к Amvera
3. Amvera автоматически:
   - Установит зависимости (`npm run install:all`)
   - Соберет frontend (`cd frontend && npm run build`)
   - Запустит сервер (`cd backend && node amvera-server.js`)

### 3. Настройка переменных окружения

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
2. **Обслуживает статические файлы** из `frontend/dist`
3. **Поддерживает SPA** - возвращает `index.html` для неизвестных маршрутов
4. **Настроен CORS** для кросс-доменных запросов

## Проверка работы

После деплоя:

- **Frontend**: `https://your-app.amvera.io/`
- **API**: `https://your-app.amvera.io/api/persons`

## Логи и отладка

В панели Amvera вы можете:

- Просматривать логи приложения
- Мониторить производительность
- Настраивать домены
- Управлять SSL сертификатами

## Обновление

Для обновления приложения:

1. Внесите изменения в код
2. Зафиксируйте в Git
3. Запушьте в репозиторий
4. Amvera автоматически пересоберет и перезапустит приложение

## Полезные команды

```bash
# Локальная сборка для тестирования
npm run install:all
cd frontend && npm run build && cd ..

# Тестирование сервера локально
cd backend && node amvera-server.js

# Проверка API
curl http://localhost:3001/api/persons
``` 