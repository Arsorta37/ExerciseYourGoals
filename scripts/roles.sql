-- Usuario de la aplicación con permisos mínimos
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_eyg') THEN
        CREATE ROLE app_eyg LOGIN PASSWORD 'eyg_andreses';
    END IF;
END $$;

GRANT CONNECT ON DATABASE eyg TO app_eyg;
GRANT USAGE ON SCHEMA eyg TO app_eyg;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA eyg TO app_eyg;
ALTER DEFAULT PRIVILEGES IN SCHEMA eyg
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_eyg;