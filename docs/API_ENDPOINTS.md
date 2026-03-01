# API Endpoints Documentation

## Базовый URL
```
http://localhost:3000/api
```

## Аутентификация

### Регистрация
**POST** `/auth/register`

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Ответ (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Вход
**POST** `/auth/login`

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Профиль
**GET** `/auth/profile`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

## Опросы

### Создать опрос
**POST** `/surveys`

**Заголовки:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "title": "Customer Feedback",
  "description": "Help us improve our service"
}
```

**Ответ (201):**
```json
{
  "message": "Survey created successfully",
  "survey": {
    "id": 1,
    "title": "Customer Feedback",
    "description": "Help us improve our service",
    "status": "draft",
    "authorId": 1,
    "createdAt": "2026-03-01T12:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

### Получить список опросов
**GET** `/surveys`

**Query параметры:**
- `status` (опционально): `draft`, `published`, `closed`
- `mySurveys` (опционально): `true` - только мои опросы

**Примеры:**
- `/surveys` - все опросы
- `/surveys?status=published` - только опубликованные
- `/surveys?mySurveys=true` - только мои опросы
- `/surveys?status=published&mySurveys=true` - мои опубликованные опросы

**Ответ (200):**
```json
{
  "surveys": [
    {
      "id": 1,
      "title": "Customer Feedback",
      "description": "Help us improve",
      "status": "published",
      "authorId": 1,
      "author": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "questions": [...]
    }
  ]
}
```

### Получить опрос по ID
**GET** `/surveys/:id`

**Query параметры:**
- `forResponse=true` - для прохождения опроса (проверяет статус и повторное прохождение)

**Ответ (200):**
```json
{
  "survey": {
    "id": 1,
    "title": "Customer Feedback",
    "status": "published",
    "author": {...},
    "questions": [
      {
        "id": 1,
        "text": "How satisfied are you?",
        "type": "single_choice",
        "order": 1,
        "options": [
          {"id": 1, "text": "Very satisfied", "order": 1},
          {"id": 2, "text": "Satisfied", "order": 2}
        ]
      }
    ]
  }
}
```

### Обновить опрос
**PUT** `/surveys/:id`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Ответ (200):**
```json
{
  "message": "Survey updated successfully",
  "survey": {...}
}
```

### Удалить опрос
**DELETE** `/surveys/:id`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Survey deleted successfully"
}
```

### Опубликовать опрос
**POST** `/surveys/:id/publish`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Survey published successfully",
  "survey": {...}
}
```

### Закрыть опрос
**POST** `/surveys/:id/close`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "message": "Survey closed successfully",
  "survey": {...}
}
```

## Вопросы

### Добавить вопрос
**POST** `/surveys/:surveyId/questions`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "text": "How satisfied are you?",
  "type": "single_choice",
  "order": 1
}
```

**Типы вопросов:**
- `single_choice` - одиночный выбор
- `multiple_choice` - множественный выбор
- `text` - текстовый ответ

**Ответ (201):**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": 1,
    "surveyId": 1,
    "text": "How satisfied are you?",
    "type": "single_choice",
    "order": 1
  }
}
```

### Обновить вопрос
**PUT** `/surveys/:surveyId/questions/:questionId`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "text": "Updated question text",
  "order": 2
}
```

### Удалить вопрос
**DELETE** `/surveys/:surveyId/questions/:questionId`

**Заголовки:**
```
Authorization: Bearer <token>
```

## Варианты ответов

### Добавить вариант ответа
**POST** `/surveys/:surveyId/questions/:questionId/options`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
```json
{
  "text": "Very satisfied",
  "order": 1
}
```

**Ответ (201):**
```json
{
  "message": "Option created successfully",
  "option": {
    "id": 1,
    "questionId": 1,
    "text": "Very satisfied",
    "order": 1
  }
}
```

### Обновить вариант
**PUT** `/surveys/:surveyId/questions/:questionId/options/:optionId`

### Удалить вариант
**DELETE** `/surveys/:surveyId/questions/:questionId/options/:optionId`

## Ответы респондентов

### Отправить ответы
**POST** `/surveys/:surveyId/responses`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Тело запроса:**
```json
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

**Формат ответов:**
- Для `single_choice`: `{"questionId": 1, "optionId": 2}`
- Для `multiple_choice`: `{"questionId": 2, "optionIds": [3, 4]}`
- Для `text`: `{"questionId": 3, "textAnswer": "..."}`

**Ответ (201):**
```json
{
  "message": "Response submitted successfully",
  "responseId": 1
}
```

### Получить аналитику
**GET** `/surveys/:surveyId/analytics`

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ (200):**
```json
{
  "analytics": {
    "surveyId": 1,
    "title": "Customer Feedback",
    "status": "published",
    "totalResponses": 10,
    "questions": [
      {
        "questionId": 1,
        "text": "How satisfied are you?",
        "type": "single_choice",
        "options": [
          {
            "optionId": 1,
            "text": "Very satisfied",
            "count": 5,
            "percentage": 50.00
          },
          {
            "optionId": 2,
            "text": "Satisfied",
            "count": 3,
            "percentage": 30.00
          }
        ]
      },
      {
        "questionId": 3,
        "text": "Any comments?",
        "type": "text",
        "textAnswers": [
          {
            "text": "Great service!",
            "submittedAt": "2026-03-01T12:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

## Коды ошибок

- `400` - Ошибка валидации
- `401` - Требуется авторизация / Неверный токен
- `403` - Доступ запрещён
- `404` - Ресурс не найден
- `409` - Конфликт (например, пользователь уже существует)
- `500` - Внутренняя ошибка сервера

## Формат ошибок

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "errors": [
    {
      "msg": "Validation error",
      "param": "email",
      "location": "body"
    }
  ]
}
```
