-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек тарификации (одна запись для всей системы)
CREATE TABLE IF NOT EXISTS pricing_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT FALSE,
    price INTEGER DEFAULT 99,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Вставляем начальную запись настроек
INSERT INTO pricing_settings (id, enabled, price) 
VALUES (1, FALSE, 99)
ON CONFLICT (id) DO NOTHING;

-- Таблица парсингов
CREATE TABLE IF NOT EXISTS parsings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    avito_url TEXT NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_address TEXT,
    ad_title TEXT,
    ad_description TEXT,
    price_paid INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_parsings_user_id ON parsings(user_id);
CREATE INDEX IF NOT EXISTS idx_parsings_created_at ON parsings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Тестовый пользователь
INSERT INTO users (username, email) 
VALUES ('test_user', 'test@example.com')
ON CONFLICT (email) DO NOTHING;
