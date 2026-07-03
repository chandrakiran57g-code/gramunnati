-- CMSRR MySQL schema + seed (generated 2026-07-03 17:13:54)
-- Import on cPanel: phpMyAdmin → Import → cmsrr.sql
-- Admin login: test@gmail.com / testadmin123

-- Import on cPanel: phpMyAdmin → Import → cmsrr.sql

-- CMSRR MySQL schema + seed data
-- Import: cPanel → phpMyAdmin → select your database → Import → choose this file
-- Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ─── Laravel core ───────────────────────────────────────
DROP TABLE IF EXISTS `failed_jobs`;
DROP TABLE IF EXISTS `job_batches`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `cache_locks`;
DROP TABLE IF EXISTS `cache`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `user_category_user`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL DEFAULT NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache` (
  `key` VARCHAR(255) NOT NULL,
  `value` MEDIUMTEXT NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(255) NOT NULL,
  `expiration` INT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL,
  `reserved_at` INT UNSIGNED NULL DEFAULT NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `total_jobs` INT NOT NULL,
  `pending_jobs` INT NOT NULL,
  `failed_jobs` INT NOT NULL,
  `failed_job_ids` LONGTEXT NOT NULL,
  `options` MEDIUMTEXT NULL,
  `cancelled_at` INT NULL DEFAULT NULL,
  `created_at` INT NOT NULL,
  `finished_at` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(255) NOT NULL,
  `connection` TEXT NOT NULL,
  `queue` TEXT NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `exception` LONGTEXT NOT NULL,
  `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── App tables ─────────────────────────────────────────
DROP TABLE IF EXISTS `donation_receipts`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `volunteer_activities`;
DROP TABLE IF EXISTS `volunteers`;
DROP TABLE IF EXISTS `village_followers`;
DROP TABLE IF EXISTS `school_followers`;
DROP TABLE IF EXISTS `village_needs`;
DROP TABLE IF EXISTS `school_requirements`;
DROP TABLE IF EXISTS `project_updates`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `testimonials`;
DROP TABLE IF EXISTS `galleries`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `impact_metrics`;
DROP TABLE IF EXISTS `success_stories`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `beneficiaries`;
DROP TABLE IF EXISTS `partners`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `team_groups`;
DROP TABLE IF EXISTS `programs`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `project_categories`;
DROP TABLE IF EXISTS `schools`;
DROP TABLE IF EXISTS `villages`;
DROP TABLE IF EXISTS `cms_pages`;
DROP TABLE IF EXISTS `faqs`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `user_categories`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `mandals`;
DROP TABLE IF EXISTS `districts`;
DROP TABLE IF EXISTS `states`;

