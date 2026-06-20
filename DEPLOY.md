# DEPLOY.md — Инструкция по деплою

## Быстрый деплой (на проде)

```bash
ssh root@80.78.244.84
cd /var/www/shkola-pk
bash deploy.sh
```

`deploy.sh` автоматически:
1. Создаёт backup БД (3 БД: shkola_pk, shkola_pk_payload, shkola_pk_audit)
2. Запускает миграции (`scripts/migrate.sh`)
3. Проверяет синхронизацию блоков (`scripts/check-block-sync.sh`)
4. git pull → npm install → build (payload + frontend)
5. PM2 restart
6. Smoke test (10 проверок)
7. Если smoke test провален → автоматический откат

---

## Локальная разработка

### Первый запуск

```bash
# 1. Клонировать репозиторий
git clone git@github.com:linx7510/shkola-pk.git
cd shkola-pk

# 2. Запустить PostgreSQL через Docker
docker compose -f docker-compose.dev.yml up -d postgres-dev

# 3. Создать .env.local
cp .env.local.example .env.local
# (отредактировать если нужно — по умолчанию работает с Docker)

# 4. Установить зависимости
cd payload-cms && npm install && cd ..
cd app-payload && npm install && cd ..

# 5. Запустить Payload CMS (порт 3001)
cd payload-cms
npm run dev
# Payload создаст таблицы автоматически при первом запуске

# 6. В отдельном терминале — запустить Frontend (порт 3000)
cd app-payload
npm run dev
```

### Ежедневная разработка

```bash
# 1. Запустить Docker PostgreSQL (если не запущен)
docker compose -f docker-compose.dev.yml up -d postgres-dev

# 2. Запустить Payload CMS
cd payload-cms && npm run dev

# 3. Запустить Frontend (в другом терминале)
cd app-payload && npm run dev

# 4. Открыть http://localhost:3000
#    Admin: http://localhost:3001/admin
```

### Полный старт через Docker (всех сервисов)

```bash
docker compose -f docker-compose.dev.yml up
# Frontend: http://localhost:3000
# Payload:  http://localhost:3001/admin
# PostgreSQL: localhost:5433
```

---

## Checklist перед деплоем

Перед каждым деплоем на прод — проверьте:

```
□ 1. Изменения протестированы локально
     - Откройте http://localhost:3000
     - Проверьте визуально все изменённые страницы

□ 2. TypeScript build проходит без ошибок
     cd app-payload && npm run build
     cd payload-cms && npm run build

□ 3. Block sync check проходит
     bash scripts/check-block-sync.sh

□ 4. Создана миграция (если менялась schema БД)
     - Добавили новый блок? → создайте SQL для таблицы
     - Добавьте в src/migrations/0002_xxx.js
     - Проверьте: bash scripts/migrate.sh

□ 5. Нет секретов в коде
     - .env НЕ коммитится (в .gitignore)
     - .env.local НЕ коммитится
     - Пароли/токены только в .env

□ 6. Git commit + push
     git add -A
     git commit -m "feat: описание изменения"
     git push origin main

□ 7. SSH на прод: bash deploy.sh
     ssh root@80.78.244.84
     cd /var/www/shkola-pk
     bash deploy.sh

□ 8. Проверить smoke test результат
     - 10/10 passed → ✓ деплой успешен
     - FAILED → автоматически откат
     - Telegram-уведомление придёт в обоих случаях

□ 9. Проверить визуально 3 ключевые страницы
     - https://2980738.ru/
     - https://2980738.ru/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn
     - https://2980738.ru/blog
```

---

## Откат (rollback)

### Автоматический (при провале smoke test)

`deploy.sh` автоматически откатывает деплой если smoke test провален:
1. `git reset --hard` к предыдущему commit
2. Rebuild (payload + frontend)
3. PM2 restart
4. Повторный smoke test

### Ручной откат

```bash
ssh root@80.78.244.84
cd /var/www/shkola-pk
bash scripts/rollback.sh
```

`rollback.sh`:
1. Восстанавливает БД из последнего бэкапа
2. git reset --hard HEAD~1 (к предыдущему commit)
3. Rebuild + restart
4. Smoke test

### Откат к конкретному commit

```bash
ssh root@80.78.244.84
cd /var/www/shkola-pk
git log --oneline -10          # найти нужный commit
git reset --hard <commit_hash>
cd payload-cms && npm run build
cd ../app-payload && npm run build
pm2 restart all
```

---

## Добавление нового блока

### Шаг 1: Payload Schema

```bash
# Создать schema файл
# payload-cms/src/blocks/MyNewBlock.ts
```

### Шаг 2: Frontend Component

```bash
# Создать frontend компонент
# app-payload/src/components/blocks/MyNewBlock.tsx
# ВАЖНО: имена полей (data.xxx) должны совпадать с schema!
```

### Шаг 3: Регистрация

```bash
# 1. Добавить import + блок в payload.config.ts (blocks array)
# 2. Добавить import + блок в Pages.ts (blocks array)
# 3. Добавить case в BlockRenderer.tsx
# 4. Добавить интерфейс в payload-types.ts
```

### Шаг 4: SQL Migration

```sql
-- Создать таблицу для нового блока
CREATE TABLE IF NOT EXISTS pages_blocks_my_new (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    -- поля блока...
);
ALTER TABLE pages_blocks_my_new ADD CONSTRAINT pages_blocks_my_new_pkey PRIMARY KEY (id);
-- + indexes + FK
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shkola_pk;
```

### Шаг 5: Проверка

```bash
# Локально:
bash scripts/check-block-sync.sh   # ← должен пройти
cd app-payload && npm run build    # ← должен пройти

# На проде:
bash scripts/migrate.sh            # ← таблицы создаются
bash deploy.sh                     # ← полный деплой
```

---

## Архитектура deploy pipeline

```
deploy.sh
├── 0. Сохранить PREV_COMMIT (для отката)
├── 1. Backup БД (3 БД → /var/backups/shkola-pk/)
├── 1.5. migrate.sh           ← Этап 1: таблицы до рестарта
├── 1.6. check-block-sync.sh  ← Этап 3: schema ↔ frontend
├── 2. git pull
├── 3. npm install (payload + frontend)
├── 4. payload generate:importmap
├── 5. Build Payload CMS
├── 6. Build Frontend
├── 7. PM2 restart
├── 8. smoke-test.sh          ← Этап 2: 10 проверок
│   ├── PASSED → pm2 save → ✓
│   └── FAILED → ROLLBACK
│       ├── git reset --hard PREV_COMMIT
│       ├── Rebuild
│       ├── PM2 restart
│       └── smoke-test.sh (повторно)
└── Telegram-уведомление
```

---

## Команды

| Команда | Назначение |
|---|---|
| `bash deploy.sh` | Полный деплой |
| `bash scripts/migrate.sh` | Проверка миграций |
| `bash scripts/check-block-sync.sh` | Проверка блоков |
| `bash scripts/smoke-test.sh` | Smoke test (10 проверок) |
| `bash scripts/rollback.sh` | Ручной откат |
| `bash scripts/backup.sh` | Бэкап БД |
| `bash scripts/health-check.sh` | Health check (cron 5 мин) |
| `pm2 list` | Статус процессов |
| `pm2 logs` | Логи |
| `pm2 restart all` | Рестарт |
