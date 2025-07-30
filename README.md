# Chronoline - Интерактивная временная шкала исторических личностей

Интерактивное веб-приложение для визуализации временных шкал исторических личностей с возможностью фильтрации и поиска.

## 🏗️ Архитектура проекта

Проект состоит из двух частей:
- **Frontend** - React + TypeScript + Vite + D3.js
- **Backend** - Node.js + Express + PostgreSQL + TypeScript

## 📁 Структура проекта

```
chronoline/
├── src/                    # Frontend (React)
│   ├── components/         # React компоненты
│   ├── data/              # Локальные данные (для разработки)
│   ├── services/          # API сервисы
│   └── types/             # TypeScript типы
├── backend/               # Backend (Node.js + Express)
│   ├── src/
│   │   ├── db/           # База данных
│   │   ├── routes/       # API маршруты
│   │   ├── types/        # TypeScript типы
│   │   ├── app.ts        # Express приложение
│   │   └── server.ts     # Сервер
│   └── package.json
├── package.json          # Frontend зависимости
└── README.md
```

## 🚀 Быстрый старт

### Предварительные требования

1. **Node.js** (версия 16 или выше)
2. **PostgreSQL** (версия 12 или выше)
3. **npm** или **yarn**

### Установка и настройка

#### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd chronoline
```

#### 2. Настройка Frontend
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

#### 3. Настройка Backend
```bash
# Переход в папку backend
cd backend

# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env
# Отредактируйте .env файл с вашими параметрами PostgreSQL

# Создание базы данных
# В PostgreSQL выполните: CREATE DATABASE chronoline_db;

# Инициализация и заполнение базы данных
npm run setup

# Запуск сервера в режиме разработки
npm run dev
```

### Переменные окружения (Backend)

Создайте файл `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chronoline_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🛠️ Разработка

### Frontend (React)

- **Порт**: 5173 (http://localhost:5173)
- **Технологии**: React, TypeScript, Vite, D3.js, Lucide React
- **Команды**:
  - `npm run dev` - режим разработки
  - `npm run build` - сборка для продакшена
  - `npm run preview` - предварительный просмотр

### Backend (Node.js)

- **Порт**: 3001 (http://localhost:3001)
- **Технологии**: Express, PostgreSQL, TypeScript
- **Команды**:
  - `npm run dev` - режим разработки
  - `npm run build` - сборка TypeScript
  - `npm run start` - запуск продакшн версии
  - `npm run setup` - полная настройка БД

## 📊 API Endpoints

### Основные маршруты

- `GET /api/persons` - Получить всех исторических личностей
- `GET /api/persons/:id` - Получить личность по ID
- `GET /api/persons/categories/list` - Получить список категорий
- `GET /api/persons/countries/list` - Получить список стран
- `GET /api/persons/stats/overview` - Получить статистику

### Примеры запросов

```bash
# Получить всех философов
curl "http://localhost:3001/api/persons?category=Философ"

# Получить ученых из Англии
curl "http://localhost:3001/api/persons?category=Ученый&country=Англия"

# Получить личности из определенного периода
curl "http://localhost:3001/api/persons?startYear=-500&endYear=1500"
```

## 🎨 Функциональность

### Frontend
- 📅 Интерактивная временная шкала
- 🔍 Фильтрация по категориям, странам и периодам
- 📊 Визуализация данных с помощью D3.js
- 📱 Адаптивный дизайн
- ⚡ Быстрая загрузка с Vite

### Backend
- 🗄️ PostgreSQL база данных
- 🔒 Типизированный API с TypeScript
- 📈 Статистика и аналитика
- 🔍 Гибкая фильтрация данных
- 🚀 Высокая производительность

## 🗄️ База данных

### Структура таблицы `persons`

| Поле | Тип | Описание |
|------|-----|----------|
| id | VARCHAR(50) | Уникальный идентификатор |
| name | VARCHAR(255) | Имя исторической личности |
| birth_year | INTEGER | Год рождения |
| death_year | INTEGER | Год смерти |
| category | VARCHAR(100) | Категория (Философ, Ученый, и т.д.) |
| country | VARCHAR(100) | Страна |
| description | TEXT | Описание |
| achievements | TEXT[] | Массив достижений |
| image_url | VARCHAR(500) | URL изображения (опционально) |

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

ISC

## 👥 Авторы

- Frontend: React + TypeScript + D3.js
- Backend: Node.js + Express + PostgreSQL 