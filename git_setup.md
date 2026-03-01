# Инструкция по настройке Git

## 1. Установка Git

Скачайте и установите Git для Windows:
- Ссылка: https://git-scm.com/download/win
- Запустите установщик и следуйте инструкциям
- После установки перезапустите терминал/PowerShell

## 2. Первоначальная настройка Git

После установки выполните следующие команды в терминале:

```bash
# Настройка имени пользователя
git config --global user.name "Ваше Имя"

# Настройка email
git config --global user.email "ваш.email@example.com"

# Проверка настроек
git config --list
```

## 3. Инициализация репозитория в проекте

```bash
# Перейдите в директорию проекта
cd C:\project\src

# Инициализируйте Git репозиторий
git init

# Добавьте файлы в индекс
git add .

# Создайте первый коммит
git commit -m "Initial commit"
```

## 4. Подключение к удаленному репозиторию (GitHub/GitLab)

```bash
# Добавьте удаленный репозиторий
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git

# Отправьте код на сервер
git push -u origin main
```

## 5. Полезные команды Git

```bash
# Проверка статуса
git status

# Просмотр изменений
git diff

# Просмотр истории коммитов
git log

# Создание новой ветки
git checkout -b название-ветки

# Переключение между ветками
git checkout название-ветки
```
