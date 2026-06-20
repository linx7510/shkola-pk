// Migration: initial_schema
// Создано: 20 июня 2026
// Фиксирует текущую схему БД shkola_pk_payload (63 таблицы, 20 блоков)
//
// Эта миграция — snapshot текущего состояния БД на проде.
// При запуске на новой БД — создаст все таблицы.
// На проде — помечена как выполненная (schema already exists).

export async function up({ db }) {
  // Проверяем: если таблицы уже существуют — пропускаем
  const result = await db.execute(`
    SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public'
  `)
  const tableCount = parseInt(result.rows[0].count)
  
  if (tableCount > 10) {
    console.log(`[migration] БД уже содержит ${tableCount} таблиц — пропускаем initial schema`)
    return
  }
  
  console.log('[migration] Создаём начальную схему БД...')
  
  // Полный SQL dump текущей схемы
  const schemaSQL = `--
-- PostgreSQL database dump
--

\restrict o575RG6ImztzFdlIiv8hcgn1jQHTkdeIOECHWqPPKXm7VweT4smtts8fOcuKoB4

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: enum_categories_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_categories_type AS ENUM (
    'blog',
    'services',
    'faq',
    'glossary',
    'courses'
);


--
-- Name: enum_leads_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leads_source AS ENUM (
    'homepage',
    'consultation',
    'free-lesson',
    'contact',
    'registration'
);


--
-- Name: enum_leads_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_leads_status AS ENUM (
    'new',
    'processing',
    'contacted',
    'qualified',
    'converted',
    'closed'
);


--
-- Name: enum_orders_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_method AS ENUM (
    'yookassa',
    'bank',
    'cash'
);


--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'paid',
    'cancelled',
    'refunded'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'editor',
    'manager',
    'teacher',
    'student',
    'viewer'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    excerpt character varying,
    content jsonb NOT NULL,
    cover_image_id integer,
    category_id integer,
    tags character varying,
    author_id integer,
    is_published boolean DEFAULT false,
    published_at timestamp(3) with time zone,
    meta_title character varying,
    meta_description character varying,
    meta_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    type public.enum_categories_type DEFAULT 'blog'::public.enum_categories_type NOT NULL,
    description character varying,
    parent_id integer,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    description character varying NOT NULL,
    short_desc character varying,
    icon character varying,
    image_id integer,
    price numeric,
    "order" numeric DEFAULT 0,
    is_published boolean DEFAULT false,
    meta_title character varying,
    meta_description character varying,
    meta_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    progress numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: faq_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faq_items (
    id integer NOT NULL,
    question character varying NOT NULL,
    answer jsonb NOT NULL,
    category_id integer,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: faq_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faq_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faq_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faq_items_id_seq OWNED BY public.faq_items.id;


--
-- Name: glossary_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.glossary_terms (
    id integer NOT NULL,
    term character varying NOT NULL,
    slug character varying NOT NULL,
    definition character varying NOT NULL,
    extended_content jsonb,
    category_id integer,
    "order" numeric DEFAULT 0,
    is_published boolean DEFAULT true,
    meta_title character varying,
    meta_description character varying,
    meta_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: glossary_terms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.glossary_terms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: glossary_terms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.glossary_terms_id_seq OWNED BY public.glossary_terms.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    name character varying NOT NULL,
    phone character varying,
    email character varying,
    message character varying,
    source public.enum_leads_source,
    course_slug character varying,
    status public.enum_leads_status DEFAULT 'new'::public.enum_leads_status,
    notes character varying,
    assigned_to_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    consent_accepted boolean DEFAULT false,
    consent_at timestamp(3) with time zone,
    ip_address text,
    user_agent text
);


--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: lesson_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lesson_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lesson_progress_id_seq OWNED BY public.lesson_progress.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    title character varying NOT NULL,
    content jsonb,
    video_url character varying,
    duration numeric DEFAULT 0,
    module_id integer NOT NULL,
    "order" numeric DEFAULT 0,
    is_free boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying,
    caption character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric,
    sizes_thumbnail_url character varying,
    sizes_thumbnail_width numeric,
    sizes_thumbnail_height numeric,
    sizes_thumbnail_mime_type character varying,
    sizes_thumbnail_filesize numeric,
    sizes_thumbnail_filename character varying,
    sizes_small_url character varying,
    sizes_small_width numeric,
    sizes_small_height numeric,
    sizes_small_mime_type character varying,
    sizes_small_filesize numeric,
    sizes_small_filename character varying,
    sizes_medium_url character varying,
    sizes_medium_width numeric,
    sizes_medium_height numeric,
    sizes_medium_mime_type character varying,
    sizes_medium_filesize numeric,
    sizes_medium_filename character varying,
    sizes_large_url character varying,
    sizes_large_width numeric,
    sizes_large_height numeric,
    sizes_large_mime_type character varying,
    sizes_large_filesize numeric,
    sizes_large_filename character varying,
    sizes_hero_url character varying,
    sizes_hero_width numeric,
    sizes_hero_height numeric,
    sizes_hero_mime_type character varying,
    sizes_hero_filesize numeric,
    sizes_hero_filename character varying,
    prefix text
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying,
    course_id integer NOT NULL,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer,
    amount numeric NOT NULL,
    description character varying,
    status public.enum_orders_status DEFAULT 'pending'::public.enum_orders_status NOT NULL,
    payment_method public.enum_orders_payment_method,
    payment_id character varying,
    yookassa_status character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    content jsonb,
    is_published boolean DEFAULT false,
    meta_title character varying,
    meta_description character varying,
    meta_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    hero_title_line1 text,
    hero_title_line2 text,
    hero_description text,
    hero_cta_primary_text text,
    hero_cta_primary_link text,
    hero_cta_secondary_text text,
    hero_cta_secondary_link text,
    quote_text text,
    quote_author text,
    about_veleslav_title text,
    about_veleslav_photo_id integer,
    cta_title text,
    cta_subtitle text,
    cta_button_text text,
    cta_button_link text,
    contacts_phone text,
    contacts_phone_href text,
    contacts_email text,
    contacts_telegram text,
    contacts_telegram_link text,
    contacts_address text,
    contacts_legal text
);


--
-- Name: pages_about_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_about_cards (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    icon text,
    title text,
    "desc" jsonb
);


--
-- Name: pages_about_veleslav_paragraphs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_about_veleslav_paragraphs (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    text text
);


--
-- Name: pages_advantages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_advantages (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    icon text,
    title text,
    "desc" text
);


--
-- Name: pages_blocks_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_cards (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_cards_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_cards_cards (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    icon text,
    title text,
    description text,
    link text
);


--
-- Name: pages_blocks_contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_contact (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    phone text,
    email text,
    telegram text,
    address text
);


--
-- Name: pages_blocks_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_content (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    body jsonb
);


--
-- Name: pages_blocks_cta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_cta (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    description text,
    button_text text,
    button_link text,
    background_image_id integer,
    button_text2 text,
    button_link2 text
);


--
-- Name: pages_blocks_divider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_divider (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    style text
);


--
-- Name: pages_blocks_faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_faq (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_faq_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_faq_items (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    question text,
    answer text
);


--
-- Name: pages_blocks_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_features (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_features_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_features_items (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    icon text,
    title text,
    description text
);


--
-- Name: pages_blocks_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_gallery (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_gallery_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_gallery_images (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    image_id integer,
    caption text
);


--
-- Name: pages_blocks_hero; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_hero (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    subtitle text,
    background_image_id integer,
    cta_text text,
    cta_link text,
    cta_text2 text,
    cta_link2 text
);


--
-- Name: pages_blocks_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_image (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    image_id integer,
    caption text,
    alignment text,
    width text
);


--
-- Name: pages_blocks_instructor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_instructor (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    name text,
    photo_id integer,
    photo_alt text
);


--
-- Name: pages_blocks_instructor_facts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_instructor_facts (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    text text
);


--
-- Name: pages_blocks_pacman_animation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_pacman_animation (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    enabled boolean DEFAULT true,
    max_creatures integer DEFAULT 5,
    explosion_radius integer DEFAULT 80
);


--
-- Name: pages_blocks_pricing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_pricing (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_pricing_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_pricing_plans (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    name text,
    price text,
    price_note text,
    features jsonb,
    is_featured boolean DEFAULT false,
    cta_text text,
    cta_link text
);


--
-- Name: pages_blocks_quote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_quote (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    text text,
    author text
);


--
-- Name: pages_blocks_snake_animation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_snake_animation (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    enabled boolean DEFAULT true,
    max_snakes integer DEFAULT 3,
    explosion_radius integer DEFAULT 70
);


--
-- Name: pages_blocks_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_stats (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_stats_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_stats_stats (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    value text,
    label text,
    icon text
);


--
-- Name: pages_blocks_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_steps (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_steps_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_steps_steps (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    title text,
    description text
);


--
-- Name: pages_blocks_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_table (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_table_columns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_table_columns (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    header text
);


--
-- Name: pages_blocks_table_rows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_table_rows (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text
);


--
-- Name: pages_blocks_table_rows_cells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_table_rows_cells (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    value text
);


--
-- Name: pages_blocks_testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_testimonials (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text
);


--
-- Name: pages_blocks_testimonials_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_testimonials_items (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id text,
    name text,
    role text,
    text text,
    avatar_id integer
);


--
-- Name: pages_blocks_text; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_text (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    body jsonb,
    background_color text
);


--
-- Name: pages_blocks_video; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_blocks_video (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    _path text,
    block_name text,
    title text,
    video_url text,
    description text
);


--
-- Name: pages_faq_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_faq_items (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    q text,
    a text
);


--
-- Name: pages_how_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_how_steps (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    num text,
    title text,
    "desc" text
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: pages_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_services (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    icon text,
    title text,
    price text,
    "desc" text,
    href text
);


--
-- Name: pages_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_stats (
    id text NOT NULL,
    _order integer NOT NULL,
    _parent_id integer,
    value text,
    label text
);


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer,
    media_id integer,
    categories_id integer,
    pages_id integer,
    blog_posts_id integer,
    glossary_terms_id integer,
    faq_items_id integer,
    courses_id integer,
    modules_id integer,
    lessons_id integer,
    leads_id integer,
    orders_id integer,
    services_id integer,
    enrollments_id integer,
    lesson_progress_id integer
);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    short_desc character varying,
    content jsonb NOT NULL,
    icon character varying,
    price numeric,
    price_note character varying,
    is_published boolean DEFAULT true,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    site_name character varying DEFAULT 'Школа ПК'::character varying,
    site_description character varying DEFAULT 'Первая Онлайн Школа Потребительских Кооперативов'::character varying,
    logo_id integer,
    header_phone character varying,
    header_email character varying,
    header_telegram character varying,
    footer_text jsonb,
    yookassa_shop_id character varying,
    yookassa_secret_key character varying,
    smtp_host character varying,
    smtp_port numeric,
    smtp_user character varying,
    analytics_yandex_metrika_id character varying,
    analytics_google_analytics_id character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    phone character varying,
    role public.enum_users_role DEFAULT 'student'::public.enum_users_role NOT NULL,
    avatar_id integer,
    bio character varying,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: faq_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items ALTER COLUMN id SET DEFAULT nextval('public.faq_items_id_seq'::regclass);


--
-- Name: glossary_terms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary_terms ALTER COLUMN id SET DEFAULT nextval('public.glossary_terms_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: lesson_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN id SET DEFAULT nextval('public.lesson_progress_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: faq_items faq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items
    ADD CONSTRAINT faq_items_pkey PRIMARY KEY (id);


--
-- Name: glossary_terms glossary_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary_terms
    ADD CONSTRAINT glossary_terms_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages_about_cards pages_about_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_about_cards
    ADD CONSTRAINT pages_about_cards_pkey PRIMARY KEY (id);


--
-- Name: pages_about_veleslav_paragraphs pages_about_veleslav_paragraphs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_about_veleslav_paragraphs
    ADD CONSTRAINT pages_about_veleslav_paragraphs_pkey PRIMARY KEY (id);


--
-- Name: pages_advantages pages_advantages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_advantages
    ADD CONSTRAINT pages_advantages_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_cards_cards pages_blocks_cards_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cards_cards
    ADD CONSTRAINT pages_blocks_cards_cards_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_cards pages_blocks_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cards
    ADD CONSTRAINT pages_blocks_cards_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_contact pages_blocks_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_contact
    ADD CONSTRAINT pages_blocks_contact_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_content pages_blocks_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_content
    ADD CONSTRAINT pages_blocks_content_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_cta pages_blocks_cta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cta
    ADD CONSTRAINT pages_blocks_cta_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_divider pages_blocks_divider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_divider
    ADD CONSTRAINT pages_blocks_divider_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_faq_items pages_blocks_faq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_faq_items
    ADD CONSTRAINT pages_blocks_faq_items_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_faq pages_blocks_faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_faq
    ADD CONSTRAINT pages_blocks_faq_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_features_items pages_blocks_features_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_features_items
    ADD CONSTRAINT pages_blocks_features_items_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_features pages_blocks_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_features
    ADD CONSTRAINT pages_blocks_features_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_gallery_images pages_blocks_gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_gallery_images
    ADD CONSTRAINT pages_blocks_gallery_images_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_gallery pages_blocks_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_gallery
    ADD CONSTRAINT pages_blocks_gallery_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_hero pages_blocks_hero_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_hero
    ADD CONSTRAINT pages_blocks_hero_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_image pages_blocks_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_image
    ADD CONSTRAINT pages_blocks_image_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_instructor_facts pages_blocks_instructor_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_instructor_facts
    ADD CONSTRAINT pages_blocks_instructor_facts_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_instructor pages_blocks_instructor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_instructor
    ADD CONSTRAINT pages_blocks_instructor_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_pacman_animation pages_blocks_pacman_animation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pacman_animation
    ADD CONSTRAINT pages_blocks_pacman_animation_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_pricing pages_blocks_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pricing
    ADD CONSTRAINT pages_blocks_pricing_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_pricing_plans pages_blocks_pricing_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pricing_plans
    ADD CONSTRAINT pages_blocks_pricing_plans_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_quote pages_blocks_quote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_quote
    ADD CONSTRAINT pages_blocks_quote_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_snake_animation pages_blocks_snake_animation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_snake_animation
    ADD CONSTRAINT pages_blocks_snake_animation_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_stats pages_blocks_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_stats
    ADD CONSTRAINT pages_blocks_stats_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_stats_stats pages_blocks_stats_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_stats_stats
    ADD CONSTRAINT pages_blocks_stats_stats_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_steps pages_blocks_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_steps
    ADD CONSTRAINT pages_blocks_steps_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_steps_steps pages_blocks_steps_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_steps_steps
    ADD CONSTRAINT pages_blocks_steps_steps_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_table_columns pages_blocks_table_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_columns
    ADD CONSTRAINT pages_blocks_table_columns_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_table pages_blocks_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table
    ADD CONSTRAINT pages_blocks_table_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_table_rows_cells pages_blocks_table_rows_cells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_rows_cells
    ADD CONSTRAINT pages_blocks_table_rows_cells_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_table_rows pages_blocks_table_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_rows
    ADD CONSTRAINT pages_blocks_table_rows_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_testimonials_items pages_blocks_testimonials_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_testimonials_items
    ADD CONSTRAINT pages_blocks_testimonials_items_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_testimonials pages_blocks_testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_testimonials
    ADD CONSTRAINT pages_blocks_testimonials_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_text pages_blocks_text_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_text
    ADD CONSTRAINT pages_blocks_text_pkey PRIMARY KEY (id);


--
-- Name: pages_blocks_video pages_blocks_video_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_video
    ADD CONSTRAINT pages_blocks_video_pkey PRIMARY KEY (id);


--
-- Name: pages_faq_items pages_faq_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_faq_items
    ADD CONSTRAINT pages_faq_items_pkey PRIMARY KEY (id);


--
-- Name: pages_how_steps pages_how_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_how_steps
    ADD CONSTRAINT pages_how_steps_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages_services pages_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_services
    ADD CONSTRAINT pages_services_pkey PRIMARY KEY (id);


--
-- Name: pages_stats pages_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_stats
    ADD CONSTRAINT pages_stats_pkey PRIMARY KEY (id);


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_author_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_author_idx ON public.blog_posts USING btree (author_id);


--
-- Name: blog_posts_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_category_idx ON public.blog_posts USING btree (category_id);


--
-- Name: blog_posts_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_cover_image_idx ON public.blog_posts USING btree (cover_image_id);


--
-- Name: blog_posts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_created_at_idx ON public.blog_posts USING btree (created_at);


--
-- Name: blog_posts_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_meta_meta_image_idx ON public.blog_posts USING btree (meta_image_id);


--
-- Name: blog_posts_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_idx ON public.blog_posts USING btree (slug);


--
-- Name: blog_posts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_updated_at_idx ON public.blog_posts USING btree (updated_at);


--
-- Name: categories_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_created_at_idx ON public.categories USING btree (created_at);


--
-- Name: categories_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_parent_idx ON public.categories USING btree (parent_id);


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_updated_at_idx ON public.categories USING btree (updated_at);


--
-- Name: courses_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_created_at_idx ON public.courses USING btree (created_at);


--
-- Name: courses_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_image_idx ON public.courses USING btree (image_id);


--
-- Name: courses_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_meta_meta_image_idx ON public.courses USING btree (meta_image_id);


--
-- Name: courses_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX courses_slug_idx ON public.courses USING btree (slug);


--
-- Name: courses_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_updated_at_idx ON public.courses USING btree (updated_at);


--
-- Name: enrollments_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_course_idx ON public.enrollments USING btree (course_id);


--
-- Name: enrollments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_created_at_idx ON public.enrollments USING btree (created_at);


--
-- Name: enrollments_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_updated_at_idx ON public.enrollments USING btree (updated_at);


--
-- Name: enrollments_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_user_idx ON public.enrollments USING btree (user_id);


--
-- Name: faq_items_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faq_items_category_idx ON public.faq_items USING btree (category_id);


--
-- Name: faq_items_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faq_items_created_at_idx ON public.faq_items USING btree (created_at);


--
-- Name: faq_items_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX faq_items_updated_at_idx ON public.faq_items USING btree (updated_at);


--
-- Name: glossary_terms_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX glossary_terms_category_idx ON public.glossary_terms USING btree (category_id);


--
-- Name: glossary_terms_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX glossary_terms_created_at_idx ON public.glossary_terms USING btree (created_at);


--
-- Name: glossary_terms_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX glossary_terms_meta_meta_image_idx ON public.glossary_terms USING btree (meta_image_id);


--
-- Name: glossary_terms_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX glossary_terms_slug_idx ON public.glossary_terms USING btree (slug);


--
-- Name: glossary_terms_term_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX glossary_terms_term_idx ON public.glossary_terms USING btree (term);


--
-- Name: glossary_terms_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX glossary_terms_updated_at_idx ON public.glossary_terms USING btree (updated_at);


--
-- Name: leads_assigned_to_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_assigned_to_idx ON public.leads USING btree (assigned_to_id);


--
-- Name: leads_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_created_at_idx ON public.leads USING btree (created_at);


--
-- Name: leads_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_updated_at_idx ON public.leads USING btree (updated_at);


--
-- Name: lesson_progress_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_created_at_idx ON public.lesson_progress USING btree (created_at);


--
-- Name: lesson_progress_lesson_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_lesson_idx ON public.lesson_progress USING btree (lesson_id);


--
-- Name: lesson_progress_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_updated_at_idx ON public.lesson_progress USING btree (updated_at);


--
-- Name: lesson_progress_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_progress_user_idx ON public.lesson_progress USING btree (user_id);


--
-- Name: lessons_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_created_at_idx ON public.lessons USING btree (created_at);


--
-- Name: lessons_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_module_idx ON public.lessons USING btree (module_id);


--
-- Name: lessons_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_updated_at_idx ON public.lessons USING btree (updated_at);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_sizes_hero_sizes_hero_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_hero_sizes_hero_filename_idx ON public.media USING btree (sizes_hero_filename);


--
-- Name: media_sizes_large_sizes_large_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_large_sizes_large_filename_idx ON public.media USING btree (sizes_large_filename);


--
-- Name: media_sizes_medium_sizes_medium_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_medium_sizes_medium_filename_idx ON public.media USING btree (sizes_medium_filename);


--
-- Name: media_sizes_small_sizes_small_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_small_sizes_small_filename_idx ON public.media USING btree (sizes_small_filename);


--
-- Name: media_sizes_thumbnail_sizes_thumbnail_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_thumbnail_sizes_thumbnail_filename_idx ON public.media USING btree (sizes_thumbnail_filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: modules_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX modules_course_idx ON public.modules USING btree (course_id);


--
-- Name: modules_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX modules_created_at_idx ON public.modules USING btree (created_at);


--
-- Name: modules_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX modules_updated_at_idx ON public.modules USING btree (updated_at);


--
-- Name: orders_course_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_course_idx ON public.orders USING btree (course_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_updated_at_idx ON public.orders USING btree (updated_at);


--
-- Name: orders_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_idx ON public.orders USING btree (user_id);


--
-- Name: pages_about_cards_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_about_cards_parent_id_idx ON public.pages_about_cards USING btree (_parent_id);


--
-- Name: pages_about_veleslav_paragraphs_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_about_veleslav_paragraphs_parent_id_idx ON public.pages_about_veleslav_paragraphs USING btree (_parent_id);


--
-- Name: pages_advantages_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_advantages_parent_id_idx ON public.pages_advantages USING btree (_parent_id);


--
-- Name: pages_blocks_cards_cards_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cards_cards_order_idx ON public.pages_blocks_cards_cards USING btree (_order);


--
-- Name: pages_blocks_cards_cards_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cards_cards_parent_id_idx ON public.pages_blocks_cards_cards USING btree (_parent_id);


--
-- Name: pages_blocks_cards_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cards_order_idx ON public.pages_blocks_cards USING btree (_order);


--
-- Name: pages_blocks_cards_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cards_parent_id_idx ON public.pages_blocks_cards USING btree (_parent_id);


--
-- Name: pages_blocks_contact_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_contact_order_idx ON public.pages_blocks_contact USING btree (_order);


--
-- Name: pages_blocks_contact_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_contact_parent_id_idx ON public.pages_blocks_contact USING btree (_parent_id);


--
-- Name: pages_blocks_content_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_content_order_idx ON public.pages_blocks_content USING btree (_order);


--
-- Name: pages_blocks_content_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_content_parent_id_idx ON public.pages_blocks_content USING btree (_parent_id);


--
-- Name: pages_blocks_cta_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cta_order_idx ON public.pages_blocks_cta USING btree (_order);


--
-- Name: pages_blocks_cta_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_cta_parent_id_idx ON public.pages_blocks_cta USING btree (_parent_id);


--
-- Name: pages_blocks_divider_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_divider_order_idx ON public.pages_blocks_divider USING btree (_order);


--
-- Name: pages_blocks_divider_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_divider_parent_id_idx ON public.pages_blocks_divider USING btree (_parent_id);


--
-- Name: pages_blocks_faq_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_faq_items_parent_id_idx ON public.pages_blocks_faq_items USING btree (_parent_id);


--
-- Name: pages_blocks_faq_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_faq_order_idx ON public.pages_blocks_faq USING btree (_order);


--
-- Name: pages_blocks_faq_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_faq_parent_id_idx ON public.pages_blocks_faq USING btree (_parent_id);


--
-- Name: pages_blocks_features_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_features_items_parent_id_idx ON public.pages_blocks_features_items USING btree (_parent_id);


--
-- Name: pages_blocks_features_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_features_order_idx ON public.pages_blocks_features USING btree (_order);


--
-- Name: pages_blocks_features_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_features_parent_id_idx ON public.pages_blocks_features USING btree (_parent_id);


--
-- Name: pages_blocks_gallery_images_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_gallery_images_parent_id_idx ON public.pages_blocks_gallery_images USING btree (_parent_id);


--
-- Name: pages_blocks_gallery_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_gallery_order_idx ON public.pages_blocks_gallery USING btree (_order);


--
-- Name: pages_blocks_gallery_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_gallery_parent_id_idx ON public.pages_blocks_gallery USING btree (_parent_id);


--
-- Name: pages_blocks_hero_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_hero_order_idx ON public.pages_blocks_hero USING btree (_order);


--
-- Name: pages_blocks_hero_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_hero_parent_id_idx ON public.pages_blocks_hero USING btree (_parent_id);


--
-- Name: pages_blocks_image_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_image_order_idx ON public.pages_blocks_image USING btree (_order);


--
-- Name: pages_blocks_image_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_image_parent_id_idx ON public.pages_blocks_image USING btree (_parent_id);


--
-- Name: pages_blocks_instructor_facts_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_instructor_facts_order_idx ON public.pages_blocks_instructor_facts USING btree (_order);


--
-- Name: pages_blocks_instructor_facts_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_instructor_facts_parent_id_idx ON public.pages_blocks_instructor_facts USING btree (_parent_id);


--
-- Name: pages_blocks_instructor_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_instructor_order_idx ON public.pages_blocks_instructor USING btree (_order);


--
-- Name: pages_blocks_instructor_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_instructor_parent_id_idx ON public.pages_blocks_instructor USING btree (_parent_id);


--
-- Name: pages_blocks_pacman_animation_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_pacman_animation_order_idx ON public.pages_blocks_pacman_animation USING btree (_order);


--
-- Name: pages_blocks_pacman_animation_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_pacman_animation_parent_id_idx ON public.pages_blocks_pacman_animation USING btree (_parent_id);


--
-- Name: pages_blocks_pricing_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_pricing_order_idx ON public.pages_blocks_pricing USING btree (_order);


--
-- Name: pages_blocks_pricing_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_pricing_parent_id_idx ON public.pages_blocks_pricing USING btree (_parent_id);


--
-- Name: pages_blocks_pricing_plans_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_pricing_plans_parent_id_idx ON public.pages_blocks_pricing_plans USING btree (_parent_id);


--
-- Name: pages_blocks_quote_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_quote_order_idx ON public.pages_blocks_quote USING btree (_order);


--
-- Name: pages_blocks_quote_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_quote_parent_id_idx ON public.pages_blocks_quote USING btree (_parent_id);


--
-- Name: pages_blocks_snake_animation_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_snake_animation_order_idx ON public.pages_blocks_snake_animation USING btree (_order);


--
-- Name: pages_blocks_snake_animation_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_snake_animation_parent_id_idx ON public.pages_blocks_snake_animation USING btree (_parent_id);


--
-- Name: pages_blocks_stats_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_stats_order_idx ON public.pages_blocks_stats USING btree (_order);


--
-- Name: pages_blocks_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_stats_parent_id_idx ON public.pages_blocks_stats USING btree (_parent_id);


--
-- Name: pages_blocks_stats_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_stats_stats_parent_id_idx ON public.pages_blocks_stats_stats USING btree (_parent_id);


--
-- Name: pages_blocks_steps_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_steps_order_idx ON public.pages_blocks_steps USING btree (_order);


--
-- Name: pages_blocks_steps_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_steps_parent_id_idx ON public.pages_blocks_steps USING btree (_parent_id);


--
-- Name: pages_blocks_steps_steps_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_steps_steps_order_idx ON public.pages_blocks_steps_steps USING btree (_order);


--
-- Name: pages_blocks_steps_steps_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_steps_steps_parent_id_idx ON public.pages_blocks_steps_steps USING btree (_parent_id);


--
-- Name: pages_blocks_table_columns_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_columns_order_idx ON public.pages_blocks_table_columns USING btree (_order);


--
-- Name: pages_blocks_table_columns_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_columns_parent_id_idx ON public.pages_blocks_table_columns USING btree (_parent_id);


--
-- Name: pages_blocks_table_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_order_idx ON public.pages_blocks_table USING btree (_order);


--
-- Name: pages_blocks_table_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_parent_id_idx ON public.pages_blocks_table USING btree (_parent_id);


--
-- Name: pages_blocks_table_rows_cells_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_rows_cells_order_idx ON public.pages_blocks_table_rows_cells USING btree (_order);


--
-- Name: pages_blocks_table_rows_cells_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_rows_cells_parent_id_idx ON public.pages_blocks_table_rows_cells USING btree (_parent_id);


--
-- Name: pages_blocks_table_rows_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_rows_order_idx ON public.pages_blocks_table_rows USING btree (_order);


--
-- Name: pages_blocks_table_rows_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_table_rows_parent_id_idx ON public.pages_blocks_table_rows USING btree (_parent_id);


--
-- Name: pages_blocks_testimonials_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_testimonials_items_parent_id_idx ON public.pages_blocks_testimonials_items USING btree (_parent_id);


--
-- Name: pages_blocks_testimonials_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_testimonials_order_idx ON public.pages_blocks_testimonials USING btree (_order);


--
-- Name: pages_blocks_testimonials_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_testimonials_parent_id_idx ON public.pages_blocks_testimonials USING btree (_parent_id);


--
-- Name: pages_blocks_text_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_text_order_idx ON public.pages_blocks_text USING btree (_order);


--
-- Name: pages_blocks_text_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_text_parent_id_idx ON public.pages_blocks_text USING btree (_parent_id);


--
-- Name: pages_blocks_video_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_video_order_idx ON public.pages_blocks_video USING btree (_order);


--
-- Name: pages_blocks_video_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_blocks_video_parent_id_idx ON public.pages_blocks_video USING btree (_parent_id);


--
-- Name: pages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_created_at_idx ON public.pages USING btree (created_at);


--
-- Name: pages_faq_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_faq_items_parent_id_idx ON public.pages_faq_items USING btree (_parent_id);


--
-- Name: pages_how_steps_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_how_steps_parent_id_idx ON public.pages_how_steps USING btree (_parent_id);


--
-- Name: pages_meta_meta_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_meta_meta_image_idx ON public.pages USING btree (meta_image_id);


--
-- Name: pages_services_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_services_parent_id_idx ON public.pages_services USING btree (_parent_id);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: pages_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_stats_parent_id_idx ON public.pages_stats USING btree (_parent_id);


--
-- Name: pages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_updated_at_idx ON public.pages USING btree (updated_at);


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_blog_posts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_blog_posts_id_idx ON public.payload_locked_documents_rels USING btree (blog_posts_id);


--
-- Name: payload_locked_documents_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_categories_id_idx ON public.payload_locked_documents_rels USING btree (categories_id);


--
-- Name: payload_locked_documents_rels_courses_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_courses_id_idx ON public.payload_locked_documents_rels USING btree (courses_id);


--
-- Name: payload_locked_documents_rels_enrollments_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_enrollments_id_idx ON public.payload_locked_documents_rels USING btree (enrollments_id);


--
-- Name: payload_locked_documents_rels_faq_items_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_faq_items_id_idx ON public.payload_locked_documents_rels USING btree (faq_items_id);


--
-- Name: payload_locked_documents_rels_glossary_terms_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_glossary_terms_id_idx ON public.payload_locked_documents_rels USING btree (glossary_terms_id);


--
-- Name: payload_locked_documents_rels_leads_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_leads_id_idx ON public.payload_locked_documents_rels USING btree (leads_id);


--
-- Name: payload_locked_documents_rels_lesson_progress_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_lesson_progress_id_idx ON public.payload_locked_documents_rels USING btree (lesson_progress_id);


--
-- Name: payload_locked_documents_rels_lessons_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_lessons_id_idx ON public.payload_locked_documents_rels USING btree (lessons_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_modules_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_modules_id_idx ON public.payload_locked_documents_rels USING btree (modules_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_orders_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_orders_id_idx ON public.payload_locked_documents_rels USING btree (orders_id);


--
-- Name: payload_locked_documents_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_pages_id_idx ON public.payload_locked_documents_rels USING btree (pages_id);


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_services_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_services_id_idx ON public.payload_locked_documents_rels USING btree (services_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: services_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_created_at_idx ON public.services USING btree (created_at);


--
-- Name: services_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX services_slug_idx ON public.services USING btree (slug);


--
-- Name: services_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX services_updated_at_idx ON public.services USING btree (updated_at);


--
-- Name: settings_logo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_logo_idx ON public.settings USING btree (logo_id);


--
-- Name: users_avatar_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_avatar_idx ON public.users USING btree (avatar_id);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: blog_posts blog_posts_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: blog_posts blog_posts_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories categories_parent_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_categories_id_fk FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: courses courses_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: courses courses_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: faq_items faq_items_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq_items
    ADD CONSTRAINT faq_items_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: glossary_terms glossary_terms_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary_terms
    ADD CONSTRAINT glossary_terms_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: glossary_terms glossary_terms_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary_terms
    ADD CONSTRAINT glossary_terms_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: leads leads_assigned_to_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_id_users_id_fk FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lesson_progress lesson_progress_lesson_id_lessons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_lessons_id_fk FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- Name: lesson_progress lesson_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lessons lessons_module_id_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL;


--
-- Name: modules modules_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: orders orders_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pages_about_cards pages_about_cards__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_about_cards
    ADD CONSTRAINT pages_about_cards__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_about_veleslav_paragraphs pages_about_veleslav_paragraphs__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_about_veleslav_paragraphs
    ADD CONSTRAINT pages_about_veleslav_paragraphs__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages pages_about_veleslav_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_about_veleslav_photo_id_fkey FOREIGN KEY (about_veleslav_photo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_advantages pages_advantages__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_advantages
    ADD CONSTRAINT pages_advantages__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cards pages_blocks_cards__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cards
    ADD CONSTRAINT pages_blocks_cards__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cards_cards pages_blocks_cards_cards__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cards_cards
    ADD CONSTRAINT pages_blocks_cards_cards__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_cards(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_contact pages_blocks_contact__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_contact
    ADD CONSTRAINT pages_blocks_contact__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_content pages_blocks_content__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_content
    ADD CONSTRAINT pages_blocks_content__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cta pages_blocks_cta__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cta
    ADD CONSTRAINT pages_blocks_cta__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_cta pages_blocks_cta_background_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_cta
    ADD CONSTRAINT pages_blocks_cta_background_image_id_fkey FOREIGN KEY (background_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_divider pages_blocks_divider__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_divider
    ADD CONSTRAINT pages_blocks_divider__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_faq pages_blocks_faq__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_faq
    ADD CONSTRAINT pages_blocks_faq__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_faq_items pages_blocks_faq_items__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_faq_items
    ADD CONSTRAINT pages_blocks_faq_items__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_faq(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_features pages_blocks_features__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_features
    ADD CONSTRAINT pages_blocks_features__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_features_items pages_blocks_features_items__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_features_items
    ADD CONSTRAINT pages_blocks_features_items__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_features(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_gallery pages_blocks_gallery__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_gallery
    ADD CONSTRAINT pages_blocks_gallery__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_gallery_images pages_blocks_gallery_images__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_gallery_images
    ADD CONSTRAINT pages_blocks_gallery_images__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_gallery(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_gallery_images pages_blocks_gallery_images_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_gallery_images
    ADD CONSTRAINT pages_blocks_gallery_images_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_hero pages_blocks_hero__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_hero
    ADD CONSTRAINT pages_blocks_hero__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_hero pages_blocks_hero_background_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_hero
    ADD CONSTRAINT pages_blocks_hero_background_image_id_fkey FOREIGN KEY (background_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_image pages_blocks_image__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_image
    ADD CONSTRAINT pages_blocks_image__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_image pages_blocks_image_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_image
    ADD CONSTRAINT pages_blocks_image_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_instructor pages_blocks_instructor__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_instructor
    ADD CONSTRAINT pages_blocks_instructor__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_instructor_facts pages_blocks_instructor_facts__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_instructor_facts
    ADD CONSTRAINT pages_blocks_instructor_facts__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_instructor(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_instructor pages_blocks_instructor_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_instructor
    ADD CONSTRAINT pages_blocks_instructor_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_pacman_animation pages_blocks_pacman_animation__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pacman_animation
    ADD CONSTRAINT pages_blocks_pacman_animation__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_pricing pages_blocks_pricing__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pricing
    ADD CONSTRAINT pages_blocks_pricing__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_pricing_plans pages_blocks_pricing_plans__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_pricing_plans
    ADD CONSTRAINT pages_blocks_pricing_plans__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_pricing(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_quote pages_blocks_quote__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_quote
    ADD CONSTRAINT pages_blocks_quote__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_snake_animation pages_blocks_snake_animation__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_snake_animation
    ADD CONSTRAINT pages_blocks_snake_animation__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_stats pages_blocks_stats__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_stats
    ADD CONSTRAINT pages_blocks_stats__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_stats_stats pages_blocks_stats_stats__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_stats_stats
    ADD CONSTRAINT pages_blocks_stats_stats__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_stats(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_steps pages_blocks_steps__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_steps
    ADD CONSTRAINT pages_blocks_steps__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_steps_steps pages_blocks_steps_steps__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_steps_steps
    ADD CONSTRAINT pages_blocks_steps_steps__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_steps(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_table pages_blocks_table__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table
    ADD CONSTRAINT pages_blocks_table__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_table_columns pages_blocks_table_columns__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_columns
    ADD CONSTRAINT pages_blocks_table_columns__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_table(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_table_rows pages_blocks_table_rows__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_rows
    ADD CONSTRAINT pages_blocks_table_rows__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_table(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_table_rows_cells pages_blocks_table_rows_cells__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_table_rows_cells
    ADD CONSTRAINT pages_blocks_table_rows_cells__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_table_rows(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_testimonials pages_blocks_testimonials__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_testimonials
    ADD CONSTRAINT pages_blocks_testimonials__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_testimonials_items pages_blocks_testimonials_items__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_testimonials_items
    ADD CONSTRAINT pages_blocks_testimonials_items__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages_blocks_testimonials(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_testimonials_items pages_blocks_testimonials_items_avatar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_testimonials_items
    ADD CONSTRAINT pages_blocks_testimonials_items_avatar_id_fkey FOREIGN KEY (avatar_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_blocks_text pages_blocks_text__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_text
    ADD CONSTRAINT pages_blocks_text__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_blocks_video pages_blocks_video__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_blocks_video
    ADD CONSTRAINT pages_blocks_video__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_faq_items pages_faq_items__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_faq_items
    ADD CONSTRAINT pages_faq_items__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_how_steps pages_how_steps__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_how_steps
    ADD CONSTRAINT pages_how_steps__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages pages_meta_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_meta_image_id_media_id_fk FOREIGN KEY (meta_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_services pages_services__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_services
    ADD CONSTRAINT pages_services__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: pages_stats pages_stats__parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_stats
    ADD CONSTRAINT pages_stats__parent_id_fkey FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_blog_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_blog_posts_fk FOREIGN KEY (blog_posts_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_courses_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_courses_fk FOREIGN KEY (courses_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_enrollments_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_enrollments_fk FOREIGN KEY (enrollments_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_faq_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_faq_items_fk FOREIGN KEY (faq_items_id) REFERENCES public.faq_items(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_glossary_terms_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_glossary_terms_fk FOREIGN KEY (glossary_terms_id) REFERENCES public.glossary_terms(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_leads_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_leads_fk FOREIGN KEY (leads_id) REFERENCES public.leads(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_lesson_progress_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_lesson_progress_fk FOREIGN KEY (lesson_progress_id) REFERENCES public.lesson_progress(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_lessons_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_lessons_fk FOREIGN KEY (lessons_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_modules_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_modules_fk FOREIGN KEY (modules_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_orders_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_orders_fk FOREIGN KEY (orders_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_services_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_services_fk FOREIGN KEY (services_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: settings settings_logo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_logo_id_media_id_fk FOREIGN KEY (logo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: users users_avatar_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_avatar_id_media_id_fk FOREIGN KEY (avatar_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict o575RG6ImztzFdlIiv8hcgn1jQHTkdeIOECHWqPPKXm7VweT4smtts8fOcuKoB4

`
  
  // Выполняем по частям (разделитель — точки с запятой)
  const statements = schemaSQL
    .split(';\n')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET ') && !s.startsWith('SELECT pg_catalog'))
  
  for (const stmt of statements) {
    try {
      await db.execute(stmt)
    } catch (e) {
      // Игнорируем "already exists" ошибки
      if (!e.message.includes('already exists')) {
        console.error('[migration] SQL error:', e.message.substring(0, 200))
      }
    }
  }
  
  console.log('[migration] Начальная схема создана')
}

export async function down({ db }) {
  // Не откатываем — это baseline
  console.log('[migration] down() не поддерживается для initial schema')
}
