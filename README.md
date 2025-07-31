# Chronoline - Интерактивная временная линия исторических личностей

Интерактивная временная линия, показывающая жизненные пути исторических личностей с их достижениями и периодами правления.

## 🚀 Быстрый старт

### Разработка

```bash
# Установка зависимостей
npm run install:all

# Запуск в режиме разработки
npm run dev
```

### Деплой на VDS

См. [DEPLOY.md](./DEPLOY.md) для подробных инструкций по деплою.

## 📁 Структура проекта

```
chronoline/
├── frontend/          # React приложение
│   ├── src/           # Исходный код
│   ├── dist/          # Собранные файлы (после build)
│   └── package.json
├── backend/           # Node.js сервер
│   ├── simple-server.js
│   ├── src/db/        # База данных
│   └── package.json
├── nginx.conf         # Конфигурация nginx
├── chronoline.service # Systemd сервис
├── deploy.sh          # Скрипт деплоя
└── package.json       # Корневой package.json
```

## 🛠 Технологии

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, PostgreSQL
- **Сервер**: Nginx, Systemd
- **Стили**: CSS-in-JS

## ✨ Функциональность

- 📅 Интерактивная временная линия
- 🎯 Маркеры ключевых достижений
- 👑 Периоды правления
- 🔍 Фильтрация по категориям и странам
- 📸 Отображение фотографий исторических личностей
- 📱 Адаптивный дизайн

## 🎨 Особенности интерфейса

- **Z-index иерархия**: Линия жизни > достижения > правление
- **Динамические маркеры**: Активные маркеры отображаются поверх остальных
- **Плавные анимации**: Все переходы и hover-эффекты
- **Tooltip'ы**: Детальная информация при наведении

## 🔧 Настройка

### Переменные окружения (backend/.env)

```env
DB_HOST=amvera-kramushka-cnpg-chronoline-rw
DB_PORT=5432
DB_NAME=chronoline
DB_USER=Kramushka
DB_PASSWORD=1qwertyu
PORT=5432
NODE_ENV=development
```

### База данных

Создайте базу данных PostgreSQL и выполните:

```sql
-- Создание таблиц
\i backend/src/db/init.sql

-- Заполнение данными
\i backend/src/db/seed.sql
```

## 📊 API Endpoints

- `GET /api/persons` - Получить всех исторических личностей
- `GET /api/categories` - Получить все категории
- `GET /api/countries` - Получить все страны
- `GET /api/stats` - Статистика

## 🚀 Деплой

Для деплоя на VDS используйте:

```bash
# Автоматический деплой
./deploy.sh

# Или ручная настройка
npm run build
sudo systemctl restart chronoline
sudo systemctl restart nginx
```

## 📝 Лицензия

MIT License 