CREATE TABLE `states` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(10) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `districts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(20) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `districts_state_id_index` (`state_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mandals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `district_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(20) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mandals_district_id_index` (`district_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL DEFAULT 'web',
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_unique` (`name`, `guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `first_name` VARCHAR(255) NULL DEFAULT NULL,
  `last_name` VARCHAR(255) NULL DEFAULT NULL,
  `full_name` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `mobile_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `profile_photo` VARCHAR(500) NULL DEFAULT NULL,
  `gender` VARCHAR(20) NULL DEFAULT NULL,
  `date_of_birth` DATE NULL DEFAULT NULL,
  `state_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `district_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `mandal_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `pincode` VARCHAR(10) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_user_id_unique` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_category_user` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `value` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cms_pages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `short_description` TEXT NULL,
  `short_description_te` TEXT NULL DEFAULT NULL,
  `content` LONGTEXT NULL,
  `content_te` LONGTEXT NULL DEFAULT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `video_url` VARCHAR(500) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `question_te` TEXT NULL DEFAULT NULL,
  `answer` LONGTEXT NOT NULL,
  `answer_te` LONGTEXT NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `villages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `district_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `mandal_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `village_name` VARCHAR(255) NOT NULL,
  `village_name_te` VARCHAR(255) NULL DEFAULT NULL,
  `village_code` VARCHAR(50) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `pincode` VARCHAR(10) NULL DEFAULT NULL,
  `latitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `longitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `short_description` TEXT NULL,
  `short_description_te` TEXT NULL DEFAULT NULL,
  `description` LONGTEXT NULL,
  `description_te` LONGTEXT NULL DEFAULT NULL,
  `history` LONGTEXT NULL,
  `history_te` LONGTEXT NULL DEFAULT NULL,
  `population` INT NOT NULL DEFAULT 0,
  `male_population` INT NOT NULL DEFAULT 0,
  `female_population` INT NOT NULL DEFAULT 0,
  `children_count` INT NOT NULL DEFAULT 0,
  `senior_citizen_count` INT NOT NULL DEFAULT 0,
  `literacy_rate` DECIMAL(5,2) NULL DEFAULT NULL,
  `farmer_count` INT NOT NULL DEFAULT 0,
  `cultivable_land` VARCHAR(255) NULL DEFAULT NULL,
  `major_crops` VARCHAR(255) NULL DEFAULT NULL,
  `trees_count` INT NOT NULL DEFAULT 0,
  `water_bodies_count` INT NOT NULL DEFAULT 0,
  `logo` VARCHAR(500) NULL DEFAULT NULL,
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `primary_representative_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `villages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `schools` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `school_name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `school_type` VARCHAR(50) NULL DEFAULT NULL,
  `udise_code` VARCHAR(50) NULL DEFAULT NULL,
  `principal_name` VARCHAR(255) NULL DEFAULT NULL,
  `contact_number` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `website` VARCHAR(255) NULL DEFAULT NULL,
  `student_count` INT NOT NULL DEFAULT 0,
  `teacher_count` INT NOT NULL DEFAULT 0,
  `classroom_count` INT NOT NULL DEFAULT 0,
  `library_available` TINYINT(1) NOT NULL DEFAULT 0,
  `computer_lab_available` TINYINT(1) NOT NULL DEFAULT 0,
  `playground_available` TINYINT(1) NOT NULL DEFAULT 0,
  `drinking_water_available` TINYINT(1) NOT NULL DEFAULT 0,
  `toilet_available` TINYINT(1) NOT NULL DEFAULT 0,
  `electricity_available` TINYINT(1) NOT NULL DEFAULT 0,
  `digital_classroom_available` TINYINT(1) NOT NULL DEFAULT 0,
  `boundary_wall_available` TINYINT(1) NOT NULL DEFAULT 0,
  `logo` VARCHAR(500) NULL DEFAULT NULL,
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schools_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(50) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_category_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `project_name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `short_description` TEXT NULL,
  `short_description_te` TEXT NULL DEFAULT NULL,
  `description` LONGTEXT NULL,
  `description_te` LONGTEXT NULL DEFAULT NULL,
  `objective` TEXT NULL,
  `objective_te` TEXT NULL DEFAULT NULL,
  `budget_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `raised_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `spent_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `updated_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_updates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` BIGINT UNSIGNED NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `description_te` LONGTEXT NULL DEFAULT NULL,
  `icon` VARCHAR(50) NULL DEFAULT NULL,
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `team_groups` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_groups_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `team_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_group_id` BIGINT UNSIGNED NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(500) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `designation` VARCHAR(255) NULL DEFAULT NULL,
  `designation_te` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(500) NULL DEFAULT NULL,
  `partner_type` VARCHAR(50) NULL DEFAULT NULL,
  `website` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `partnership_date` DATE NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partners_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `beneficiaries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `name_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `beneficiary_type` VARCHAR(50) NULL DEFAULT NULL,
  `image` VARCHAR(500) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `impact_details` JSON NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `beneficiaries_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `news` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NULL,
  `content_te` LONGTEXT NULL DEFAULT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `location_te` VARCHAR(255) NULL DEFAULT NULL,
  `start_date` TIMESTAMP NULL DEFAULT NULL,
  `end_date` TIMESTAMP NULL DEFAULT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `success_stories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `summary` TEXT NULL,
  `summary_te` TEXT NULL DEFAULT NULL,
  `content` LONGTEXT NULL,
  `content_te` LONGTEXT NULL DEFAULT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_title_te` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `seo_description_te` TEXT NULL DEFAULT NULL,
  `seo_keywords` VARCHAR(500) NULL DEFAULT NULL,
  `published_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `success_stories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `galleries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `galleryable_type` VARCHAR(50) NOT NULL,
  `galleryable_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `title` VARCHAR(255) NULL DEFAULT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `image_path` VARCHAR(500) NULL DEFAULT NULL,
  `video_url` VARCHAR(500) NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `impact_metrics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `metricable_type` VARCHAR(50) NOT NULL,
  `metricable_id` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `metric_name` VARCHAR(100) NOT NULL,
  `metric_value` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loggable_type` VARCHAR(50) NOT NULL,
  `loggable_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `description_te` TEXT NULL DEFAULT NULL,
  `activity_type` VARCHAR(50) NULL DEFAULT NULL,
  `image` VARCHAR(500) NULL DEFAULT NULL,
  `activity_date` DATE NULL DEFAULT NULL,
  `created_by` BIGINT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `testimonials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `name_te` VARCHAR(255) NULL DEFAULT NULL,
  `content` TEXT NOT NULL,
  `content_te` TEXT NULL DEFAULT NULL,
  `designation` VARCHAR(255) NULL DEFAULT NULL,
  `designation_te` VARCHAR(255) NULL DEFAULT NULL,
  `photo` VARCHAR(500) NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `documentable_type` VARCHAR(50) NOT NULL,
  `documentable_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_te` VARCHAR(255) NULL DEFAULT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50) NULL DEFAULT NULL,
  `file_size` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contact_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `subject` VARCHAR(255) NULL DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `donations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `donor_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `target_type` VARCHAR(50) NOT NULL DEFAULT 'general',
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `project_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `message` TEXT NULL,
  `is_anonymous` TINYINT(1) NOT NULL DEFAULT 0,
  `payment_status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `payment_gateway` VARCHAR(50) NULL DEFAULT NULL,
  `receipt_number` VARCHAR(100) NULL DEFAULT NULL,
  `transaction_id` VARCHAR(100) NULL DEFAULT NULL,
  `stripe_payment_intent_id` VARCHAR(255) NULL DEFAULT NULL,
  `donated_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `donation_receipts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `donation_id` BIGINT UNSIGNED NOT NULL,
  `receipt_number` VARCHAR(100) NOT NULL,
  `receipt_path` VARCHAR(500) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `volunteers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `state` VARCHAR(100) NULL DEFAULT NULL,
  `district` VARCHAR(100) NULL DEFAULT NULL,
  `occupation` VARCHAR(255) NULL DEFAULT NULL,
  `availability` VARCHAR(50) NULL DEFAULT NULL,
  `skills` JSON NULL,
  `experience` TEXT NULL,
  `photo` VARCHAR(500) NULL DEFAULT NULL,
  `program_category` VARCHAR(100) NULL DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `age` INT NULL DEFAULT NULL,
  `volunteer_code` VARCHAR(20) NULL DEFAULT NULL,
  `hours_contributed` INT NOT NULL DEFAULT 0,
  `projects_joined` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `volunteer_activities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `volunteer_id` BIGINT UNSIGNED NOT NULL,
  `project_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `activity_date` DATE NULL DEFAULT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `village_needs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `village_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `priority` VARCHAR(20) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `school_requirements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `priority` VARCHAR(20) NULL DEFAULT NULL,
  `description` TEXT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `village_followers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `village_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `village_followers_unique` (`village_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `school_followers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_followers_unique` (`school_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `record_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin user (login after Laravel API is wired)
SET FOREIGN_KEY_CHECKS = 1;
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'test@gmail.com', NULL, '$2y$12$dOwnCXKL.RotmpVOMYVS2.vkyVxOUl0.ygQvUUYgplITams9POs0O', NULL, '2026-07-03 17:13:52', '2026-07-03 17:13:52');

INSERT INTO `profiles` (`id`, `user_id`, `first_name`, `last_name`, `full_name`, `email`, `mobile`, `mobile_verified_at`, `profile_photo`, `gender`, `date_of_birth`, `state_id`, `district_id`, `mandal_id`, `village_id`, `pincode`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'Admin', 'test@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-07-03 17:13:52', '2026-07-03 17:13:52');

INSERT INTO `roles` (`id`, `name`, `guard_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', 'Full access', '2026-07-03 17:13:52', '2026-07-03 17:13:52'),
(2, 'Member', 'web', 'Default member', '2026-07-03 17:13:52', '2026-07-03 17:13:52');

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1);

INSERT INTO `user_categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Citizen', 'citizen', '2026-07-03 17:13:52', '2026-07-03 17:13:52');

-- user_category_user: no rows

-- personal_access_tokens: no rows

-- password_reset_tokens: no rows

-- sessions: no rows

INSERT INTO `states` (`id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Telangana', 'TS', 1, '2026-07-03 17:13:52', '2026-07-03 17:13:52');

INSERT INTO `districts` (`id`, `state_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Hyderabad', 'HYD', 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53');

INSERT INTO `mandals` (`id`, `district_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ameerpet', 'AMP', 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53');

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'CMSR', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(2, 'site_tagline', 'Common Man Social Responsibility', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(3, 'contact_email', 'contact@cmsr.in', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(4, 'contact_phone', '+91 98765 43210', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(5, 'contact_address', 'Hyderabad, Telangana, India', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(6, 'donation_enabled', 'true', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(7, 'nav_config', '{"items":[{"key":"about-us","label":"About Us","type":"dropdown","enabled":true,"order":0,"source":"cms","navGroup":"about_us"},{"key":"teams","label":"Teams","type":"dropdown","enabled":true,"order":1,"source":"team_groups"},{"key":"what-we-do","label":"What We Do","type":"dropdown","enabled":true,"order":2,"source":"programs"},{"key":"member-list","label":"Member List","type":"link","enabled":true,"order":3,"path":"\\/members"},{"key":"partners","label":"Partner Organizations","type":"link","enabled":true,"order":4,"path":"\\/partners"},{"key":"gallery","label":"Gallery","type":"link","enabled":true,"order":5,"path":"\\/gallery"},{"key":"contact","label":"Contact Us","type":"link","enabled":true,"order":6,"path":"\\/contact"}]}', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(8, 'cms_nav_groups', '{"1":"about_us","2":"about_us","3":"about_us","4":"about_us","5":"about_us","6":"about_us","7":"about_us"}', '2026-07-03 17:13:53', '2026-07-03 17:13:53');

INSERT INTO `cms_pages` (`id`, `title`, `slug`, `short_description`, `content`, `featured_image`, `seo_title`, `seo_description`, `status`, `display_order`, `created_at`, `updated_at`, `title_te`, `short_description_te`, `content_te`, `seo_title_te`, `seo_description_te`, `video_url`) VALUES
(1, 'About CMSR', 'about-cmsr', 'About our mission to empower villages and schools across India.', 'As responsible citizens, we all have a social responsibility towards our communities. Through CMSR, citizens voluntarily come together to support village development and school empowerment across India.', NULL, NULL, NULL, 'active', 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Our Vision', 'our-vision', 'Our Village – Our Responsibility – Our Development', 'By uniting citizens, communities, and institutions on a common platform, we create sustainable, self-reliant model villages and schools.', NULL, NULL, NULL, 'active', 2, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Our Mission', 'our-mission', 'Connecting people to build better villages and schools.', 'Our mission is to create a nationwide digital platform that connects villagers, donors, volunteers, and organizations.', NULL, NULL, NULL, 'active', 3, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'About Villages', 'about-villages', 'Understanding the village development program.', 'The village module allows communities to create digital profiles, track development needs, and receive donations.', NULL, NULL, NULL, 'active', 4, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'About Schools', 'about-schools', 'How we empower rural schools.', 'Our school empowerment program focuses on infrastructure, digital classrooms, and connecting schools with donors.', NULL, NULL, NULL, 'active', 5, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'About Volunteers', 'about-volunteers', 'Join our volunteer network.', 'Volunteers are the backbone of CMSR. Register on the Volunteer page to be matched with relevant projects.', NULL, NULL, NULL, 'active', 6, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'About Donations', 'about-donations', 'How your donations make an impact.', 'Every donation is tracked transparently. Donate to a village, school, or project and see your impact.', NULL, NULL, NULL, 'active', 7, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`, `is_active`, `created_at`, `updated_at`, `question_te`, `answer_te`) VALUES
(1, 'What is CMSR?', 'CMSR (Common Man Social Responsibility) is a nationwide platform connecting citizens to village and school development.', 1, 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(2, 'How do I become a volunteer?', 'Visit the Volunteer page, fill in the registration form with your skills and availability. Our team will review and contact you.', 4, 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL);

INSERT INTO `villages` (`id`, `state_id`, `district_id`, `mandal_id`, `village_name`, `village_code`, `slug`, `pincode`, `latitude`, `longitude`, `short_description`, `description`, `history`, `population`, `male_population`, `female_population`, `children_count`, `senior_citizen_count`, `literacy_rate`, `farmer_count`, `cultivable_land`, `major_crops`, `trees_count`, `water_bodies_count`, `logo`, `cover_image`, `primary_representative_id`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `village_name_te`, `short_description_te`, `description_te`, `history_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 1, 1, 1, 'Kondapur', NULL, 'kondapur', NULL, NULL, NULL, 'Digital classroom and water supply.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, 1, 'Rajapet', NULL, 'rajapet', NULL, NULL, NULL, 'Women SHG and tree plantation.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 1, 1, 'Rampur', NULL, 'rampur', NULL, NULL, NULL, 'Model primary school and computer lab initiative.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `schools` (`id`, `village_id`, `school_name`, `slug`, `school_type`, `udise_code`, `principal_name`, `contact_number`, `email`, `website`, `student_count`, `teacher_count`, `classroom_count`, `library_available`, `computer_lab_available`, `playground_available`, `drinking_water_available`, `toilet_available`, `electricity_available`, `digital_classroom_available`, `boundary_wall_available`, `logo`, `cover_image`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `school_name_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 1, 'ZPHS Kondapur', 'zphs-kondapur', 'government', NULL, NULL, NULL, NULL, NULL, 320, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(2, 3, 'Model Primary School Rampur', 'model-primary-rampur', 'model', NULL, NULL, NULL, NULL, NULL, 200, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL);

INSERT INTO `project_categories` (`id`, `name`, `slug`, `icon`, `description`, `created_at`, `updated_at`, `name_te`, `description_te`) VALUES
(1, 'Water Conservation', 'water-conservation', '💧', NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(2, 'School Development', 'school-development', '🏫', NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(3, 'Tree Plantation', 'tree-plantation', '🌳', NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL);

INSERT INTO `projects` (`id`, `project_category_id`, `village_id`, `school_id`, `project_name`, `slug`, `short_description`, `description`, `objective`, `budget_amount`, `raised_amount`, `spent_amount`, `start_date`, `end_date`, `status`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `project_name_te`, `short_description_te`, `description_te`, `objective_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 1, 1, NULL, 'Water Harvest — Kondapur', 'water-harvest-kondapur', 'Rainwater harvesting for farming families.', NULL, NULL, 500000, 320000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, 1, NULL, 'Digital Classroom — Kondapur', 'digital-classroom-kondapur', 'Smart board, tablets and internet for ZPHS Kondapur.', NULL, NULL, 350000, 210000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 2, NULL, 'Green Drive — Chittoor Belt', 'green-drive-chittoor', 'Large-scale tree plantation across Rajapet villages.', NULL, NULL, 200000, 145000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, 3, 2, 'Computer Lab — Rampur School', 'computer-lab-rampur', 'First computer lab for 200 students at Model Primary School Rampur.', NULL, NULL, 180000, 45000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `programs` (`id`, `title`, `slug`, `description`, `icon`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `status`, `sort_order`, `created_at`, `updated_at`, `title_te`, `description_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 'Village Development', 'village-development', 'Comprehensive rural development initiatives focusing on infrastructure, governance, and community empowerment.', '🏘️', NULL, NULL, NULL, NULL, 'active', 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(2, 'School Empowerment', 'school-empowerment', 'Transforming rural schools through digital classrooms, infrastructure upgrades, and teacher training.', '🏫', NULL, NULL, NULL, NULL, 'active', 2, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(3, 'Tree Plantation', 'tree-plantation', 'Large-scale afforestation drives planting native species and fruit orchards across villages.', '🌳', NULL, NULL, NULL, NULL, 'active', 3, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(4, 'Water Conservation', 'water-conservation', 'Building check dams, rainwater harvesting systems, and rejuvenating traditional water bodies.', '💧', NULL, NULL, NULL, NULL, 'active', 4, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(5, 'Agriculture Development', 'agriculture-development', 'Supporting farmers with modern techniques, organic farming, and market linkages.', '🌾', NULL, NULL, NULL, NULL, 'active', 5, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(6, 'Women SHGs', 'women-shgs', 'Empowering rural women through Self-Help Groups and entrepreneurship programs.', '👩', NULL, NULL, NULL, NULL, 'active', 6, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(7, 'Skill Development', 'skill-development', 'Youth-focused skill training in IT, trades, and entrepreneurship.', '🎓', NULL, NULL, NULL, NULL, 'active', 7, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL),
(8, 'Healthcare', 'healthcare', 'Improving rural healthcare through medical camps and health awareness drives.', '🏥', NULL, NULL, NULL, NULL, 'active', 8, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL, NULL, NULL);

INSERT INTO `team_groups` (`id`, `name`, `slug`, `description`, `status`, `display_order`, `created_at`, `updated_at`, `name_te`, `description_te`) VALUES
(1, 'Core Team', 'core-team', 'The founding and leadership team driving CMSR forward.', 'active', 1, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(2, 'Advisory Board', 'advisory-board', 'Distinguished experts guiding our strategy and governance.', 'active', 2, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(3, 'Technical Team', 'technical-team', 'Engineers and developers building the platform.', 'active', 3, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(4, 'Village Coordinators', 'village-coordinators', 'Field coordinators working directly with villages.', 'active', 4, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL),
(5, 'School Coordinators', 'school-coordinators', 'Coordinators managing school empowerment programs.', 'active', 5, '2026-07-03 17:13:53', '2026-07-03 17:13:53', NULL, NULL);

-- team_members: no rows

-- partners: no rows

-- beneficiaries: no rows

-- news: no rows

-- events: no rows

-- success_stories: no rows

-- galleries: no rows

-- impact_metrics: no rows

-- activity_logs: no rows

-- documents: no rows

-- testimonials: no rows

INSERT INTO `donations` (`id`, `user_id`, `donor_name`, `email`, `mobile`, `amount`, `currency`, `target_type`, `village_id`, `school_id`, `project_id`, `message`, `is_anonymous`, `payment_status`, `payment_gateway`, `receipt_number`, `transaction_id`, `stripe_payment_intent_id`, `donated_at`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Anonymous Donor', NULL, NULL, 5000, 'INR', 'project', NULL, NULL, 1, NULL, 1, 'success', NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(2, NULL, 'Suresh Patel', 'suresh@example.com', NULL, 10000, 'INR', 'project', NULL, NULL, 2, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(3, NULL, 'Meena Devi', 'meena@example.com', NULL, 2500, 'INR', 'village', 1, NULL, NULL, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(4, NULL, 'Corporate CSR Fund', 'csr@example.com', NULL, 50000, 'INR', 'project', NULL, NULL, 3, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-03 17:13:53', '2026-07-03 17:13:53', '2026-07-03 17:13:53');

INSERT INTO `volunteers` (`id`, `user_id`, `full_name`, `email`, `mobile`, `state`, `district`, `occupation`, `availability`, `skills`, `experience`, `photo`, `program_category`, `status`, `age`, `volunteer_code`, `hours_contributed`, `projects_joined`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Priya Sharma', 'priya@example.com', '9876543210', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(2, NULL, 'Ravi Kumar', 'ravi@example.com', '9876543211', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-03 17:13:53', '2026-07-03 17:13:53'),
(3, NULL, 'Anitha Reddy', 'anitha@example.com', '9876543212', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-03 17:13:53', '2026-07-03 17:13:53');

-- contact_messages: no rows

-- notifications: no rows

-- audit_logs: no rows

