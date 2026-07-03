/**
 * Generates database/gramunnati.sql for cPanel MySQL import.
 * Run: node scripts/generate-gramunnati-sql.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'database', 'gramunnati.sql');

const SUPABASE_URL = 'https://rguaglbwcsnzgniktito.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndWFnbGJ3Y3NuemduaWt0aXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTAxOTksImV4cCI6MjA5NzE4NjE5OX0.FEXcs97ojugdYISmIEMVZWIxfUuEDNGzdGs4qi952W4';

const ADMIN_BCRYPT = '$2y$12$MxOblVaqIN/bmfHXD5A.luy0qc/0tElgsks/MnSZlFbZrCed53W1i'; // testadmin123

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function fetchAll(table) {
  const rows = [];
  let offset = 0;
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&order=id&offset=${offset}&limit=1000`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    rows.push(...batch);
    if (batch.length < 1000) break;
    offset += 1000;
  }
  return rows;
}

function toMysqlDatetime(val) {
  if (typeof val !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(val)) return val;
  return val
    .replace('T', ' ')
    .replace(/\.\d+(Z|[+-]\d{2}:\d{2})?$/, '')
    .replace(/Z$/, '')
    .replace(/[+-]\d{2}:\d{2}$/, '');
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  const normalized = toMysqlDatetime(val);
  return `'${String(normalized).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function inserts(table, rows, columns, transform) {
  if (!rows.length) return `-- ${table}: no rows\n`;
  const cols = columns.map((c) => `\`${c}\``).join(', ');
  const lines = rows.map((row) => {
    const r = transform ? transform(row) : row;
    const vals = columns.map((c) => esc(r[c]));
    return `(${vals.join(', ')})`;
  });
  return `INSERT INTO \`${table}\` (${cols}) VALUES\n${lines.join(',\n')};\n\n`;
}

const DDL = `-- GramUnnati MySQL schema + seed data
-- Import: cPanel → phpMyAdmin → select your database → Import → choose this file
-- Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ─── Laravel core ───────────────────────────────────────
DROP TABLE IF EXISTS \`failed_jobs\`;
DROP TABLE IF EXISTS \`job_batches\`;
DROP TABLE IF EXISTS \`jobs\`;
DROP TABLE IF EXISTS \`cache_locks\`;
DROP TABLE IF EXISTS \`cache\`;
DROP TABLE IF EXISTS \`sessions\`;
DROP TABLE IF EXISTS \`password_reset_tokens\`;
DROP TABLE IF EXISTS \`personal_access_tokens\`;
DROP TABLE IF EXISTS \`user_roles\`;
DROP TABLE IF EXISTS \`user_category_user\`;
DROP TABLE IF EXISTS \`profiles\`;
DROP TABLE IF EXISTS \`users\`;

CREATE TABLE \`users\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`email_verified_at\` TIMESTAMP NULL DEFAULT NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`remember_token\` VARCHAR(100) NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`users_email_unique\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`password_reset_tokens\` (
  \`email\` VARCHAR(255) NOT NULL,
  \`token\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`sessions\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`ip_address\` VARCHAR(45) NULL DEFAULT NULL,
  \`user_agent\` TEXT NULL,
  \`payload\` LONGTEXT NOT NULL,
  \`last_activity\` INT NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`sessions_user_id_index\` (\`user_id\`),
  KEY \`sessions_last_activity_index\` (\`last_activity\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`cache\` (
  \`key\` VARCHAR(255) NOT NULL,
  \`value\` MEDIUMTEXT NOT NULL,
  \`expiration\` INT NOT NULL,
  PRIMARY KEY (\`key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`cache_locks\` (
  \`key\` VARCHAR(255) NOT NULL,
  \`owner\` VARCHAR(255) NOT NULL,
  \`expiration\` INT NOT NULL,
  PRIMARY KEY (\`key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`jobs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`queue\` VARCHAR(255) NOT NULL,
  \`payload\` LONGTEXT NOT NULL,
  \`attempts\` TINYINT UNSIGNED NOT NULL,
  \`reserved_at\` INT UNSIGNED NULL DEFAULT NULL,
  \`available_at\` INT UNSIGNED NOT NULL,
  \`created_at\` INT UNSIGNED NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`jobs_queue_index\` (\`queue\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`job_batches\` (
  \`id\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`total_jobs\` INT NOT NULL,
  \`pending_jobs\` INT NOT NULL,
  \`failed_jobs\` INT NOT NULL,
  \`failed_job_ids\` LONGTEXT NOT NULL,
  \`options\` MEDIUMTEXT NULL,
  \`cancelled_at\` INT NULL DEFAULT NULL,
  \`created_at\` INT NOT NULL,
  \`finished_at\` INT NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`failed_jobs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`uuid\` VARCHAR(255) NOT NULL,
  \`connection\` TEXT NOT NULL,
  \`queue\` TEXT NOT NULL,
  \`payload\` LONGTEXT NOT NULL,
  \`exception\` LONGTEXT NOT NULL,
  \`failed_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`failed_jobs_uuid_unique\` (\`uuid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`personal_access_tokens\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`tokenable_type\` VARCHAR(255) NOT NULL,
  \`tokenable_id\` BIGINT UNSIGNED NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`token\` VARCHAR(64) NOT NULL,
  \`abilities\` TEXT NULL,
  \`last_used_at\` TIMESTAMP NULL DEFAULT NULL,
  \`expires_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`personal_access_tokens_token_unique\` (\`token\`),
  KEY \`personal_access_tokens_tokenable_type_tokenable_id_index\` (\`tokenable_type\`, \`tokenable_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── App tables ─────────────────────────────────────────
DROP TABLE IF EXISTS \`donation_receipts\`;
DROP TABLE IF EXISTS \`donations\`;
DROP TABLE IF EXISTS \`volunteer_activities\`;
DROP TABLE IF EXISTS \`volunteers\`;
DROP TABLE IF EXISTS \`village_followers\`;
DROP TABLE IF EXISTS \`school_followers\`;
DROP TABLE IF EXISTS \`village_needs\`;
DROP TABLE IF EXISTS \`school_requirements\`;
DROP TABLE IF EXISTS \`project_updates\`;
DROP TABLE IF EXISTS \`notifications\`;
DROP TABLE IF EXISTS \`audit_logs\`;
DROP TABLE IF EXISTS \`contact_messages\`;
DROP TABLE IF EXISTS \`documents\`;
DROP TABLE IF EXISTS \`testimonials\`;
DROP TABLE IF EXISTS \`galleries\`;
DROP TABLE IF EXISTS \`activity_logs\`;
DROP TABLE IF EXISTS \`impact_metrics\`;
DROP TABLE IF EXISTS \`success_stories\`;
DROP TABLE IF EXISTS \`news\`;
DROP TABLE IF EXISTS \`events\`;
DROP TABLE IF EXISTS \`beneficiaries\`;
DROP TABLE IF EXISTS \`partners\`;
DROP TABLE IF EXISTS \`team_members\`;
DROP TABLE IF EXISTS \`team_groups\`;
DROP TABLE IF EXISTS \`programs\`;
DROP TABLE IF EXISTS \`projects\`;
DROP TABLE IF EXISTS \`project_categories\`;
DROP TABLE IF EXISTS \`schools\`;
DROP TABLE IF EXISTS \`villages\`;
DROP TABLE IF EXISTS \`cms_pages\`;
DROP TABLE IF EXISTS \`faqs\`;
DROP TABLE IF EXISTS \`settings\`;
DROP TABLE IF EXISTS \`user_categories\`;
DROP TABLE IF EXISTS \`roles\`;
DROP TABLE IF EXISTS \`mandals\`;
DROP TABLE IF EXISTS \`districts\`;
DROP TABLE IF EXISTS \`states\`;

CREATE TABLE \`states\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(10) NULL DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`districts\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`state_id\` BIGINT UNSIGNED NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(20) NULL DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`districts_state_id_index\` (\`state_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`mandals\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`district_id\` BIGINT UNSIGNED NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(20) NULL DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`mandals_district_id_index\` (\`district_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`roles\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`guard_name\` VARCHAR(255) NOT NULL DEFAULT 'web',
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`roles_name_guard_unique\` (\`name\`, \`guard_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`user_categories\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`user_categories_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`profiles\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`first_name\` VARCHAR(255) NULL DEFAULT NULL,
  \`last_name\` VARCHAR(255) NULL DEFAULT NULL,
  \`full_name\` VARCHAR(255) NULL DEFAULT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`mobile_verified_at\` TIMESTAMP NULL DEFAULT NULL,
  \`profile_photo\` VARCHAR(500) NULL DEFAULT NULL,
  \`gender\` VARCHAR(20) NULL DEFAULT NULL,
  \`date_of_birth\` DATE NULL DEFAULT NULL,
  \`state_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`district_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`mandal_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`pincode\` VARCHAR(10) NULL DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`profiles_user_id_unique\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`user_roles\` (
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`role_id\` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (\`user_id\`, \`role_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`user_category_user\` (
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`category_id\` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (\`user_id\`, \`category_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`settings\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`key\` VARCHAR(255) NOT NULL,
  \`value\` LONGTEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`settings_key_unique\` (\`key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`cms_pages\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`short_description\` TEXT NULL,
  \`content\` LONGTEXT NULL,
  \`featured_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'active',
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`cms_pages_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`faqs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`question\` TEXT NOT NULL,
  \`answer\` LONGTEXT NOT NULL,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`villages\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`state_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`district_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`mandal_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`village_name\` VARCHAR(255) NOT NULL,
  \`village_code\` VARCHAR(50) NULL DEFAULT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`pincode\` VARCHAR(10) NULL DEFAULT NULL,
  \`latitude\` DECIMAL(10,7) NULL DEFAULT NULL,
  \`longitude\` DECIMAL(10,7) NULL DEFAULT NULL,
  \`short_description\` TEXT NULL,
  \`description\` LONGTEXT NULL,
  \`history\` LONGTEXT NULL,
  \`population\` INT NOT NULL DEFAULT 0,
  \`male_population\` INT NOT NULL DEFAULT 0,
  \`female_population\` INT NOT NULL DEFAULT 0,
  \`children_count\` INT NOT NULL DEFAULT 0,
  \`senior_citizen_count\` INT NOT NULL DEFAULT 0,
  \`literacy_rate\` DECIMAL(5,2) NULL DEFAULT NULL,
  \`farmer_count\` INT NOT NULL DEFAULT 0,
  \`cultivable_land\` VARCHAR(255) NULL DEFAULT NULL,
  \`major_crops\` VARCHAR(255) NULL DEFAULT NULL,
  \`trees_count\` INT NOT NULL DEFAULT 0,
  \`water_bodies_count\` INT NOT NULL DEFAULT 0,
  \`logo\` VARCHAR(500) NULL DEFAULT NULL,
  \`cover_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`primary_representative_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`updated_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`villages_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`schools\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`school_name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`school_type\` VARCHAR(50) NULL DEFAULT NULL,
  \`udise_code\` VARCHAR(50) NULL DEFAULT NULL,
  \`principal_name\` VARCHAR(255) NULL DEFAULT NULL,
  \`contact_number\` VARCHAR(20) NULL DEFAULT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`website\` VARCHAR(255) NULL DEFAULT NULL,
  \`student_count\` INT NOT NULL DEFAULT 0,
  \`teacher_count\` INT NOT NULL DEFAULT 0,
  \`classroom_count\` INT NOT NULL DEFAULT 0,
  \`library_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`computer_lab_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`playground_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`drinking_water_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`toilet_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`electricity_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`digital_classroom_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`boundary_wall_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`logo\` VARCHAR(500) NULL DEFAULT NULL,
  \`cover_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`updated_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`schools_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`project_categories\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`icon\` VARCHAR(50) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`project_categories_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`projects\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`project_category_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`school_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`project_name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`short_description\` TEXT NULL,
  \`description\` LONGTEXT NULL,
  \`objective\` TEXT NULL,
  \`budget_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0,
  \`raised_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0,
  \`spent_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0,
  \`start_date\` DATE NULL DEFAULT NULL,
  \`end_date\` DATE NULL DEFAULT NULL,
  \`status\` VARCHAR(30) NOT NULL DEFAULT 'active',
  \`cover_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`updated_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`projects_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`project_updates\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`project_id\` BIGINT UNSIGNED NOT NULL,
  \`content\` LONGTEXT NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`programs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`description\` LONGTEXT NULL,
  \`icon\` VARCHAR(50) NULL DEFAULT NULL,
  \`cover_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'active',
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`programs_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`team_groups\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'active',
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`team_groups_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`team_members\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`team_group_id\` BIGINT UNSIGNED NOT NULL,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`photo\` VARCHAR(500) NULL DEFAULT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`designation\` VARCHAR(255) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`partners\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`logo\` VARCHAR(500) NULL DEFAULT NULL,
  \`partner_type\` VARCHAR(50) NULL DEFAULT NULL,
  \`website\` VARCHAR(255) NULL DEFAULT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`partnership_date\` DATE NULL DEFAULT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`partners_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`beneficiaries\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`beneficiary_type\` VARCHAR(50) NULL DEFAULT NULL,
  \`image\` VARCHAR(500) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`school_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`impact_details\` JSON NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`beneficiaries_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`news\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`content\` LONGTEXT NULL,
  \`featured_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 0,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`published_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`news_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`events\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`location\` VARCHAR(255) NULL DEFAULT NULL,
  \`start_date\` TIMESTAMP NULL DEFAULT NULL,
  \`end_date\` TIMESTAMP NULL DEFAULT NULL,
  \`featured_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`is_published\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`events_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`success_stories\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`summary\` TEXT NULL,
  \`content\` LONGTEXT NULL,
  \`featured_image\` VARCHAR(500) NULL DEFAULT NULL,
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`school_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`seo_title\` VARCHAR(255) NULL DEFAULT NULL,
  \`seo_description\` TEXT NULL,
  \`seo_keywords\` VARCHAR(500) NULL DEFAULT NULL,
  \`published_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`deleted_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`success_stories_slug_unique\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`galleries\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`galleryable_type\` VARCHAR(50) NOT NULL,
  \`galleryable_id\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`title\` VARCHAR(255) NULL DEFAULT NULL,
  \`image_path\` VARCHAR(500) NULL DEFAULT NULL,
  \`video_url\` VARCHAR(500) NULL DEFAULT NULL,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`impact_metrics\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`metricable_type\` VARCHAR(50) NOT NULL,
  \`metricable_id\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`metric_name\` VARCHAR(100) NOT NULL,
  \`metric_value\` DECIMAL(12,2) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`activity_logs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`loggable_type\` VARCHAR(50) NOT NULL,
  \`loggable_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`activity_type\` VARCHAR(50) NULL DEFAULT NULL,
  \`image\` VARCHAR(500) NULL DEFAULT NULL,
  \`activity_date\` DATE NULL DEFAULT NULL,
  \`created_by\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`testimonials\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`designation\` VARCHAR(255) NULL DEFAULT NULL,
  \`photo\` VARCHAR(500) NULL DEFAULT NULL,
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`documents\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`documentable_type\` VARCHAR(50) NOT NULL,
  \`documentable_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`file_path\` VARCHAR(500) NOT NULL,
  \`file_type\` VARCHAR(50) NULL DEFAULT NULL,
  \`file_size\` INT NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`contact_messages\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`subject\` VARCHAR(255) NULL DEFAULT NULL,
  \`message\` TEXT NOT NULL,
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'new',
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`donations\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`donor_name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`amount\` DECIMAL(12,2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'INR',
  \`target_type\` VARCHAR(50) NOT NULL DEFAULT 'general',
  \`village_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`school_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`project_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`message\` TEXT NULL,
  \`is_anonymous\` TINYINT(1) NOT NULL DEFAULT 0,
  \`payment_status\` VARCHAR(30) NOT NULL DEFAULT 'pending',
  \`payment_gateway\` VARCHAR(50) NULL DEFAULT NULL,
  \`receipt_number\` VARCHAR(100) NULL DEFAULT NULL,
  \`transaction_id\` VARCHAR(100) NULL DEFAULT NULL,
  \`stripe_payment_intent_id\` VARCHAR(255) NULL DEFAULT NULL,
  \`donated_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`donation_receipts\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`donation_id\` BIGINT UNSIGNED NOT NULL,
  \`receipt_number\` VARCHAR(100) NOT NULL,
  \`receipt_path\` VARCHAR(500) NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`volunteers\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NULL DEFAULT NULL,
  \`mobile\` VARCHAR(20) NULL DEFAULT NULL,
  \`state\` VARCHAR(100) NULL DEFAULT NULL,
  \`district\` VARCHAR(100) NULL DEFAULT NULL,
  \`occupation\` VARCHAR(255) NULL DEFAULT NULL,
  \`availability\` VARCHAR(50) NULL DEFAULT NULL,
  \`skills\` JSON NULL,
  \`experience\` TEXT NULL,
  \`photo\` VARCHAR(500) NULL DEFAULT NULL,
  \`program_category\` VARCHAR(100) NULL DEFAULT NULL,
  \`status\` VARCHAR(30) NOT NULL DEFAULT 'active',
  \`age\` INT NULL DEFAULT NULL,
  \`volunteer_code\` VARCHAR(20) NULL DEFAULT NULL,
  \`hours_contributed\` INT NOT NULL DEFAULT 0,
  \`projects_joined\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`volunteer_activities\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`volunteer_id\` BIGINT UNSIGNED NOT NULL,
  \`project_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`activity_date\` DATE NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`village_needs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`village_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`priority\` VARCHAR(20) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`status\` VARCHAR(30) NOT NULL DEFAULT 'open',
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`school_requirements\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`school_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`priority\` VARCHAR(20) NULL DEFAULT NULL,
  \`description\` TEXT NULL,
  \`status\` VARCHAR(30) NOT NULL DEFAULT 'open',
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`village_followers\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`village_id\` BIGINT UNSIGNED NOT NULL,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`village_followers_unique\` (\`village_id\`, \`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`school_followers\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`school_id\` BIGINT UNSIGNED NOT NULL,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`school_followers_unique\` (\`school_id\`, \`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`notifications\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
  \`read_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  \`updated_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`audit_logs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`module\` VARCHAR(100) NOT NULL,
  \`record_id\` BIGINT UNSIGNED NULL DEFAULT NULL,
  \`old_values\` JSON NULL,
  \`new_values\` JSON NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const EXPORT_TABLES = {
  states: ['id', 'name', 'code', 'is_active', 'created_at', 'updated_at'],
  districts: ['id', 'state_id', 'name', 'code', 'is_active', 'created_at', 'updated_at'],
  mandals: ['id', 'district_id', 'name', 'code', 'is_active', 'created_at', 'updated_at'],
  roles: ['id', 'name', 'guard_name', 'description', 'created_at', 'updated_at'],
  user_categories: ['id', 'name', 'slug', 'created_at', 'updated_at'],
  settings: ['id', 'key', 'value', 'created_at', 'updated_at'],
  cms_pages: ['id', 'title', 'slug', 'short_description', 'content', 'featured_image', 'seo_title', 'seo_description', 'status', 'display_order', 'created_at', 'updated_at'],
  faqs: ['id', 'question', 'answer', 'sort_order', 'is_active', 'created_at', 'updated_at'],
  project_categories: ['id', 'name', 'slug', 'icon', 'description', 'created_at', 'updated_at'],
  villages: null,
  schools: null,
  projects: null,
  programs: null,
  team_groups: null,
  team_members: null,
  partners: null,
  beneficiaries: null,
  news: null,
  events: null,
  success_stories: null,
  galleries: null,
  impact_metrics: null,
  activity_logs: null,
};

function stripUuidUserId(row) {
  const copy = { ...row };
  if (copy.user_id && typeof copy.user_id === 'string' && copy.user_id.includes('-')) {
    copy.user_id = null;
  }
  if (copy.created_by && typeof copy.created_by === 'string') copy.created_by = null;
  if (copy.updated_by && typeof copy.updated_by === 'string') copy.updated_by = null;
  return copy;
}

function columnsFromRow(row, exclude = []) {
  return Object.keys(row).filter((k) => !exclude.includes(k));
}

async function main() {
  console.log('Fetching Supabase data...');
  const parts = [DDL];

  for (const [table, fixedCols] of Object.entries(EXPORT_TABLES)) {
    const rows = await fetchAll(table);
    console.log(`  ${table}: ${rows.length}`);
    if (!rows.length) {
      parts.push(`-- ${table}: no rows\n\n`);
      continue;
    }
    const cols = fixedCols || columnsFromRow(rows[0]);
    parts.push(
      inserts(table, rows, cols, (r) => {
        const out = { ...r };
        if (table === 'settings' && out.value !== null && typeof out.value === 'object') {
          out.value = JSON.stringify(out.value);
        }
        return stripUuidUserId(out);
      }),
    );
  }

  parts.push(`-- Admin user (login after Laravel API is wired)
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`email_verified_at\`, \`password\`, \`created_at\`, \`updated_at\`) VALUES
(1, 'Admin', 'test@gmail.com', NOW(), '${ADMIN_BCRYPT}', NOW(), NOW());

INSERT INTO \`profiles\` (\`id\`, \`user_id\`, \`full_name\`, \`email\`, \`is_active\`, \`created_at\`, \`updated_at\`) VALUES
(1, 1, 'Admin', 'test@gmail.com', 1, NOW(), NOW());

INSERT INTO \`user_roles\` (\`user_id\`, \`role_id\`) VALUES (1, 1);

SET FOREIGN_KEY_CHECKS = 1;
`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, parts.join(''), 'utf8');
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\nWrote ${outPath} (${sizeKb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
