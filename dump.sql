CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TYPE theme_type AS ENUM ('dark', 'light');

ALTER TABLE users
ADD COLUMN theme theme_type NOT NULL DEFAULT 'light';


ALTER TABLE tasks
ADD COLUMN createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP;