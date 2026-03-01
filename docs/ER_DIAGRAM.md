# ER-диаграмма базы данных Survey API

## Описание схемы

База данных состоит из 6 основных таблиц, связанных между собой через внешние ключи.

## Таблицы

### users
Хранит информацию о пользователях системы (авторах и респондентах).

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| email | VARCHAR(255) UNIQUE NOT NULL | Email пользователя |
| password | VARCHAR(255) NOT NULL | Хешированный пароль |
| name | VARCHAR(255) NOT NULL | Имя пользователя |
| createdAt | DATETIME NOT NULL | Дата создания |
| updatedAt | DATETIME NOT NULL | Дата обновления |

### surveys
Хранит информацию об опросах.

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| title | VARCHAR(255) NOT NULL | Заголовок опроса |
| description | TEXT | Описание опроса |
| status | ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft' | Статус опроса |
| authorId | INT NOT NULL FOREIGN KEY → users.id | Автор опроса |
| createdAt | DATETIME NOT NULL | Дата создания |
| updatedAt | DATETIME NOT NULL | Дата обновления |

### questions
Хранит вопросы опросов.

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| surveyId | INT NOT NULL FOREIGN KEY → surveys.id | Опрос, к которому относится вопрос |
| text | TEXT NOT NULL | Текст вопроса |
| type | ENUM('single_choice', 'multiple_choice', 'text') NOT NULL | Тип вопроса |
| order | INT NOT NULL DEFAULT 0 | Порядок вопроса в опросе |
| createdAt | DATETIME NOT NULL | Дата создания |
| updatedAt | DATETIME NOT NULL | Дата обновления |

### options
Хранит варианты ответов для вопросов с выбором.

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| questionId | INT NOT NULL FOREIGN KEY → questions.id | Вопрос, к которому относится вариант |
| text | VARCHAR(255) NOT NULL | Текст варианта ответа |
| order | INT NOT NULL DEFAULT 0 | Порядок варианта в вопросе |
| createdAt | DATETIME NOT NULL | Дата создания |
| updatedAt | DATETIME NOT NULL | Дата обновления |

### responses
Хранит информацию об ответах респондентов на опросы.

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| surveyId | INT NOT NULL FOREIGN KEY → surveys.id | Опрос |
| respondentId | INT NOT NULL FOREIGN KEY → users.id | Респондент |
| createdAt | DATETIME NOT NULL | Дата создания |

**Уникальный индекс:** (surveyId, respondentId) - один респондент может ответить на опрос только один раз.

### answers
Хранит ответы на конкретные вопросы.

| Поле | Тип | Описание |
|------|-----|----------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Уникальный идентификатор |
| responseId | INT NOT NULL FOREIGN KEY → responses.id | Ответ респондента на опрос |
| questionId | INT NOT NULL FOREIGN KEY → questions.id | Вопрос |
| optionId | INT NULL FOREIGN KEY → options.id | Выбранный вариант (для вопросов с выбором) |
| textAnswer | TEXT NULL | Текстовый ответ (для текстовых вопросов) |
| createdAt | DATETIME NOT NULL | Дата создания |

## Связи

1. **users → surveys** (один ко многим)
   - Один пользователь может создать множество опросов
   - Связь: `surveys.authorId` → `users.id`
   - При удалении пользователя удаляются его опросы (CASCADE)

2. **surveys → questions** (один ко многим)
   - Один опрос содержит множество вопросов
   - Связь: `questions.surveyId` → `surveys.id`
   - При удалении опроса удаляются его вопросы (CASCADE)

3. **questions → options** (один ко многим)
   - Один вопрос может иметь множество вариантов ответов
   - Связь: `options.questionId` → `questions.id`
   - При удалении вопроса удаляются его варианты (CASCADE)

4. **users → responses** (один ко многим)
   - Один пользователь может ответить на множество опросов
   - Связь: `responses.respondentId` → `users.id`
   - При удалении пользователя удаляются его ответы (CASCADE)

5. **surveys → responses** (один ко многим)
   - Один опрос может иметь множество ответов от разных респондентов
   - Связь: `responses.surveyId` → `surveys.id`
   - При удалении опроса удаляются все ответы на него (CASCADE)

6. **responses → answers** (один ко многим)
   - Один ответ на опрос содержит ответы на все вопросы
   - Связь: `answers.responseId` → `responses.id`
   - При удалении ответа удаляются все ответы на вопросы (CASCADE)

7. **questions → answers** (один ко многим)
   - Один вопрос может иметь множество ответов от разных респондентов
   - Связь: `answers.questionId` → `questions.id`
   - При удалении вопроса удаляются все ответы на него (CASCADE)

8. **options → answers** (один ко многим, опционально)
   - Один вариант ответа может быть выбран множеством респондентов
   - Связь: `answers.optionId` → `options.id`
   - При удалении варианта ответа устанавливается NULL в ответах (SET NULL)

## Ограничения и бизнес-правила

1. **Уникальность ответа респондента на опрос**
   - Индекс `(surveyId, respondentId)` гарантирует, что один респондент может ответить на опрос только один раз

2. **Типы вопросов**
   - `single_choice`: требует один `optionId` в ответе
   - `multiple_choice`: требует массив `optionIds` в ответе
   - `text`: требует `textAnswer` в ответе

3. **Валидация на уровне БД**
   - Email пользователя уникален
   - Статус опроса может быть только: draft, published, closed
   - Тип вопроса может быть только: single_choice, multiple_choice, text

## Диаграмма связей

```
users
  ├── surveys (authorId)
  └── responses (respondentId)

surveys
  ├── questions (surveyId)
  └── responses (surveyId)

questions
  ├── options (questionId)
  └── answers (questionId)

options
  └── answers (optionId)

responses
  └── answers (responseId)
```

## Визуализация

Для визуализации ER-диаграммы можно использовать:
- [dbdiagram.io](https://dbdiagram.io) - онлайн инструмент для создания ER-диаграмм
- MySQL Workbench - для генерации диаграммы из существующей БД

### Пример кода для dbdiagram.io

```sql
Table users {
  id int [pk, increment]
  email varchar(255) [unique, not null]
  password varchar(255) [not null]
  name varchar(255) [not null]
  createdAt datetime [not null]
  updatedAt datetime [not null]
}

Table surveys {
  id int [pk, increment]
  title varchar(255) [not null]
  description text
  status enum('draft', 'published', 'closed') [not null, default: 'draft']
  authorId int [ref: > users.id, not null]
  createdAt datetime [not null]
  updatedAt datetime [not null]
}

Table questions {
  id int [pk, increment]
  surveyId int [ref: > surveys.id, not null]
  text text [not null]
  type enum('single_choice', 'multiple_choice', 'text') [not null]
  order int [not null, default: 0]
  createdAt datetime [not null]
  updatedAt datetime [not null]
}

Table options {
  id int [pk, increment]
  questionId int [ref: > questions.id, not null]
  text varchar(255) [not null]
  order int [not null, default: 0]
  createdAt datetime [not null]
  updatedAt datetime [not null]
}

Table responses {
  id int [pk, increment]
  surveyId int [ref: > surveys.id, not null]
  respondentId int [ref: > users.id, not null]
  createdAt datetime [not null]
  
  indexes {
    (surveyId, respondentId) [unique]
  }
}

Table answers {
  id int [pk, increment]
  responseId int [ref: > responses.id, not null]
  questionId int [ref: > questions.id, not null]
  optionId int [ref: > options.id]
  textAnswer text
  createdAt datetime [not null]
}
```
