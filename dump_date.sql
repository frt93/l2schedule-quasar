--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only
= off;

SET client_encoding
= 'UTF8';
SET standard_conforming_strings
= on;

--
-- Drop databases (except postgres and template1)
--





--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;






--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3 (Debian 11.3-1.pgdg90+1)
-- Dumped by pg_dump version 11.3 (Debian 11.3-1.pgdg90+1)

SET statement_timeout
= 0;
SET lock_timeout
= 0;
SET idle_in_transaction_session_timeout
= 0;
SET client_encoding
= 'UTF8';
SET standard_conforming_strings
= on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies
= false;
SET xmloption
= content;
SET client_min_messages
= warning;
SET row_security
= off;

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0
ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout
= 0;
SET lock_timeout
= 0;
SET idle_in_transaction_session_timeout
= 0;
SET client_encoding
= 'UTF8';
SET standard_conforming_strings
= on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies
= false;
SET xmloption
= content;
SET client_min_messages
= warning;
SET row_security
= off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: hdb_catalog; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA hdb_catalog;


ALTER SCHEMA hdb_catalog OWNER TO postgres;

--
-- Name: hdb_views; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA hdb_views;


ALTER SCHEMA hdb_views OWNER TO postgres;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION
IF NOT EXISTS pgcrypto
WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: hdb_schema_update_event_notifier(); Type: FUNCTION; Schema: hdb_catalog; Owner: postgres
--

CREATE FUNCTION hdb_catalog.hdb_schema_update_event_notifier() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    instance_id uuid;
    occurred_at timestamptz;
    curr_rec record;
BEGIN
    instance_id = NEW.instance_id;
    occurred_at = NEW.occurred_at;
    PERFORM pg_notify
('hasura_schema_update', json_build_object
(
      'instance_id', instance_id,
      'occurred_at', occurred_at
      )::text);
RETURN curr_rec;
END;
$$;


ALTER FUNCTION hdb_catalog.hdb_schema_update_event_notifier() OWNER TO postgres;

--
-- Name: hdb_table_oid_check(); Type: FUNCTION; Schema: hdb_catalog; Owner: postgres
--

CREATE FUNCTION hdb_catalog.hdb_table_oid_check() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (EXISTS (SELECT 1
    FROM information_schema.tables st
    WHERE st.table_schema = NEW.table_schema AND st.table_name = NEW.table_name)) THEN
    return NEW;
    ELSE
      RAISE foreign_key_violation using message = 'table_schema, table_name not in information_schema.tables';
    return NULL;
END
IF;
  END;
$$;


ALTER FUNCTION hdb_catalog.hdb_table_oid_check() OWNER TO postgres;

--
-- Name: inject_table_defaults(text, text, text, text); Type: FUNCTION; Schema: hdb_catalog; Owner: postgres
--

