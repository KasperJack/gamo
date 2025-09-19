-- Authentication tables
CREATE TABLE auth_users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    emailVerified TIMESTAMPTZ,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE auth_accounts (
    id SERIAL PRIMARY KEY,
    userId INT REFERENCES auth_users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at TIMESTAMPTZ,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, providerAccountId)
);

CREATE TABLE auth_sessions (
    id SERIAL PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId INT REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE auth_verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Domain tables
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE spare_parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INT DEFAULT 0,
    equipment_id INT REFERENCES equipment(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE breakdowns (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    description TEXT,
    reported_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE maintenance_interventions (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(id) ON DELETE CASCADE,
    description TEXT,
    performed_at TIMESTAMPTZ DEFAULT now(),
    performed_by TEXT
);

