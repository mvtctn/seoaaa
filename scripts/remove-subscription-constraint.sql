-- Remove check constraint from user_subscriptions if it exists
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT con.conname INTO con_name
    FROM pg_catalog.pg_constraint con
    INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'user_subscriptions'
      AND con.contype = 'c'; -- check constraint

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE user_subscriptions DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

-- If transactions table has constraint, remove it too
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT con.conname INTO con_name
    FROM pg_catalog.pg_constraint con
    INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'transactions'
      AND con.contype = 'c';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE transactions DROP CONSTRAINT ' || con_name;
    END IF;
END $$;