CREATE FUNCTION hdb_catalog.inject_table_defaults(view_schema text, view_name text, tab_schema text, tab_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
        r RECORD;
BEGIN
    FOR r IN
    SELECT column_name, column_default
    FROM information_schema.columns
    WHERE table_schema = tab_schema AND table_name = tab_name AND column_default IS NOT NULL
    LOOP
    EXECUTE format
    ('ALTER VIEW %I.%I ALTER COLUMN %I SET DEFAULT %s;', view_schema, view_name, r.column_name, r.column_default);
END LOOP;
END;
$$;


ALTER FUNCTION hdb_catalog.inject_table_defaults(view_schema text, view_name text, tab_schema text, tab_name text) OWNER TO postgres;

SET default_tablespace
= '';

SET default_with_oids
= false;

--
-- Name: event_invocation_logs; Type: TABLE; Schema: hdb_catalog; Owner: postgres
--

CREATE TABLE hdb_catalog.event_invocation_logs
(
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp
    without time zone DEFAULT now
    ()
);


    ALTER TABLE hdb_catalog.event_invocation_logs OWNER TO postgres;

    --
    -- Name: event_log; Type: TABLE; Schema: hdb_catalog; Owner: postgres
    --

    CREATE TABLE hdb_catalog.event_log
    (
        id text DEFAULT public.gen_random_uuid() NOT NULL,
        schema_name text NOT NULL,
        table_name text NOT NULL,
        trigger_name text NOT NULL,
        payload jsonb NOT NULL,
        delivered boolean DEFAULT false NOT NULL,
        error boolean DEFAULT false NOT NULL,
        tries integer DEFAULT 0 NOT NULL,
        created_at timestamp
        without time zone DEFAULT now
        (),
    locked boolean DEFAULT false NOT NULL,
    next_retry_at timestamp without time zone
);


        ALTER TABLE hdb_catalog.event_log OWNER TO postgres;

        --
        -- Name: event_triggers; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.event_triggers
        (
            name text NOT NULL,
            type text NOT NULL,
            schema_name text NOT NULL,
            table_name text NOT NULL,
            configuration json,
            comment text
        );


        ALTER TABLE hdb_catalog.event_triggers OWNER TO postgres;

        --
        -- Name: hdb_check_constraint; Type: VIEW; Schema: hdb_catalog; Owner: postgres
        --

        CREATE VIEW hdb_catalog.hdb_check_constraint
        AS
            SELECT (n.nspname)
        ::text AS table_schema,
        (ct.relname)::text AS table_name,
        (r.conname)::text AS constraint_name,
    pg_get_constraintdef
        (r.oid, true) AS "check"
   FROM
        ((pg_constraint r
     JOIN pg_class ct ON
        ((r.conrelid = ct.oid)))
     JOIN pg_namespace n ON
        ((ct.relnamespace = n.oid)))
  WHERE
        (r.contype = 'c'::"char");


        ALTER TABLE hdb_catalog.hdb_check_constraint OWNER TO postgres;

        --
        -- Name: hdb_foreign_key_constraint; Type: VIEW; Schema: hdb_catalog; Owner: postgres
        --

        CREATE VIEW hdb_catalog.hdb_foreign_key_constraint
        AS
            SELECT (q.table_schema)
        ::text AS table_schema,
        (q.table_name)::text AS table_name,
        (q.constraint_name)::text AS constraint_name,
        (min
        (q.constraint_oid))::integer AS constraint_oid,
    min
        ((q.ref_table_table_schema)::text) AS ref_table_table_schema,
    min
        ((q.ref_table)::text) AS ref_table,
    json_object_agg
        (ac.attname, afc.attname) AS column_mapping,
    min
        ((q.confupdtype)::text) AS on_update,
    min
        ((q.confdeltype)::text) AS on_delete
   FROM
        ((( SELECT ctn.nspname AS table_schema,
            ct.relname AS table_name,
            r.conrelid AS table_id,
            r.conname AS constraint_name,
            r.oid AS constraint_oid,
            cftn.nspname AS ref_table_table_schema,
            cft.relname AS ref_table,
            r.confrelid AS ref_table_id,
            r.confupdtype,
            r.confdeltype,
            unnest(r.conkey) AS column_id,
            unnest(r.confkey) AS ref_column_id
        FROM ((((pg_constraint r
            JOIN pg_class ct ON ((r.conrelid = ct.oid)))
            JOIN pg_namespace ctn ON ((ct.relnamespace = ctn.oid)))
            JOIN pg_class cft ON ((r.confrelid = cft.oid)))
            JOIN pg_namespace cftn ON ((cft.relnamespace = cftn.oid)))
        WHERE (r.contype = 'f'
        ::"char")) q
     JOIN pg_attribute ac ON
        (((q.column_id = ac.attnum) AND
        (q.table_id = ac.attrelid))))
     JOIN pg_attribute afc ON
        (((q.ref_column_id = afc.attnum) AND
        (q.ref_table_id = afc.attrelid))))
  GROUP BY q.table_schema, q.table_name, q.constraint_name;


        ALTER TABLE hdb_catalog.hdb_foreign_key_constraint OWNER TO postgres;

        --
        -- Name: hdb_function; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.hdb_function
        (
            function_schema text NOT NULL,
            function_name text NOT NULL,
            is_system_defined boolean DEFAULT false
        );


        ALTER TABLE hdb_catalog.hdb_function OWNER TO postgres;

        --
        -- Name: hdb_function_agg; Type: VIEW; Schema: hdb_catalog; Owner: postgres
        --

        CREATE VIEW hdb_catalog.hdb_function_agg
        AS
            SELECT (p.proname)
        ::text AS function_name,
        (pn.nspname)::text AS function_schema,
        CASE
            WHEN
        (p.provariadic =
        (0)::oid) THEN false
            ELSE true
        END AS has_variadic,
        CASE
            WHEN
        ((p.provolatile)::text =
        ('i'::character
        (1))::text) THEN 'IMMUTABLE'::text
            WHEN
        ((p.provolatile)::text =
        ('s'::character
        (1))::text) THEN 'STABLE'::text
            WHEN
        ((p.provolatile)::text =
        ('v'::character
        (1))::text) THEN 'VOLATILE'::text
            ELSE NULL::text
        END AS function_type,
    pg_get_functiondef
        (p.oid) AS function_definition,
        (rtn.nspname)::text AS return_type_schema,
        (rt.typname)::text AS return_type_name,
        CASE
            WHEN
        ((rt.typtype)::text =
        ('b'::character
        (1))::text) THEN 'BASE'::text
            WHEN
        ((rt.typtype)::text =
        ('c'::character
        (1))::text) THEN 'COMPOSITE'::text
            WHEN
        ((rt.typtype)::text =
        ('d'::character
        (1))::text) THEN 'DOMAIN'::text
            WHEN
        ((rt.typtype)::text =
        ('e'::character
        (1))::text) THEN 'ENUM'::text
            WHEN
        ((rt.typtype)::text =
        ('r'::character
        (1))::text) THEN 'RANGE'::text
            WHEN
        ((rt.typtype)::text =
        ('p'::character
        (1))::text) THEN 'PSUEDO'::text
            ELSE NULL::text
        END AS return_type_type,
    p.proretset AS returns_set,
        ( SELECT COALESCE(json_agg(q.type_name), '[]'
        ::json) AS "coalesce"
           FROM
        ( SELECT pt.typname AS type_name,
            pat.ordinality
        FROM (unnest(COALESCE(p.proallargtypes, (p.proargtypes)::oid[])) WITH ORDINALITY pat(oid, ordinality)
            LEFT JOIN pg_type pt ON ((pt.oid = pat.oid)))
        ORDER BY pat.ordinality
        ) q) AS input_arg_types,
    to_json
        (COALESCE
        (p.proargnames, ARRAY[]::text[])) AS input_arg_names
   FROM
        (((pg_proc p
     JOIN pg_namespace pn ON
        ((pn.oid = p.pronamespace)))
     JOIN pg_type rt ON
        ((rt.oid = p.prorettype)))
     JOIN pg_namespace rtn ON
        ((rtn.oid = rt.typnamespace)))
  WHERE
        (((pn.nspname)::text !~~ 'pg_%'::text) AND
        ((pn.nspname)::text <> ALL
        (ARRAY['information_schema'::text, 'hdb_catalog'::text, 'hdb_views'::text])) AND
        (NOT
        (EXISTS
        ( SELECT 1
        FROM pg_aggregate
        WHERE ((pg_aggregate.aggfnoid)
        ::oid = p.oid)))));


        ALTER TABLE hdb_catalog.hdb_function_agg OWNER TO postgres;

        --
        -- Name: hdb_permission; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.hdb_permission
        (
            table_schema text NOT NULL,
            table_name text NOT NULL,
            role_name text NOT NULL,
            perm_type text NOT NULL,
            perm_def jsonb NOT NULL,
            comment text,
            is_system_defined boolean DEFAULT false,
            CONSTRAINT hdb_permission_perm_type_check CHECK ((perm_type = ANY (ARRAY['insert'::text, 'select'::text, 'update'::text, 'delete'::text]))
        )
        );


        ALTER TABLE hdb_catalog.hdb_permission OWNER TO postgres;

        --
        -- Name: hdb_permission_agg; Type: VIEW; Schema: hdb_catalog; Owner: postgres
        --

        CREATE VIEW hdb_catalog.hdb_permission_agg
        AS
            SELECT hdb_permission.table_schema,
                hdb_permission.table_name,
                hdb_permission.role_name,
                json_object_agg(hdb_permission.perm_type, hdb_permission.perm_def) AS permissions
            FROM hdb_catalog.hdb_permission
            GROUP BY hdb_permission.table_schema, hdb_permission.table_name, hdb_permission.role_name;


        ALTER TABLE hdb_catalog.hdb_permission_agg OWNER TO postgres;

        --
        -- Name: hdb_primary_key; Type: VIEW; Schema: hdb_catalog; Owner: postgres
        --

        CREATE VIEW hdb_catalog.hdb_primary_key
        AS
            SELECT tc.table_schema,
                tc.table_name,
                tc.constraint_name,
                json_agg(constraint_column_usage.column_name) AS columns
            FROM (information_schema.table_constraints tc
                JOIN (                                         SELECT x.tblschema AS table_schema,
                        x.tblname AS table_name,
                        x.colname AS column_name,
                        x.cstrname AS constraint_name
                    FROM ( SELECT DISTINCT nr.nspname,
                            r.relname,
                            a.attname,
                            c.conname
                        FROM pg_namespace nr,
                            pg_class r,
                            pg_attribute a,
                            pg_depend d,
                            pg_namespace nc,
                            pg_constraint c
                        WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (d.refclassid = ('pg_class'::regclass)::oid) AND (d.refobjid = r.oid) AND (d.refobjsubid = a.attnum) AND (d.classid = ('pg_constraint'::regclass)::oid) AND (d.objid = c.oid) AND (c.connamespace = nc.oid) AND (c.contype = 'c'::"char") AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"])) AND (NOT a.attisdropped))
                UNION ALL
                    SELECT nr.nspname,
                        r.relname,
                        a.attname,
                        c.conname
                    FROM pg_namespace nr,
                        pg_class r,
                        pg_attribute a,
                        pg_namespace nc,
                        pg_constraint c
                    WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (nc.oid = c.connamespace) AND (r.oid =
                        CASE c.contype
                            WHEN 'f'::"char" THEN c.confrelid
                            ELSE c.conrelid
                        END) AND (a.attnum = ANY (
                        CASE c  .contype
        WHEN 'f'::"char" THEN c.confkey
                            ELSE c.conkey
        END)) AND
        (NOT a.attisdropped) AND
        (c.contype = ANY
        (ARRAY['p'::"char", 'u'::"char", 'f'::"char"])) AND
        (r.relkind = ANY
        (ARRAY['r'::"char", 'p'::"char"])))) x
        (tblschema, tblname, colname, cstrname)) constraint_column_usage ON
        ((((tc.constraint_name)::text =
        (constraint_column_usage.constraint_name)::text) AND
        ((tc.table_schema)::text =
        (constraint_column_usage.table_schema)::text) AND
        ((tc.table_name)::text =
        (constraint_column_usage.table_name)::text))))
  WHERE
        ((tc.constraint_type)::text = 'PRIMARY KEY'::text)
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name;


        ALTER TABLE hdb_catalog.hdb_primary_key OWNER TO postgres;

        --
        -- Name: hdb_query_template; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.hdb_query_template
        (
            template_name text NOT NULL,
            template_defn jsonb NOT NULL,
            comment text,
            is_system_defined boolean DEFAULT false
        );


        ALTER TABLE hdb_catalog.hdb_query_template OWNER TO postgres;

        --
        -- Name: hdb_relationship; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.hdb_relationship
        (
            table_schema text NOT NULL,
            table_name text NOT NULL,
            rel_name text NOT NULL,
            rel_type text,
            rel_def jsonb NOT NULL,
            comment text,
            is_system_defined boolean DEFAULT false,
            CONSTRAINT hdb_relationship_rel_type_check CHECK ((rel_type = ANY (ARRAY['object'::text, 'array'::text]))
        )
        );


        ALTER TABLE hdb_catalog.hdb_relationship OWNER TO postgres;

        --
        -- Name: hdb_schema_update_event; Type: TABLE; Schema: hdb_catalog; Owner: postgres
        --

        CREATE TABLE hdb_catalog.hdb_schema_update_event
        (
            id bigint NOT NULL,
            instance_id uuid NOT NULL,
            occurred_at timestamp
            with time zone DEFAULT now
            () NOT NULL
);


            ALTER TABLE hdb_catalog.hdb_schema_update_event OWNER TO postgres;

            --
            -- Name: hdb_schema_update_event_id_seq; Type: SEQUENCE; Schema: hdb_catalog; Owner: postgres
            --

            CREATE SEQUENCE hdb_catalog.hdb_schema_update_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


            ALTER TABLE hdb_catalog.hdb_schema_update_event_id_seq OWNER TO postgres;

            --
            -- Name: hdb_schema_update_event_id_seq; Type: SEQUENCE OWNED BY; Schema: hdb_catalog; Owner: postgres
            --

            ALTER SEQUENCE hdb_catalog.hdb_schema_update_event_id_seq
            OWNED BY hdb_catalog.hdb_schema_update_event.id;


            --
            -- Name: hdb_table; Type: TABLE; Schema: hdb_catalog; Owner: postgres
            --

            CREATE TABLE hdb_catalog.hdb_table
            (
                table_schema text NOT NULL,
                table_name text NOT NULL,
                is_system_defined boolean DEFAULT false
            );


            ALTER TABLE hdb_catalog.hdb_table OWNER TO postgres;

            --
            -- Name: hdb_unique_constraint; Type: VIEW; Schema: hdb_catalog; Owner: postgres
            --

            CREATE VIEW hdb_catalog.hdb_unique_constraint
            AS
                SELECT tc.table_name,
                    tc.constraint_schema AS table_schema,
                    tc.constraint_name,
                    json_agg(kcu.column_name) AS columns
                FROM (information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu   USING (constraint_schema, constraint_name))
                WHERE ((tc.constraint_type)
            ::text = 'UNIQUE'::text)
  GROUP BY tc.table_name, tc.constraint_schema, tc.constraint_name;


            ALTER TABLE hdb_catalog.hdb_unique_constraint OWNER TO postgres;

            --
            -- Name: hdb_version; Type: TABLE; Schema: hdb_catalog; Owner: postgres
            --

            CREATE TABLE hdb_catalog.hdb_version
            (
                hasura_uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
                version text NOT NULL,
                upgraded_on timestamp
                with time zone NOT NULL,
    cli_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    console_state jsonb DEFAULT '{}'::jsonb NOT NULL
);


                ALTER TABLE hdb_catalog.hdb_version OWNER TO postgres;

                --
                -- Name: remote_schemas; Type: TABLE; Schema: hdb_catalog; Owner: postgres
                --

                CREATE TABLE hdb_catalog.remote_schemas
                (
                    id bigint NOT NULL,
                    name text,
                    definition json,
                    comment text
                );


                ALTER TABLE hdb_catalog.remote_schemas OWNER TO postgres;

                --
                -- Name: remote_schemas_id_seq; Type: SEQUENCE; Schema: hdb_catalog; Owner: postgres
                --

                CREATE SEQUENCE hdb_catalog.remote_schemas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


                ALTER TABLE hdb_catalog.remote_schemas_id_seq OWNER TO postgres;

                --
                -- Name: remote_schemas_id_seq; Type: SEQUENCE OWNED BY; Schema: hdb_catalog; Owner: postgres
                --

                ALTER SEQUENCE hdb_catalog.remote_schemas_id_seq
                OWNED BY hdb_catalog.remote_schemas.id;


                --
                -- Name: articles; Type: TABLE; Schema: public; Owner: postgres
                --

                CREATE TABLE public.articles
                (
                    id integer NOT NULL,
                    title text NOT NULL,
                    content text NOT NULL
                );


                ALTER TABLE public.articles OWNER TO postgres;

                --
                -- Name: articles_2; Type: TABLE; Schema: public; Owner: postgres
                --

                CREATE TABLE public.articles_2
                (
                    id integer,
                    title text,
                    content text
                );


                ALTER TABLE public.articles_2 OWNER TO postgres;

                --
                -- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
                --

                CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


                ALTER TABLE public.articles_id_seq OWNER TO postgres;

                --
                -- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
                --

                ALTER SEQUENCE public.articles_id_seq
                OWNED BY public.articles.id;


                --
                -- Name: newtables; Type: TABLE; Schema: public; Owner: postgres
                --

                CREATE TABLE public.newtables
                (
                    id integer NOT NULL,
                    username character varying(255) NOT NULL,
                    email character varying(255) NOT NULL,
                    "emailVerify" character varying(255),
                    password character varying(255) NOT NULL,
                    "createdAt" timestamp
                    with time zone NOT NULL,
    "updatedAt" timestamp
                    with time zone NOT NULL
);


                    ALTER TABLE public.newtables OWNER TO postgres;

                    --
                    -- Name: newtables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
                    --

                    CREATE SEQUENCE public.newtables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


                    ALTER TABLE public.newtables_id_seq OWNER TO postgres;

                    --
                    -- Name: newtables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
                    --

                    ALTER SEQUENCE public.newtables_id_seq
                    OWNED BY public.newtables.id;


                    --
                    -- Name: wedabest_raidbosses; Type: TABLE; Schema: public; Owner: postgres
                    --

                    CREATE TABLE public.wedabest_raidbosses
                    (
                        id integer NOT NULL,
                        username character varying(255) NOT NULL,
                        email character varying(255) NOT NULL,
                        "emailVerify" character varying(255),
                        password character varying(255) NOT NULL,
                        "createdAt" timestamp
                        with time zone NOT NULL,
    "updatedAt" timestamp
                        with time zone NOT NULL
);


                        ALTER TABLE public.wedabest_raidbosses OWNER TO postgres;

                        --
                        -- Name: wedabest_raidbosses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
                        --

                        CREATE SEQUENCE public.wedabest_raidbosses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


                        ALTER TABLE public.wedabest_raidbosses_id_seq OWNER TO postgres;

                        --
                        -- Name: wedabest_raidbosses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
                        --

                        ALTER SEQUENCE public.wedabest_raidbosses_id_seq
                        OWNED BY public.wedabest_raidbosses.id;


                        --
                        -- Name: hdb_schema_update_event id; Type: DEFAULT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_schema_update_event
                        ALTER COLUMN id
                        SET
                        DEFAULT nextval
                        ('hdb_catalog.hdb_schema_update_event_id_seq'::regclass);


                        --
                        -- Name: remote_schemas id; Type: DEFAULT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.remote_schemas
                        ALTER COLUMN id
                        SET
                        DEFAULT nextval
                        ('hdb_catalog.remote_schemas_id_seq'::regclass);


                        --
                        -- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.articles
                        ALTER COLUMN id
                        SET
                        DEFAULT nextval
                        ('public.articles_id_seq'::regclass);


                        --
                        -- Name: newtables id; Type: DEFAULT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.newtables
                        ALTER COLUMN id
                        SET
                        DEFAULT nextval
                        ('public.newtables_id_seq'::regclass);


                        --
                        -- Name: wedabest_raidbosses id; Type: DEFAULT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.wedabest_raidbosses
                        ALTER COLUMN id
                        SET
                        DEFAULT nextval
                        ('public.wedabest_raidbosses_id_seq'::regclass);


