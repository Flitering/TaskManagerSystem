# Task Manager System

Данное приложение представляет собой систему управления задачами с использованием стека **FastAPI** для бэкенда и **React** для фронтенда.

## Требования

- **Python 3.10** или выше
- **Node.js 18** или выше
- **npm** или **yarn**

## Установка и запуск бэкенда

### 1. Клонирование репозитория

git clone https://github.com/Flitering/TaskManagerSystem.git
cd TaskManagerSystem/backend

2. Создание виртуального окружения
python -m venv venv

3. Активация виртуального окружения

Для Windows:

venv\Scripts\activate

4. Установка зависимостей
pip install -r requirements.txt

5. Настройка переменных окружения
Создайте файл .env в папке backend со следующим содержимым:

SECRET_KEY=your_secret_key

Замените your_secret_key на случайную строку.

6. Запуск бэкенда

uvicorn app.main:app --reload

Бэкенд будет доступен по адресу: http://localhost:8000

Установка и запуск фронтенда
1. Перейдите в директорию фронтенда
cd ../frontend
2. Установка зависимостей
npm install
3. Запуск фронтенда
npm start
Фронтенд будет доступен по адресу: http://localhost:3000