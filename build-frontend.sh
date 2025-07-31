#!/bin/bash

echo "🔨 Собираем frontend..."

# Переходим в папку frontend
cd frontend

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Проверяем, что сборка прошла успешно
if [ -d "dist" ]; then
    echo "✅ Frontend собран успешно!"
    echo "📁 Собранные файлы в папке: frontend/dist/"
    echo "📊 Размер папки dist:"
    du -sh dist/
else
    echo "❌ Ошибка сборки frontend"
    exit 1
fi

cd .. 