# Survey API

API сервиса опросов и голосований с аналитикой результатов.

## Описание

Survey API — это REST API для создания и управления опросами. Система позволяет авторам создавать опросы с различными типами вопросов (одиночный выбор, множественный выбор, текстовый ответ), публиковать их и собирать ответы от респондентов. Авторы могут просматривать аналитику по результатам опросов.

## Технологический стек

- **Node.js** — среда выполнения
- **Express.js** — веб-фреймворк
- **MySQL** — база данных
- **Sequelize** — ORM для работы с БД
- **JWT** — аутентификация
- **bcryptjs** — хеширование паролей

## Структура проекта

```
src/
├── config/          # Конфигурация (база данных)
├── controllers/     # Контроллеры (бизнес-логика)
├── middleware/      # Middleware (авторизация, валидация)
├── migrations/      # Миграции базы данных
├── models/          # Модели Sequelize
├── routes/          # Маршруты API
├── seeders/         # Тестовые данные
├── server.js        # Точка входа приложения
└── package.json     # Зависимости проекта
```

## Установка и запуск

### Требования

- Node.js (v14 или выше)
- MySQL (v5.7 или выше)
- npm или yarn

### Шаги установки

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd src
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   
   Создайте файл `.env` на основе `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Отредактируйте `.env` и укажите параметры подключения к БД:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=survey_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Создайте базу данных**
   ```sql
   CREATE DATABASE survey_db;
   ```

5. **Запустите миграции**
   ```bash
   npm run migrate
   ```

6. **Заполните тестовыми данными (опционально)**
   ```bash
   npm run seed
   ```

7. **Запустите сервер**
   ```bash
   npm start
   ```
   
   Для разработки с автоперезагрузкой:
   ```bash
   npm run dev
   ```

Сервер будет доступен по адресу `http://localhost:3000`

## API Endpoints

### Аутентификация

- `POST /api/auth/register` — Регистрация пользователя
- `POST /api/auth/login` — Вход в систему
- `GET /api/auth/profile` — Получить профиль текущего пользователя (требует авторизации)

### Опросы

- `POST /api/surveys` — Создать опрос (требует авторизации)
- `GET /api/surveys` — Получить список опросов
  - Query параметры: `status` (draft/published/closed), `mySurveys` (true/false)
- `GET /api/surveys/:id` — Получить опрос по ID
  - Query параметр: `forResponse=true` — для прохождения опроса
- `PUT /api/surveys/:id` — Обновить опрос (только автор, только draft)
- `DELETE /api/surveys/:id` — Удалить опрос (только автор)
- `POST /api/surveys/:id/publish` — Опубликовать опрос (только автор)
- `POST /api/surveys/:id/close` — Закрыть опрос (только автор)

### Вопросы

- `POST /api/surveys/:surveyId/questions` — Добавить вопрос к опросу (только автор, только draft)
- `PUT /api/surveys/:surveyId/questions/:questionId` — Обновить вопрос (только автор, только draft)
- `DELETE /api/surveys/:surveyId/questions/:questionId` — Удалить вопрос (только автор, только draft)

### Варианты ответов

- `POST /api/surveys/:surveyId/questions/:questionId/options` — Добавить вариант ответа (только автор, только draft)
- `PUT /api/surveys/:surveyId/questions/:questionId/options/:optionId` — Обновить вариант (только автор, только draft)
- `DELETE /api/surveys/:surveyId/questions/:questionId/options/:optionId` — Удалить вариант (только автор, только draft)

### Ответы респондентов

- `POST /api/surveys/:surveyId/responses` — Отправить ответы на опрос (требует авторизации, только published)
- `GET /api/surveys/:surveyId/analytics` — Получить аналитику по опросу (только автор)

## Примеры запросов

### Регистрация
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Вход
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Создание опроса
```bash
POST /api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Customer Feedback",
  "description": "Help us improve"
}
```

### Добавление вопроса
```bash
POST /api/surveys/1/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "How satisfied are you?",
  "type": "single_choice",
  "order": 1
}
```

### Отправка ответов
```bash
POST /api/surveys/1/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "optionId": 2
    },
    {
      "questionId": 2,
      "optionIds": [3, 4]
    },
    {
      "questionId": 3,
      "textAnswer": "Great service!"
    }
  ]
}
```

## Модель данных

### Основные сущности

- **User** — пользователи системы (авторы и респонденты)
- **Survey** — опросы (статусы: draft, published, closed)
- **Question** — вопросы (типы: single_choice, multiple_choice, text)
- **Option** — варианты ответов для вопросов с выбором
- **Response** — ответ респондента на опрос
- **Answer** — ответ на конкретный вопрос

### Связи

- User → Survey (один ко многим, автор)
- Survey → Question (один ко многим)
- Question → Option (один ко многим)
- User → Response (один ко многим, респондент)
- Survey → Response (один ко многим)
- Response → Answer (один ко многим)
- Question → Answer (один ко многим)
- Option → Answer (один ко многим, опционально)

## Бизнес-правила

1. Опрос создаётся со статусом "draft"
2. Только автор может редактировать опрос в статусе "draft"
3. Опубликованный опрос нельзя редактировать (структуру вопросов)
4. Респондент может пройти опрос только один раз
5. Только опубликованные опросы можно проходить
6. К текстовым вопросам нельзя добавлять варианты ответов
7. Валидация ответов зависит от типа вопроса:
   - single_choice: ровно один optionId
   - multiple_choice: массив optionIds (минимум один)
   - text: обязательный textAnswer

## Тестовые данные

После запуска сидеров (`npm run seed`) будут созданы:

- **Авторы:**
  - author1@test.com / password123
  - author2@test.com / password123

- **Респондент:**
  - respondent1@test.com / password123

- **Тестовые опросы:**
  - Customer Satisfaction Survey (draft)
  - Product Feedback (published)

## Разработка

### Запуск в режиме разработки
```bash
npm run dev
```

### Запуск миграций
```bash
npm run migrate
```

### Запуск сидеров
```bash
npm run seed
```

## Лицензия

ISC
