#!/bin/bash

# Скрипт деплоя для Chronoline
# Использование: ./deploy.sh

set -e

echo "🚀 Начинаем деплой Chronoline..."

# Обновляем код из git
echo "📥 Обновляем код из git..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm run install:all

# Собираем frontend
echo "🔨 Собираем frontend..."
cd frontend
npm run build
cd ..

# Копируем файлы на сервер (если запускаем локально)
echo "📁 Копируем файлы..."
sudo cp -r . /var/www/chronoline/
sudo chown -R www-data:www-data /var/www/chronoline/

# Копируем конфигурацию nginx
echo "⚙️ Настраиваем nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/chronoline
sudo ln -sf /etc/nginx/sites-available/chronoline /etc/nginx/sites-enabled/
sudo nginx -t

# Копируем systemd сервис
echo "🔧 Настраиваем systemd сервис..."
sudo cp chronoline.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable chronoline
sudo systemctl restart chronoline

# Перезапускаем nginx
echo "🔄 Перезапускаем nginx..."
sudo systemctl restart nginx

echo "✅ Деплой завершен!"
echo "🌐 Сайт доступен по адресу: http://your-domain.com"
echo "📊 Статус сервиса: sudo systemctl status chronoline" 