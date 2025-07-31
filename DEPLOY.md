# Деплой Chronoline на VDS

## Предварительные требования

1. **Ubuntu/Debian сервер** с root доступом
2. **Node.js** версии 16 или выше
3. **PostgreSQL** база данных
4. **Nginx** веб-сервер

## Установка зависимостей

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Устанавливаем Nginx
sudo apt install nginx -y

# Устанавливаем Git
sudo apt install git -y
```

## Настройка базы данных

```bash
# Подключаемся к PostgreSQL
sudo -u postgres psql

# Создаем базу данных
CREATE DATABASE chronoline_db;

# Создаем пользователя
CREATE USER chronoline_user WITH PASSWORD 'your_password';

# Даем права
GRANT ALL PRIVILEGES ON DATABASE chronoline_db TO chronoline_user;

# Выходим
\q
```

## Настройка проекта

```bash
# Клонируем репозиторий
git clone https://github.com/your-username/chronoline.git
cd chronoline

# Устанавливаем зависимости
npm run install:all

# Собираем frontend
cd frontend
npm run build
cd ..
```

## Настройка переменных окружения

Создайте файл `.env` в папке `backend`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chronoline_db
DB_USER=chronoline_user
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=production
```

## Настройка Nginx

1. Скопируйте `nginx.conf` в `/etc/nginx/sites-available/chronoline`
2. Замените `your-domain.com` на ваш домен
3. Активируйте сайт:

```bash
sudo ln -s /etc/nginx/sites-available/chronoline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Настройка Systemd сервиса

```bash
# Копируем сервис
sudo cp chronoline.service /etc/systemd/system/

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем и запускаем сервис
sudo systemctl enable chronoline
sudo systemctl start chronoline

# Проверяем статус
sudo systemctl status chronoline
```

## Автоматический деплой

Для автоматического деплоя используйте скрипт:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Проверка работы

1. **Frontend**: http://your-domain.com
2. **Backend API**: http://your-domain.com/api/
3. **Статус сервиса**: `sudo systemctl status chronoline`

## Полезные команды

```bash
# Просмотр логов backend
sudo journalctl -u chronoline -f

# Просмотр логов nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Перезапуск сервисов
sudo systemctl restart chronoline
sudo systemctl restart nginx

# Обновление SSL сертификата (если используете Let's Encrypt)
sudo certbot renew
```

## Структура проекта на сервере

```
/var/www/chronoline/
├── frontend/
│   ├── dist/          # Собранные файлы
│   └── src/           # Исходный код
├── backend/
│   ├── simple-server.js
│   └── .env
├── nginx.conf
├── chronoline.service
└── deploy.sh
``` 