--
-- Data for Name: event_invocation_logs; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.event_invocation_logs
                        (id, event_id, status, request, response, created_at) FROM stdin;
\.


--
-- Data for Name: event_log; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.event_log
                        (id, schema_name, table_name, trigger_name, payload, delivered, error, tries, created_at, locked, next_retry_at) FROM stdin;
\.


--
-- Data for Name: event_triggers; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.event_triggers
                        (name, type, schema_name, table_name, configuration, comment) FROM stdin;
\.


--
-- Data for Name: hdb_function; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_function
                        (function_schema, function_name, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_permission; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_permission
                        (table_schema, table_name, role_name, perm_type, perm_def, comment, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_query_template; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_query_template
                        (template_name, template_defn, comment, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_relationship; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_relationship
                        (table_schema, table_name, rel_name, rel_type, rel_def, comment, is_system_defined) FROM stdin;
hdb_catalog	hdb_table	detail	object	{"manual_configuration": {"remote_table": {"name": "tables", "schema": "information_schema"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	primary_key	object	{"manual_configuration": {"remote_table": {"name": "hdb_primary_key", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	columns	array	{"manual_configuration": {"remote_table": {"name": "columns", "schema": "information_schema"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	foreign_key_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_foreign_key_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	relationships	array	{"manual_configuration": {"remote_table": {"name": "hdb_relationship", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	permissions	array	{"manual_configuration": {"remote_table": {"name": "hdb_permission_agg", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	check_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_check_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	unique_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_unique_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	event_log	trigger	object	{"manual_configuration": {"remote_table": {"name": "event_triggers", "schema": "hdb_catalog"}, "column_mapping": {"trigger_name": "name"}}}	\N	t
hdb_catalog	event_triggers	events	array	{"manual_configuration": {"remote_table": {"name": "event_log", "schema": "hdb_catalog"}, "column_mapping": {"name": "trigger_name"}}}	\N	t
hdb_catalog	event_invocation_logs	event	object	{"foreign_key_constraint_on": "event_id"}	\N	t
hdb_catalog	event_log	logs	array	{"foreign_key_constraint_on": {"table": {"name": "event_invocation_logs", "schema": "hdb_catalog"}, "column": "event_id"}}	\N	t
hdb_catalog	hdb_function_agg	return_table_info	object	{"manual_configuration": {"remote_table": {"name": "hdb_table", "schema": "hdb_catalog"}, "column_mapping": {"return_type_name": "table_name", "return_type_schema": "table_schema"}}}	\N	t
\.


--
-- Data for Name: hdb_schema_update_event; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_schema_update_event
                        (id, instance_id, occurred_at) FROM stdin;
1	1d3a9d09-3192-44ed-a031-6c367670dfa4	2019-05-12 11:21:44.639056+00
2	1d3a9d09-3192-44ed-a031-6c367670dfa4	2019-05-12 11:47:56.565204+00
3	1d3a9d09-3192-44ed-a031-6c367670dfa4	2019-05-12 11:48:49.384292+00
4	1d3a9d09-3192-44ed-a031-6c367670dfa4	2019-05-12 11:48:49.636694+00
5	1d3a9d09-3192-44ed-a031-6c367670dfa4	2019-05-12 11:54:39.440319+00
6	d766c163-93df-4347-bf50-1fa8fdbdbbce	2019-05-12 12:50:07.20536+00
7	682a9662-d270-4edc-a89a-2768a991ffca	2019-05-13 09:16:33.051194+00
8	682a9662-d270-4edc-a89a-2768a991ffca	2019-05-13 09:16:33.27037+00
9	682a9662-d270-4edc-a89a-2768a991ffca	2019-05-13 09:29:49.430356+00
10	682a9662-d270-4edc-a89a-2768a991ffca	2019-05-13 09:41:25.523257+00
11	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 10:13:23.959686+00
12	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 10:20:05.897323+00
13	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 10:20:12.443435+00
14	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 10:31:56.584704+00
15	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 10:31:56.843676+00
16	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 12:27:27.994533+00
17	291c7d7d-6628-41de-be23-cfa629466192	2019-05-13 12:53:36.98391+00
18	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:33:16.418312+00
19	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:33:41.200073+00
20	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:03.291129+00
21	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:03.489703+00
22	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:26.712104+00
23	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:30.097008+00
24	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:35.762226+00
25	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 07:35:44.780273+00
60	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:44:57.998746+00
61	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:44:58.195229+00
62	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:44:58.418053+00
63	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:45:39.938198+00
64	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:45:43.791962+00
65	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:45:55.999856+00
66	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:45:59.054723+00
67	897d0191-234e-4d3c-88ab-92cb0cd7f602	2019-05-14 09:47:18.671465+00
26	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 09:25:07.663547+00
27	c13eea3f-b7ce-4dbd-a0b9-5470c3a3479e	2019-05-14 09:25:11.717357+00
28	202a1b22-5e60-4130-a8ba-ab90d16cda1d	2019-05-14 12:10:31.04595+00
\.


--
-- Data for Name: hdb_table; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_table
                        (table_schema, table_name, is_system_defined) FROM stdin;
hdb_catalog	hdb_table	t
information_schema	tables	t
information_schema	schemata	t
information_schema	views	t
hdb_catalog	hdb_primary_key	t
information_schema	columns	t
hdb_catalog	hdb_foreign_key_constraint	t
hdb_catalog	hdb_relationship	t
hdb_catalog	hdb_permission_agg	t
hdb_catalog	hdb_check_constraint	t
hdb_catalog	hdb_unique_constraint	t
hdb_catalog	hdb_query_template	t
hdb_catalog	event_triggers	t
hdb_catalog	event_log	t
hdb_catalog	event_invocation_logs	t
hdb_catalog	hdb_function_agg	t
hdb_catalog	hdb_function	t
hdb_catalog	remote_schemas	t
hdb_catalog	hdb_version	t
public	articles	f
public	articles_2	f
public	newtables	f
public	wedabest_raidbosses	f
\.


--
-- Data for Name: hdb_version; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.hdb_version
                        (hasura_uuid, version, upgraded_on, cli_state, console_state) FROM stdin;
4abf7db0-9a1d-4bfe-8c81-f16d860623df	13	2019-05-12 11:21:07.667456+00	{}	{"telemetryNotificationShown": true}
\.


--
-- Data for Name: remote_schemas; Type: TABLE DATA; Schema: hdb_catalog; Owner: postgres
--

COPY hdb_catalog.remote_schemas
                        (id, name, definition, comment) FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles
                        (id, title, content) FROM stdin;
1	Jane	ghdfjghdfjgkdfj
3	Ja3ne	ghdfjghdfjgkdf3j
4	Ja3ne	ghdfjghdfjgkdf3j
5	Ja3ne	ghdfjghdfjgkdf3j
6	Ja3ne	ghdfjghdfjgkdf3j
7	Ja3ne	ghdfjghdfjgkdf3j
8	Ja3ne	ghdfjghdfjgkdf3j
9	Ja3ne	ghdfjghdfjgkdf3j
10	Ja3n5e	ghdfjghdfjgkdf3j8888888
11	Ja3ne4	ghdfjghdfjgkdf3j8888888
12	Ja3ne65	ghdfjghdfjgkdf3j8888888
13	Ja3n45e	ghdfjghdfjgkdf3j8888888
\.


--
-- Data for Name: articles_2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles_2
                        (id, title, content) FROM stdin;
\.


--
-- Data for Name: newtables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newtables
                        (id, username, email, "emailVerify", password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: wedabest_raidbosses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wedabest_raidbosses
                        (id, username, email, "emailVerify", password, "createdAt", "updatedAt") FROM stdin;
\.


                        --
                        -- Name: hdb_schema_update_event_id_seq; Type: SEQUENCE SET; Schema: hdb_catalog; Owner: postgres
                        --

                        SELECT pg_catalog.setval('hdb_catalog.hdb_schema_update_event_id_seq', 28, true);


                        --
                        -- Name: remote_schemas_id_seq; Type: SEQUENCE SET; Schema: hdb_catalog; Owner: postgres
                        --

                        SELECT pg_catalog.setval('hdb_catalog.remote_schemas_id_seq', 1, true);


                        --
                        -- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
                        --

                        SELECT pg_catalog.setval('public.articles_id_seq', 11, true);


                        --
                        -- Name: newtables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
                        --

                        SELECT pg_catalog.setval('public.newtables_id_seq', 1, false);


                        --
                        -- Name: wedabest_raidbosses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
                        --

                        SELECT pg_catalog.setval('public.wedabest_raidbosses_id_seq', 1, false);


                        --
                        -- Name: event_invocation_logs event_invocation_logs_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.event_invocation_logs
                        ADD CONSTRAINT event_invocation_logs_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: event_log event_log_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.event_log
                        ADD CONSTRAINT event_log_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: event_triggers event_triggers_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.event_triggers
                        ADD CONSTRAINT event_triggers_pkey PRIMARY KEY
                        (name);


                        --
                        -- Name: hdb_function hdb_function_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_function
                        ADD CONSTRAINT hdb_function_pkey PRIMARY KEY
                        (function_schema, function_name);


                        --
                        -- Name: hdb_permission hdb_permission_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_permission
                        ADD CONSTRAINT hdb_permission_pkey PRIMARY KEY
                        (table_schema, table_name, role_name, perm_type);


                        --
                        -- Name: hdb_query_template hdb_query_template_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_query_template
                        ADD CONSTRAINT hdb_query_template_pkey PRIMARY KEY
                        (template_name);


                        --
                        -- Name: hdb_relationship hdb_relationship_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_relationship
                        ADD CONSTRAINT hdb_relationship_pkey PRIMARY KEY
                        (table_schema, table_name, rel_name);


                        --
                        -- Name: hdb_schema_update_event hdb_schema_update_event_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_schema_update_event
                        ADD CONSTRAINT hdb_schema_update_event_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: hdb_table hdb_table_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_table
                        ADD CONSTRAINT hdb_table_pkey PRIMARY KEY
                        (table_schema, table_name);


                        --
                        -- Name: hdb_version hdb_version_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_version
                        ADD CONSTRAINT hdb_version_pkey PRIMARY KEY
                        (hasura_uuid);


                        --
                        -- Name: remote_schemas remote_schemas_name_key; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.remote_schemas
                        ADD CONSTRAINT remote_schemas_name_key UNIQUE
                        (name);


                        --
                        -- Name: remote_schemas remote_schemas_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.remote_schemas
                        ADD CONSTRAINT remote_schemas_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.articles
                        ADD CONSTRAINT articles_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: newtables newtables_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.newtables
                        ADD CONSTRAINT newtables_email_key UNIQUE
                        (email);


                        --
                        -- Name: newtables newtables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.newtables
                        ADD CONSTRAINT newtables_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: newtables newtables_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.newtables
                        ADD CONSTRAINT newtables_username_key UNIQUE
                        (username);


                        --
                        -- Name: wedabest_raidbosses wedabest_raidbosses_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.wedabest_raidbosses
                        ADD CONSTRAINT wedabest_raidbosses_email_key UNIQUE
                        (email);


                        --
                        -- Name: wedabest_raidbosses wedabest_raidbosses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.wedabest_raidbosses
                        ADD CONSTRAINT wedabest_raidbosses_pkey PRIMARY KEY
                        (id);


                        --
                        -- Name: wedabest_raidbosses wedabest_raidbosses_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
                        --

                        ALTER TABLE ONLY public.wedabest_raidbosses
                        ADD CONSTRAINT wedabest_raidbosses_username_key UNIQUE
                        (username);


                        --
                        -- Name: event_invocation_logs_event_id_idx; Type: INDEX; Schema: hdb_catalog; Owner: postgres
                        --

                        CREATE INDEX event_invocation_logs_event_id_idx ON hdb_catalog.event_invocation_logs USING btree
                        (event_id);


                        --
                        -- Name: event_log_trigger_name_idx; Type: INDEX; Schema: hdb_catalog; Owner: postgres
                        --

                        CREATE INDEX event_log_trigger_name_idx ON hdb_catalog.event_log USING btree
                        (trigger_name);


                        --
                        -- Name: hdb_version_one_row; Type: INDEX; Schema: hdb_catalog; Owner: postgres
                        --

                        CREATE UNIQUE INDEX hdb_version_one_row ON hdb_catalog.hdb_version USING btree
                        (((version IS NOT NULL)));


                        --
                        -- Name: hdb_schema_update_event hdb_schema_update_event_notifier; Type: TRIGGER; Schema: hdb_catalog; Owner: postgres
                        --

                        CREATE TRIGGER hdb_schema_update_event_notifier AFTER
                        INSERT ON
                        hdb_catalog.hdb_schema_update_event
                        FOR EACH ROW
                        EXECUTE PROCEDURE hdb_catalog
                        .hdb_schema_update_event_notifier
                        ();


                        --
                        -- Name: hdb_table hdb_table_oid_check; Type: TRIGGER; Schema: hdb_catalog; Owner: postgres
                        --

                        CREATE TRIGGER hdb_table_oid_check BEFORE
                        INSERT OR
                        UPDATE ON hdb_catalog.hdb_table FOR EACH ROW
                        EXECUTE PROCEDURE hdb_catalog
                        .hdb_table_oid_check
                        ();


                        --
                        -- Name: event_invocation_logs event_invocation_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.event_invocation_logs
                        ADD CONSTRAINT event_invocation_logs_event_id_fkey FOREIGN KEY
                        (event_id) REFERENCES hdb_catalog.event_log
                        (id);


                        --
                        -- Name: event_triggers event_triggers_schema_name_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.event_triggers
                        ADD CONSTRAINT event_triggers_schema_name_fkey FOREIGN KEY
                        (schema_name, table_name) REFERENCES hdb_catalog.hdb_table
                        (table_schema, table_name) ON
                        UPDATE CASCADE;


                        --
                        -- Name: hdb_permission hdb_permission_table_schema_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_permission
                        ADD CONSTRAINT hdb_permission_table_schema_fkey FOREIGN KEY
                        (table_schema, table_name) REFERENCES hdb_catalog.hdb_table
                        (table_schema, table_name) ON
                        UPDATE CASCADE;


                        --
                        -- Name: hdb_relationship hdb_relationship_table_schema_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: postgres
                        --

                        ALTER TABLE ONLY hdb_catalog.hdb_relationship
                        ADD CONSTRAINT hdb_relationship_table_schema_fkey FOREIGN KEY
                        (table_schema, table_name) REFERENCES hdb_catalog.hdb_table
                        (table_schema, table_name) ON
                        UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

