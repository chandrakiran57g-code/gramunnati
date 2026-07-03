-- GramUnnati MySQL schema + seed data
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
  `slug` VARCHAR(255) NOT NULL,
  `short_description` TEXT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `answer` LONGTEXT NOT NULL,
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
  `village_code` VARCHAR(50) NULL DEFAULT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `pincode` VARCHAR(10) NULL DEFAULT NULL,
  `latitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `longitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `short_description` TEXT NULL,
  `description` LONGTEXT NULL,
  `history` LONGTEXT NULL,
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
  `seo_description` TEXT NULL,
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
  `seo_description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(50) NULL DEFAULT NULL,
  `description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `short_description` TEXT NULL,
  `description` LONGTEXT NULL,
  `objective` TEXT NULL,
  `budget_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `raised_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `spent_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'active',
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `icon` VARCHAR(50) NULL DEFAULT NULL,
  `cover_image` VARCHAR(500) NULL DEFAULT NULL,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
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
  `description` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(500) NULL DEFAULT NULL,
  `partner_type` VARCHAR(50) NULL DEFAULT NULL,
  `website` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `mobile` VARCHAR(20) NULL DEFAULT NULL,
  `description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `beneficiary_type` VARCHAR(50) NULL DEFAULT NULL,
  `image` VARCHAR(500) NULL DEFAULT NULL,
  `description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
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
  `slug` VARCHAR(255) NOT NULL,
  `summary` TEXT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(500) NULL DEFAULT NULL,
  `village_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `school_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `seo_title` VARCHAR(255) NULL DEFAULT NULL,
  `seo_description` TEXT NULL,
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
  `description` TEXT NULL,
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
  `content` TEXT NOT NULL,
  `designation` VARCHAR(255) NULL DEFAULT NULL,
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

INSERT INTO `states` (`id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Andhra Pradesh', 'AP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'Arunachal Pradesh', 'AR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Assam', 'AS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'Bihar', 'BR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'Chhattisgarh', 'CG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'Goa', 'GA', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'Gujarat', 'GJ', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'Haryana', 'HR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 'Himachal Pradesh', 'HP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 'Jharkhand', 'JH', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(11, 'Karnataka', 'KA', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(12, 'Kerala', 'KL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(13, 'Madhya Pradesh', 'MP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(14, 'Maharashtra', 'MH', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(15, 'Manipur', 'MN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(16, 'Meghalaya', 'ML', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(17, 'Mizoram', 'MZ', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(18, 'Nagaland', 'NL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(19, 'Odisha', 'OD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(20, 'Punjab', 'PB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(21, 'Rajasthan', 'RJ', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(22, 'Sikkim', 'SK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(23, 'Tamil Nadu', 'TN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(24, 'Telangana', 'TG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(25, 'Tripura', 'TR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(26, 'Uttar Pradesh', 'UP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(27, 'Uttarakhand', 'UK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(28, 'West Bengal', 'WB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(29, 'Andaman and Nicobar Islands', 'AN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(30, 'Chandigarh', 'CH', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(31, 'Dadra and Nagar Haveli and Daman and Diu', 'DD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(32, 'Delhi', 'DL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(33, 'Jammu and Kashmir', 'JK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(34, 'Ladakh', 'LA', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(35, 'Lakshadweep', 'LD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(36, 'Puducherry', 'PY', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `districts` (`id`, `state_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 24, 'Hyderabad', 'HYD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 24, 'Rangareddy', 'RNG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 24, 'Medchal-Malkajgiri', 'MCH', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 24, 'Sangareddy', 'SGR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 24, 'Medak', 'MDK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 24, 'Nizamabad', 'NZB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 24, 'Karimnagar', 'KRN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 24, 'Warangal Urban', 'WGU', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 24, 'Warangal Rural', 'WGR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 24, 'Khammam', 'KHM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(11, 24, 'Nalgonda', 'NLG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(12, 24, 'Mahabubnagar', 'MBN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(13, 24, 'Adilabad', 'ADL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(14, 24, 'Siddipet', 'SDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(15, 24, 'Suryapet', 'SYP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(16, 24, 'Jagtial', 'JGT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(17, 24, 'Peddapalli', 'PDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(18, 24, 'Kamareddy', 'KMR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(19, 24, 'Mancherial', 'MCR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(20, 24, 'Nirmal', 'NRM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(21, 24, 'Yadadri Bhuvanagiri', 'YDB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(22, 24, 'Jogulamba Gadwal', 'JGG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(23, 24, 'Wanaparthy', 'WNP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(24, 24, 'Nagarkurnool', 'NKL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(25, 24, 'Jangaon', 'JGN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(26, 24, 'Bhupalpally', 'BHP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(27, 24, 'Mulugu', 'MLG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(28, 24, 'Narayanpet', 'NRP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(29, 24, 'Vikarabad', 'VKB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(30, 24, 'Rajanna Sircilla', 'RSC', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(31, 24, 'Mahabubabad', 'MBD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(32, 24, 'Kumuram Bheem Asifabad', 'KBA', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(33, 1, 'Anantapur', 'ATP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(34, 1, 'Chittoor', 'CTR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(35, 1, 'East Godavari', 'EGD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(36, 1, 'Guntur', 'GNT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(37, 1, 'Krishna', 'KRN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(38, 1, 'Kurnool', 'KNL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(39, 1, 'Nellore', 'NLR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(40, 1, 'Prakasam', 'PKS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(41, 1, 'Srikakulam', 'SKM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(42, 1, 'Visakhapatnam', 'VSP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(43, 1, 'Vizianagaram', 'VZN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(44, 1, 'West Godavari', 'WGD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(45, 1, 'YSR Kadapa', 'KDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(46, 1, 'Palnadu', 'PLN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(47, 1, 'Bapatla', 'BPT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(48, 1, 'Eluru', 'ELR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(49, 1, 'NTR', 'NTR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(50, 1, 'Kakinada', 'KKD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(51, 1, 'Konaseema', 'KNS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(52, 1, 'Anakapalli', 'ANK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(53, 1, 'Alluri Sitharama Raju', 'ASR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(54, 1, 'Parvathipuram Manyam', 'PVM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(55, 1, 'Nandyal', 'NDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(56, 1, 'Tirupati', 'TPT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(57, 1, 'Annamaya', 'ANM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(58, 1, 'Sri Sathya Sai', 'SSS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(59, 11, 'Bengaluru Urban', 'BLR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(60, 11, 'Bengaluru Rural', 'BRR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(61, 11, 'Mysuru', 'MYS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(62, 11, 'Mangaluru', 'MNG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(63, 11, 'Hubli-Dharwad', 'HBL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(64, 11, 'Belagavi', 'BLG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(65, 11, 'Kalaburagi', 'KLB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(66, 11, 'Ballari', 'BLR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(67, 11, 'Raichur', 'RCH', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(68, 11, 'Tumakuru', 'TMK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(69, 11, 'Shivamogga', 'SHM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(70, 11, 'Hassan', 'HSN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(71, 11, 'Mandya', 'MND', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(72, 11, 'Kodagu', 'KDG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(73, 11, 'Udupi', 'UDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(74, 14, 'Mumbai City', 'MUM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(75, 14, 'Mumbai Suburban', 'MMS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(76, 14, 'Pune', 'PUN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(77, 14, 'Nagpur', 'NGP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(78, 14, 'Thane', 'THN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(79, 14, 'Nashik', 'NSK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(80, 14, 'Aurangabad', 'AUR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(81, 14, 'Kolhapur', 'KHP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(82, 14, 'Solapur', 'SLP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(83, 14, 'Satara', 'STR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(84, 14, 'Ratnagiri', 'RTN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(85, 14, 'Sangli', 'SNG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(86, 23, 'Chennai', 'CHN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(87, 23, 'Coimbatore', 'CBE', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(88, 23, 'Madurai', 'MDR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(89, 23, 'Salem', 'SLM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(90, 23, 'Tiruchirappalli', 'TRC', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(91, 23, 'Tirunelveli', 'TNV', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(92, 23, 'Erode', 'ERD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(93, 23, 'Vellore', 'VLR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(94, 23, 'Thanjavur', 'TNJ', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(95, 23, 'Kanchipuram', 'KPM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(96, 23, 'Dindigul', 'DDG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(97, 23, 'Thoothukudi', 'TUT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(98, 7, 'Ahmedabad', 'AMD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(99, 7, 'Surat', 'SRT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(100, 7, 'Vadodara', 'VDD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(101, 7, 'Rajkot', 'RJK', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(102, 7, 'Bhavnagar', 'BHV', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(103, 7, 'Jamnagar', 'JMN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(104, 7, 'Junagadh', 'JNG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(105, 7, 'Gandhinagar', 'GNR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(106, 7, 'Kutch', 'KTC', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(107, 26, 'Lucknow', 'LKN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(108, 26, 'Kanpur Nagar', 'KNP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(109, 26, 'Varanasi', 'VNS', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(110, 26, 'Agra', 'AGR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(111, 26, 'Allahabad', 'ALD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(112, 26, 'Gorakhpur', 'GKP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(113, 26, 'Meerut', 'MRT', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(114, 26, 'Ghaziabad', 'GZB', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(115, 26, 'Noida', 'NOI', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(116, 26, 'Bareilly', 'BRY', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(117, 26, 'Moradabad', 'MBD', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(118, 26, 'Aligarh', 'ALG', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(119, 21, 'Jaipur', 'JPR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(120, 21, 'Jodhpur', 'JDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(121, 21, 'Udaipur', 'UDP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(122, 21, 'Kota', 'KTA', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(123, 21, 'Ajmer', 'AJM', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(124, 21, 'Bikaner', 'BKN', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(125, 21, 'Alwar', 'ALR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(126, 21, 'Sikar', 'SKR', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(127, 21, 'Bharatpur', 'BHP', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(128, 32, 'Central Delhi', 'CDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(129, 32, 'East Delhi', 'EDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(130, 32, 'New Delhi', 'NDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(131, 32, 'North Delhi', 'NDL2', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(132, 32, 'South Delhi', 'SDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(133, 32, 'West Delhi', 'WDL', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `mandals` (`id`, `district_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ameerpet', 'AMP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(2, 1, 'Bahadurpura', 'BHP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(3, 1, 'Bandlaguda', 'BDG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(4, 1, 'Charminar', 'CHM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(5, 1, 'Golconda', 'GLC', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(6, 1, 'Himayatnagar', 'HMG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(7, 1, 'Khairatabad', 'KHB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(8, 1, 'Musheerabad', 'MSB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(9, 1, 'Nampally', 'NMP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(10, 1, 'Secunderabad', 'SCB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(11, 1, 'Asifnagar', 'ASN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(12, 1, 'Jubilee Hills', 'JBH', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(13, 1, 'Marredpally', 'MRP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(14, 1, 'Mettuguda', 'MTG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(15, 1, 'Tarnaka', 'TNK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(16, 1, 'Amberpet', 'ABP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(17, 2, 'Shamshabad', 'SMB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(18, 2, 'Rajendranagar', 'RJN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(19, 2, 'Maheshwaram', 'MHW', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(20, 2, 'Shadnagar', 'SDN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(21, 2, 'Tandur', 'TND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(22, 2, 'Pargi', 'PRG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(23, 2, 'Chevella', 'CVL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(24, 2, 'Moinabad', 'MNB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(25, 2, 'Shankarpally', 'SKP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(26, 2, 'Shamirpet', 'SMP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(27, 2, 'Medchal', 'MCL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(28, 2, 'Ibrahimpatnam', 'IBP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(29, 2, 'Hayathnagar', 'HYT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(30, 2, 'Kandukur', 'KDR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(31, 2, 'Yacharam', 'YCM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(32, 2, 'Abdullapurmet', 'ABD', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(33, 2, 'Amangal', 'AMG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(34, 2, 'Nawabpet', 'NWB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(35, 14, 'Siddipet', 'SDP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(36, 14, 'Dubbak', 'DBK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(37, 14, 'Gajwel', 'GJW', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(38, 14, 'Husnabad', 'HSN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(39, 14, 'Kohir', 'KHR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(40, 14, 'Nanganoor', 'NNG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(41, 14, 'Thoguta', 'TGT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(42, 14, 'Cheriyal', 'CRL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(43, 14, 'Markook', 'MRK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(44, 14, 'Mirdoddi', 'MRD', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(45, 14, 'Akkannapet', 'AKP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(46, 7, 'Karimnagar', 'KRN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(47, 7, 'Huzurabad', 'HZB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(48, 7, 'Kothapally', 'KTP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(49, 7, 'Choppadandi', 'CHP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(50, 7, 'Gangadhara', 'GNG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(51, 7, 'Manakondur', 'MKN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(52, 7, 'Shankarapatnam', 'SKP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(53, 7, 'Thimmapur', 'TMP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(54, 7, 'Veenavanka', 'VNK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(55, 7, 'Saidapur', 'SDP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(56, 7, 'Chigurumamidi', 'CGM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(57, 7, 'Ellandakunta', 'ELK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(58, 11, 'Nalgonda', 'NLG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(59, 11, 'Miryalaguda', 'MRG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(60, 11, 'Devarakonda', 'DVK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(61, 11, 'Nakrekal', 'NKR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(62, 11, 'Kattangoor', 'KTG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(63, 11, 'Haliya', 'HLY', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(64, 11, 'Marriguda', 'MRG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(65, 11, 'Thripuraram', 'TPR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(66, 11, 'Kanagal', 'KNG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(67, 11, 'Munugode', 'MNG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(68, 11, 'Nidamanoor', 'NDM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(69, 11, 'Pedda Adiserla Pally', 'PAS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(70, 11, 'Chandampet', 'CMP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(71, 36, 'Guntur', 'GNT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(72, 36, 'Tenali', 'TNL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(73, 36, 'Mangalagiri', 'MGL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(74, 36, 'Sattenapalli', 'STN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(75, 36, 'Pedanandipadu', 'PND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(76, 36, 'Prathipadu', 'PTP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(77, 36, 'Tadikonda', 'TDK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(78, 36, 'Chebrolu', 'CBR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(79, 36, 'Ponnekallu', 'PNK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(80, 36, 'Vatticherukuru', 'VCK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(81, 42, 'Visakhapatnam', 'VSP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(82, 42, 'Gajuwaka', 'GJW', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(83, 42, 'Bheemunipatnam', 'BHP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(84, 42, 'Padmanabham', 'PDN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(85, 42, 'Pendurthi', 'PND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(86, 42, 'Gopalapatnam', 'GPL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(87, 42, 'Anakapalle', 'ANK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(88, 42, 'Narsipatnam', 'NRS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(89, 42, 'Madugula', 'MDG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(90, 59, 'Bengaluru North', 'BLN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(91, 59, 'Bengaluru South', 'BLS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(92, 59, 'Bengaluru East', 'BLE', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(93, 59, 'Anekal', 'ANK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(94, 59, 'Yelahanka', 'YLH', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(95, 76, 'Pune City', 'PNC', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(96, 76, 'Haveli', 'HVL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(97, 76, 'Mulshi', 'MLS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(98, 76, 'Maval', 'MVL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(99, 76, 'Bhor', 'BHR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(100, 76, 'Velhe', 'VLH', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(101, 76, 'Purandar', 'PUR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(102, 76, 'Baramati', 'BRM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(103, 76, 'Indapur', 'IND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(104, 76, 'Daund', 'DND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(105, 76, 'Shirur', 'SHR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(106, 76, 'Junnar', 'JNR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(107, 76, 'Ambegaon', 'AMB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(108, 76, 'Khed', 'KHD', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(109, 86, 'Egmore-Nungambakkam', 'EGM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(110, 86, 'Mylapore-Triplicane', 'MYL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(111, 86, 'Mambalam-Guindy', 'MBG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(112, 86, 'Perambur-Purasawalkam', 'PPW', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(113, 86, 'Tondiarpet', 'TDP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(114, 86, 'Ambattur', 'AMB', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(115, 86, 'Madhavaram', 'MDV', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(116, 86, 'Sholinganallur', 'SHG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(117, 86, 'Alandur', 'ALD', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(118, 98, 'Ahmedabad City', 'AMC', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(119, 98, 'Daskroi', 'DSK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(120, 98, 'Sanand', 'SND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(121, 98, 'Bavla', 'BVL', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(122, 98, 'Dholka', 'DHK', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(123, 98, 'Dhandhuka', 'DND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(124, 98, 'Viramgam', 'VRM', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(125, 98, 'Detroj-Rampura', 'DTR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(126, 98, 'Mandal', 'MND', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(127, 107, 'Lucknow', 'LKN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(128, 107, 'Mohanlalganj', 'MLG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(129, 107, 'Bakshi Ka Talab', 'BKT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(130, 107, 'Sarojini Nagar', 'SRN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(131, 107, 'Malihabad', 'MLH', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(132, 107, 'Chinhat', 'CHT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(133, 107, 'Kakori', 'KKR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(134, 107, 'Gosainganj', 'GSN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(135, 119, 'Jaipur', 'JPR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(136, 119, 'Sanganer', 'SNG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(137, 119, 'Amer', 'AMR', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(138, 119, 'Jamwa Ramgarh', 'JRG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(139, 119, 'Bassi', 'BSS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(140, 119, 'Chaksu', 'CKS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(141, 119, 'Dudu', 'DDU', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(142, 119, 'Phagi', 'PHG', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(143, 119, 'Kotputli', 'KPT', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(144, 119, 'Viratnagar', 'VRN', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(145, 119, 'Shahpura', 'SHP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(146, 130, 'Connaught Place', 'CP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(147, 130, 'Chanakya Puri', 'CKP', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06'),
(148, 130, 'Parliament Street', 'PLS', 1, '2026-06-16 15:03:06', '2026-06-16 15:03:06');

INSERT INTO `roles` (`id`, `name`, `guard_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', 'Full access to everything — users, villages, schools, projects, donations, settings, audit logs', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'Content Manager', 'web', 'Manages CMS pages, news, events, testimonials, gallery, SEO. Cannot edit villages/schools', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Village Representative', 'web', 'Edit village profile/stats/gallery/documents/needs/projects/reports for assigned villages', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'School Representative', 'web', 'Edit school profile/infrastructure/requirements/projects/gallery for assigned schools', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'Member', 'web', 'Base role — profile, follow, bookmark, donate, view own data', '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `user_categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Citizen', 'citizen', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'Villager', 'villager', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Volunteer', 'volunteer', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'Donor', 'donor', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'NRV', 'nrv', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'Student', 'student', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'Professional', 'professional', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'Entrepreneur', 'entrepreneur', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 'Teacher', 'teacher', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 'Farmer', 'farmer', '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'GramUnnati', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'site_tagline', 'Village Development & School Empowerment Platform', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'site_logo', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'site_favicon', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'contact_email', 'contact@gramunnati.in', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'contact_phone', '+91 98765 43210', '2026-06-16 14:32:47', '2026-06-22 16:00:49'),
(7, 'contact_address', 'Hyderabad, Telangana, India', '2026-06-16 14:32:47', '2026-06-22 16:00:49'),
(8, 'upi_id', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 'razorpay_key', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 'razorpay_secret', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(11, 'donation_enabled', 'true', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(12, 'seo_title', 'GramUnnati — Village Development & School Empowerment Platform', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(13, 'seo_description', 'A nationwide platform empowering villages and schools across India through donations, volunteer programs, and community-driven initiatives.', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(14, 'og_image', '', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(15, 'maintenance_mode', 'false', '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(16, 'nav_config', '{"items":[{"key":"about-us","label":"About Us","type":"dropdown","enabled":true,"order":0,"source":"cms","navGroup":"about_us"},{"key":"teams","label":"Teams","type":"dropdown","enabled":true,"order":1,"source":"team_groups"},{"key":"what-we-do","label":"What We Do","type":"dropdown","enabled":true,"order":3,"source":"programs"},{"key":"member-list","label":"Member List","type":"link","enabled":true,"order":2,"path":"/members"},{"key":"partners","label":"Partner Organizations","type":"link","enabled":true,"order":4,"path":"/partners"},{"key":"gallery","label":"Gallery","type":"link","enabled":true,"order":5,"path":"/gallery"},{"key":"contact","label":"Contact Us","type":"link","enabled":true,"order":6,"path":"/contact"}]}', '2026-06-22 15:34:12', '2026-06-22 17:32:57'),
(17, 'cms_nav_groups', '{"1":"about_us","2":"about_us","8":"about_us","12":"about_us"}', '2026-06-22 15:34:12', '2026-06-23 05:08:16'),
(20, 'gallery_collections', '[{"id":"kondapur-village","category":"Villages","title":"Kondapur Village Development","location":"Telangana","coverSrc":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","media":[{"id":"k1","type":"image","src":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","caption":"Village landscape overview"},{"id":"k2","type":"image","src":"https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80","caption":"Community gathering"},{"id":"k3","type":"image","src":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","caption":"Water conservation work"},{"id":"kv1","type":"video","embedId":"dQw4w9WgXcQ","caption":"GramUnnati Village Transformation Journey"}]},{"id":"new-school-building","category":"Schools","title":"New School Building","location":"Andhra Pradesh","coverSrc":"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80","media":[{"id":"s1","type":"image","src":"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80","caption":"New school building exterior"},{"id":"s2","type":"image","src":"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80","caption":"Classroom interior"},{"id":"sv1","type":"video","embedId":"dQw4w9WgXcQ","caption":"Digital Classroom Success Story"}]},{"id":"tree-plantation","category":"Projects","title":"Tree Plantation Drive","location":"Karnataka","coverSrc":"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80","media":[{"id":"p1","type":"image","src":"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80","caption":"Volunteers planting saplings"},{"id":"p2","type":"image","src":"https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80","caption":"Green belt development"},{"id":"pv1","type":"video","embedId":"dQw4w9WgXcQ","caption":"Mega Tree Plantation Drive 2026"}]},{"id":"water-conservation","category":"Villages","title":"Water Conservation Project","location":"Maharashtra","coverSrc":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","media":[{"id":"w1","type":"image","src":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","caption":"Rainwater harvesting structure"},{"id":"w2","type":"image","src":"https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80","caption":"Irrigation channel repair"}]},{"id":"digital-classroom","category":"Schools","title":"Digital Classroom Setup","location":"Tamil Nadu","coverSrc":"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80","media":[{"id":"d1","type":"image","src":"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80","caption":"Smart classroom with tablets"},{"id":"d2","type":"image","src":"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80","caption":"Students using digital tools"}]},{"id":"volunteer-training","category":"Events","title":"Volunteer Training Camp","location":"Delhi","coverSrc":"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80","media":[{"id":"e1","type":"image","src":"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80","caption":"Volunteer orientation session"},{"id":"e2","type":"image","src":"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80","caption":"Team building activities"}]},{"id":"agriculture-development","category":"Projects","title":"Agriculture Development","location":"Punjab","coverSrc":"https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80","media":[{"id":"a1","type":"image","src":"https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80","caption":"Farmer training workshop"},{"id":"a2","type":"image","src":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","caption":"Organic farming demo plot"}]},{"id":"community-meeting","category":"Villages","title":"Community Meeting","location":"UP","coverSrc":"https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80","media":[{"id":"c1","type":"image","src":"https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80","caption":"Gram sabha discussion"},{"id":"c2","type":"image","src":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80","caption":"Women leaders addressing village"}]},{"id":"annual-review","category":"Events","title":"Annual Review Meet","location":"Hyderabad","coverSrc":"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80","media":[{"id":"r1","type":"image","src":"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80","caption":"Annual review presentation"},{"id":"r2","type":"image","src":"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80","caption":"Stakeholder networking"}]},{"id":"library-donation","category":"Schools","title":"Library Books Donation","location":"West Bengal","coverSrc":"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80","media":[{"id":"l1","type":"image","src":"https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80","caption":"New library shelves"},{"id":"l2","type":"image","src":"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80","caption":"Students receiving books"}]},{"id":"women-shg","category":"Projects","title":"Women SHG Workshop","location":"Odisha","coverSrc":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80","media":[{"id":"shg1","type":"image","src":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80","caption":"SHG skill training session"},{"id":"shg2","type":"image","src":"https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=800&q=80","caption":"Group savings meeting"}]},{"id":"solar-power","category":"Villages","title":"Solar Power Installation","location":"Rajasthan","coverSrc":"https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80","media":[{"id":"sol1","type":"image","src":"https://images.unsplash.com/photo-1509391111720-9e9a4fd3e2cd?w=800&q=80","caption":"Solar panels on community hall"},{"id":"sol2","type":"image","src":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","caption":"Street lighting installation"}]}]', '2026-06-22 15:43:05', '2026-06-24 14:09:05'),
(26, 'featured_testimonials', '[{"id":"t1","name":"Priya Sharma","message":"GramUnnati helped our village get clean water and a digital school. Truly life-changing work.","designation":"Village Representative","is_featured":true,"sort_order":1},{"id":"t2","name":"Ramesh Goud","message":"I donated to the tree plantation project and saw the impact within months.","designation":"Donor","is_featured":true,"sort_order":2},{"id":"t3","name":"Sunita Reddy","message":"As a teacher, the digital classroom training opened new possibilities for my students.","designation":"School Teacher","is_featured":true,"sort_order":3}]', '2026-06-22 16:00:47', '2026-06-22 16:00:47'),
(48, 'active_work_store', '{"categories":[{"id":"cat-villages","name":"Active Villages","slug":"active-villages","view_all_link":"/active-works/category/active-villages","display_order":0,"status":"active","entity_type":"village"},{"id":"cat-schools","name":"Active Schools","slug":"active-schools","view_all_link":"/active-works/category/active-schools","display_order":1,"status":"active","entity_type":"school"},{"id":"cat-village-development","name":"Village Development","slug":"active-village-development","template_type":"village-development","program_slug":"village-development","view_all_link":"/active-works/category/active-village-development","display_order":10,"status":"active"},{"id":"cat-school-empowerment","name":"School Empowerment","slug":"active-school-empowerment","template_type":"school-empowerment","program_slug":"school-empowerment","view_all_link":"/active-works/category/active-school-empowerment","display_order":11,"status":"active"},{"id":"cat-tree-plantation","name":"Tree Plantation","slug":"active-tree-plantation","template_type":"tree-plantation","program_slug":"tree-plantation","view_all_link":"/active-works/category/active-tree-plantation","display_order":12,"status":"active"},{"id":"cat-water-conservation","name":"Water Conservation","slug":"active-water-conservation","template_type":"water-conservation","program_slug":"water-conservation","view_all_link":"/active-works/category/active-water-conservation","display_order":13,"status":"active"},{"id":"cat-agriculture-development","name":"Agriculture Development","slug":"active-agriculture-development","template_type":"agriculture-development","program_slug":"agriculture-development","view_all_link":"/active-works/category/active-agriculture-development","display_order":14,"status":"active"},{"id":"cat-women-shgs","name":"Women SHGs","slug":"active-women-shgs","template_type":"women-shgs","program_slug":"women-shgs","view_all_link":"/active-works/category/active-women-shgs","display_order":15,"status":"active"},{"id":"cat-skill-development","name":"Skill Development","slug":"active-skill-development","template_type":"skill-development","program_slug":"skill-development","view_all_link":"/active-works/category/active-skill-development","display_order":16,"status":"active"},{"id":"cat-healthcare","name":"Healthcare","slug":"active-healthcare","template_type":"healthcare","program_slug":"healthcare","view_all_link":"/active-works/category/active-healthcare","display_order":17,"status":"active"},{"id":"cat-custom-frdsd","name":"Active frdsd","slug":"active-frdsd","template_type":"frdsd","entity_type":"custom","icon":"📋","view_all_link":"/active-works/category/active-frdsd","display_order":2,"status":"active"}],"items":[{"impact":{},"development_score":{},"overview":{},"statistics":{},"timeline":[],"gallery":[],"donations":{},"programs":[],"program_details":{"objectives":"","activities":"","impact_highlights":""},"location":{},"card":{"enable_donate":true,"enable_details":true},"seo":{},"name":"dsfsfdg","slug":"dsfsfdg","cover_image":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","description":"sdfdwsf","template_type":"village","status":"active","display_order":0,"category_id":"cat-villages","link":"/active-work/dsfsfdg","id":"aw-1782834888297-u63xcp","featured":true},{"impact":{},"development_score":{},"overview":{},"statistics":{},"timeline":[],"gallery":[],"donations":{},"programs":[],"program_details":{"objectives":"","activities":"","impact_highlights":""},"location":{},"card":{"enable_donate":true,"enable_details":true},"seo":{},"name":"nbvbvcn","slug":"nbvbvcn","cover_image":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","description":"gnhvcbn ","template_type":"frdsd","status":"active","display_order":0,"category_id":"cat-custom-frdsd","link":"/active-work/nbvbvcn","id":"aw-1782836085945-lf98lw","featured":true}],"entity_templates":[{"icon":"📋","display_order":2,"status":"active","name":"frdsd","slug":"frdsd","id":"tpl-1782836076397-30r3ma","category_id":"cat-custom-frdsd"}]}', '2026-06-25 14:49:48', '2026-06-30 16:14:45'),
(56, 'needs_support_store', '{"items":[{"id":"ns-1782832146006-9s1nxi","name":"Agriculture Support — Kondapur","slug":"agri-support-kondapur","cover_image":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","description":"Seeds, tools, and training for small farmers.","village_name":"Kondapur","village_slug":"kondapur","funding_goal":200000,"raised_amount":75000,"project_id":6,"status":"active","display_order":0,"_source":"store"},{"id":"ns-1782832146006-4tmx6l","name":"Tree Plantation — Rajapet","slug":"tree-plantation-rajapet","cover_image":"https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80","description":"10,000 saplings across community land.","village_name":"Rajapet","village_slug":"rajapet","funding_goal":150000,"raised_amount":95000,"project_id":4,"status":"active","display_order":1,"_source":"store"},{"id":"ns-1782832146006-if6fei","name":"Water Harvest — Kondapur","slug":"water-harvest-kondapur","cover_image":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","description":"Rainwater harvesting for farming families.","village_name":"Kondapur","village_slug":"kondapur","funding_goal":250000,"raised_amount":180000,"project_id":3,"status":"active","display_order":2,"_source":"store"},{"id":"ns-1782832146006-s65l4z","name":"Digital Classroom — Rampur","slug":"digital-classroom-rampur","cover_image":"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80","description":"Smart classroom with tablets and internet.","village_name":"Rampur","village_slug":"rampur","funding_goal":400000,"raised_amount":320000,"project_id":5,"status":"active","display_order":3,"_source":"store"},{"id":"ns-1782833020208-7476jn","name":"tghfg","slug":"tghfg","cover_image":"","description":"gfhgf","village_name":"ghfgfh","village_slug":"","funding_goal":435435,"raised_amount":435435453,"project_id":null,"program_category":"village-development","status":"active","display_order":0},{"id":"ns-1782833763959-075idr","name":"cvcxzvc","slug":"cvcxzvc","cover_image":"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80","description":"cxvcxvxz","village_name":"xcvcxv","village_slug":"","funding_goal":3445,"raised_amount":453345,"project_id":null,"program_category":"school-empowerment","status":"active","display_order":0}]}', '2026-06-30 15:09:05', '2026-06-30 15:36:03');

INSERT INTO `cms_pages` (`id`, `title`, `slug`, `short_description`, `content`, `featured_image`, `seo_title`, `seo_description`, `status`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'About GramUnnati', 'about-gramunnati', 'About our mission to empower villages and schools across India.', 'As responsible citizens, we all have a social responsibility towards our communities and society. Through GramUnnati, citizens can voluntarily come together to support village development and school empowerment across India. Our platform connects villagers, students, employees, NRVs, volunteers, donors, professionals, schools, and organizations to participate in building sustainable, self-reliant villages.', '', '', '', 'active', 1, '2026-06-16 14:32:47', '2026-06-23 04:45:14'),
(2, 'Our Vision', 'our-vision', 'Our Village – Our Responsibility – Our Development', 'By uniting citizens, communities, professionals, institutions, and stakeholders on a common platform, we can create sustainable, self-reliant, and model villages and schools that serve as examples for future generations. Our vision is "Our Village – Our Responsibility – Our Development" (మన గ్రామం – మన బాధ్యత – మన అభివృద్ధి).', '', '', '', 'active', 2, '2026-06-16 14:32:47', '2026-06-23 04:44:32'),
(3, 'Our Mission', 'our-mission', 'Connecting people to build better villages and schools.', 'Our mission is to create a nationwide digital platform that connects villagers, donors, volunteers, professionals, and organizations to participate in comprehensive village and school development. We aim to empower every village with a digital identity and provide transparent, impactful channels for community-driven development.', NULL, NULL, NULL, 'active', 3, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'About Villages', 'about-villages', 'Understanding the village development program.', 'The village module allows communities to create digital profiles for their villages, track development needs, manage projects, and receive donations. Each village gets a comprehensive page with demographics, infrastructure status, development areas, timeline, gallery, and donation tracking.', NULL, NULL, NULL, 'active', 5, '2026-06-16 14:32:47', '2026-06-22 17:31:38'),
(6, 'About Schools', 'about-schools', 'How we empower rural schools.', 'Our school empowerment program focuses on improving infrastructure, providing digital classrooms, supplying educational materials, and connecting schools with donors and volunteers. Each registered school gets a detailed profile tracking infrastructure availability, student counts, requirements, and project progress.', NULL, NULL, NULL, 'active', 6, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'About Volunteers', 'about-volunteers', 'Join our volunteer network.', 'Volunteers are the backbone of GramUnnati. Whether you can contribute time, skills, or expertise, there is a role for everyone. Our platform matches volunteers with projects based on skills, availability, and location. Track your hours, earn certificates, and make a real impact.', NULL, NULL, NULL, 'active', 7, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'About Donations', 'about-donations', 'How your donations make an impact.', 'Every donation is tracked transparently on our platform. You can donate to a specific village, school, or project, or make a general contribution. We provide detailed fund utilization reports, donation receipts (80G when available), and impact tracking so you can see exactly how your contribution is making a difference.', '', '', '', 'active', 8, '2026-06-16 14:32:47', '2026-06-23 04:46:25'),
(12, 'Benificiary', 'benificiary', '', '', '', '', '', 'active', 9, '2026-06-23 05:08:15', '2026-06-23 05:08:15');

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'What is GramUnnati?', 'GramUnnati is a nationwide digital platform connecting villagers, students, donors, volunteers, and organizations to participate in village and school development across India. Our vision is "Our Village – Our Responsibility – Our Development."', 1, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'How can I donate?', 'You can donate via the Donate page. Choose to support a specific village, school, or project, or make a general donation. We accept UPI, credit/debit cards, net banking, and bank transfers.', 2, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Is my donation tax deductible?', 'GramUnnati is working towards 80G certification. Currently, donations may not be tax-deductible. We will notify all donors once certification is obtained.', 3, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'How do I become a volunteer?', 'Visit the Become Volunteer page, fill in your details including skills and availability, and join our growing network of change-makers. Once registered, you can join projects and log your volunteer hours.', 4, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'How are villages selected?', 'Any village across India can be registered on the platform by its community members or representatives. Village representatives can create a digital profile, list needs, and manage development projects.', 5, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'Can I track how my donation is used?', 'Yes! We maintain complete transparency. Each village and project page shows fund utilization details. Registered donors can track their donation impact through their dashboard.', 6, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'How is the donated money used?', 'Donations are used directly for the specified purpose (village, school, or project). GramUnnati maintains transparency by publishing fund utilization reports on each village and project page.', 7, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'How can my organization partner with GramUnnati?', 'We welcome partnerships with NGOs, companies, educational institutions, and government organizations. Visit our Partners page or contact us to explore collaboration opportunities.', 8, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 'Is GramUnnati available in my language?', 'Currently, GramUnnati is available in English and Telugu. We plan to add more Indian languages in future versions to make the platform accessible to all communities.', 9, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 'How can I register my village or school?', 'Contact us through the Contact page or register on the platform. Our team will guide you through the village/school registration process and help set up your digital profile.', 10, 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `project_categories` (`id`, `name`, `slug`, `icon`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Village Development', 'village-development', '🏘️', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'School Development', 'school-development', '🏫', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Tree Plantation', 'tree-plantation', '🌳', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'Water Conservation', 'water-conservation', '💧', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'Agriculture', 'agriculture', '🌾', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'Healthcare', 'healthcare', '🏥', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'Skill Development', 'skill-development', '🎓', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'Women SHG', 'women-shg', '👩', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(9, 'Infrastructure', 'infrastructure', '🏗️', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(10, 'Employment Generation', 'employment-generation', '💼', NULL, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `villages` (`id`, `state_id`, `district_id`, `mandal_id`, `village_name`, `village_code`, `slug`, `pincode`, `latitude`, `longitude`, `short_description`, `description`, `history`, `population`, `male_population`, `female_population`, `children_count`, `senior_citizen_count`, `literacy_rate`, `farmer_count`, `cultivable_land`, `major_crops`, `trees_count`, `water_bodies_count`, `logo`, `cover_image`, `primary_representative_id`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(6, 24, 1, 1, 'Kondapur', NULL, 'kondapur', NULL, NULL, NULL, 'Digital classroom and water supply — village on the rise.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:51', '2026-06-22 15:59:51', NULL),
(7, 24, 1, 1, 'Rajapet', NULL, 'rajapet', NULL, NULL, NULL, 'Women SHG and tree plantation bringing greenery back.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL),
(8, 24, 1, 1, 'Rampur', NULL, 'rampur', NULL, NULL, NULL, 'First computer lab — children connecting to the digital world.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL);

INSERT INTO `schools` (`id`, `village_id`, `school_name`, `slug`, `school_type`, `udise_code`, `principal_name`, `contact_number`, `email`, `website`, `student_count`, `teacher_count`, `classroom_count`, `library_available`, `computer_lab_available`, `playground_available`, `drinking_water_available`, `toilet_available`, `electricity_available`, `digital_classroom_available`, `boundary_wall_available`, `logo`, `cover_image`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(5, 6, 'ZPHS Kondapur', 'zphs-kondapur', 'government', NULL, NULL, NULL, NULL, NULL, 320, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL),
(8, 7, 'Zilla Parishad High School', 'zilla-parishad-high-school', 'government', NULL, 'AAA', NULL, NULL, NULL, 200, 10, 10, 1, 0, 0, 0, 1, 1, 0, 1, NULL, NULL, 0, 1, NULL, NULL, NULL, NULL, NULL, '2026-06-22 18:27:18', '2026-06-25 14:51:36', NULL);

INSERT INTO `projects` (`id`, `project_category_id`, `village_id`, `school_id`, `project_name`, `slug`, `short_description`, `description`, `objective`, `budget_amount`, `raised_amount`, `spent_amount`, `start_date`, `end_date`, `status`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 4, 6, NULL, 'Water Harvest — Kondapur', 'water-harvest-kondapur', 'Rainwater harvesting for farming families.', NULL, NULL, 250000, 180000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL),
(4, 3, 7, NULL, 'Tree Plantation — Rajapet', 'tree-plantation-rajapet', '10,000 saplings across community land.', NULL, NULL, 150000, 95000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL),
(5, 2, 8, 7, 'Digital Classroom — Rampur', 'digital-classroom-rampur', 'Smart classroom with tablets and internet.', NULL, NULL, 400000, 320000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL),
(6, 5, 6, NULL, 'Agriculture Support — Kondapur', 'agri-support-kondapur', 'Seeds, tools, and training for small farmers.', NULL, NULL, 200000, 75000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-06-22 15:59:52', '2026-06-22 15:59:52', NULL);

INSERT INTO `programs` (`id`, `title`, `slug`, `description`, `icon`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Village Development', 'village-development', 'Comprehensive rural development initiatives focusing on infrastructure, governance, and community empowerment to create self-reliant model villages across India.', '🏘️', NULL, NULL, NULL, NULL, 'active', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'School Empowerment', 'school-empowerment', 'Transforming rural schools through digital classrooms, infrastructure upgrades, teacher training, and student scholarship programs.', '🏫', NULL, NULL, NULL, NULL, 'active', 2, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(3, 'Tree Plantation', 'tree-plantation', 'Large-scale afforestation drives planting native species, fruit orchards, and medicinal plants to restore village ecosystems and combat climate change.', '🌳', NULL, NULL, NULL, NULL, 'active', 3, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'Water Conservation', 'water-conservation', 'Building check dams, farm ponds, rainwater harvesting systems, and rejuvenating traditional water bodies for sustainable water security.', '💧', NULL, NULL, NULL, NULL, 'active', 4, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'Agriculture Development', 'agriculture-development', 'Supporting farmers with modern techniques, organic farming, FPO formation, market linkages, and crop diversification for improved livelihoods.', '🌾', NULL, NULL, NULL, NULL, 'active', 5, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(6, 'Women SHGs', 'women-shgs', 'Empowering rural women through Self-Help Groups, micro-enterprise training, financial literacy, and entrepreneurship development programs.', '👩', NULL, NULL, NULL, NULL, 'active', 6, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(7, 'Skill Development', 'skill-development', 'Youth-focused skill training in IT, trades, healthcare, and entrepreneurship to generate employment and reduce rural-urban migration.', '🎓', NULL, NULL, NULL, NULL, 'active', 7, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(8, 'Healthcare', 'healthcare', 'Improving rural healthcare through medical camps, health awareness drives, telemedicine, and primary health center support.', '🏥', NULL, NULL, NULL, NULL, 'active', 8, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `team_groups` (`id`, `name`, `slug`, `description`, `status`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Core Team', 'core-team', 'The founding and leadership team driving GramUnnati forward.', 'active', 1, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(2, 'Advisory Board', 'advisory-board', 'Distinguished experts guiding our strategy and governance.', 'active', 2, '2026-06-16 14:32:47', '2026-06-22 15:36:28'),
(3, 'Technical Team', 'technical-team', 'Engineers and developers building the platform.', 'active', 3, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(4, 'Village Coordinators', 'village-coordinators', 'Field coordinators working directly with villages.', 'active', 4, '2026-06-16 14:32:47', '2026-06-16 14:32:47'),
(5, 'School Coordinators', 'school-coordinators', 'Coordinators managing school empowerment programs.', 'active', 5, '2026-06-16 14:32:47', '2026-06-16 14:32:47');

INSERT INTO `team_members` (`id`, `team_group_id`, `full_name`, `photo`, `email`, `mobile`, `designation`, `description`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 1, 'B Srinivas Reddy', NULL, 'bsreddy.smart@gmail.com', '9515312900', 'Founder & Director', '', 1, 1, '2026-06-22 15:59:52', '2026-06-26 09:59:08'),
(4, 2, 'Dr. Anitha Rao', NULL, 'anitha@gramunnati.in', NULL, 'Advisory Chair', NULL, 1, 1, '2026-06-22 15:59:52', '2026-06-22 15:59:52'),
(5, 3, 'Arjun Mehta', NULL, 'arjun@gramunnati.in', NULL, 'Technical Lead', NULL, 1, 1, '2026-06-22 15:59:52', '2026-06-22 15:59:52'),
(6, 4, 'Suresh Reddy', NULL, NULL, '+91 98765 43210', 'Village Coordinator — Kondapur', NULL, 1, 1, '2026-06-22 15:59:52', '2026-06-22 15:59:52'),
(7, 5, 'Lakshmi Devi', NULL, NULL, '+91 98765 43211', 'School Coordinator — Rampur', NULL, 1, 1, '2026-06-22 15:59:52', '2026-06-22 15:59:52'),
(8, 1, 'K Ravi', NULL, 'aaaa@gamil.com', NULL, 'Director', NULL, 0, 1, '2026-06-23 04:51:15', '2026-06-23 04:51:15');

INSERT INTO `partners` (`id`, `name`, `slug`, `logo`, `partner_type`, `website`, `email`, `mobile`, `description`, `partnership_date`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'Green Earth Foundation', 'green-earth-foundation', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80', 'ngo', NULL, NULL, NULL, 'Environmental and tree plantation partner.', NULL, 1, '2026-06-22 15:59:53', '2026-06-22 15:59:53'),
(4, 'Rural Education Trust', 'rural-edu-trust', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80', 'ngo', NULL, NULL, NULL, 'School infrastructure and digital learning.', NULL, 1, '2026-06-22 15:59:53', '2026-06-22 15:59:53'),
(7, 'Water For All Initiative', 'water-for-all', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80', 'company', NULL, NULL, NULL, 'Water conservation and harvesting projects.', NULL, 1, '2026-06-22 16:00:11', '2026-06-22 16:00:11');

INSERT INTO `beneficiaries` (`id`, `name`, `slug`, `beneficiary_type`, `image`, `description`, `village_id`, `school_id`, `impact_details`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'Kondapur Farmer Cooperative', 'kondapur-farmers', 'village', NULL, '120 farming families benefiting from water projects.', 6, NULL, NULL, 1, '2026-06-22 16:00:11', '2026-06-22 16:00:11'),
(4, 'Rampur School Children', 'rampur-students', 'school', NULL, '200 students with new digital classroom access.', NULL, 7, NULL, 1, '2026-06-22 16:00:11', '2026-06-22 16:00:11'),
(5, 'Rajapet Women SHG', 'rajapet-women-shg', 'village', NULL, '45 women entrepreneurs in self-help groups.', 7, NULL, NULL, 1, '2026-06-22 16:00:11', '2026-06-22 16:00:11');

INSERT INTO `news` (`id`, `title`, `slug`, `content`, `featured_image`, `is_published`, `seo_title`, `seo_description`, `seo_keywords`, `published_at`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'GramUnnati Platform Launch 2026', 'gramunnati-launch-2026', 'GramUnnati officially launches to connect villages, schools, and donors across rural India.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', 1, NULL, NULL, NULL, '2026-06-22 16:00:11', NULL, '2026-06-22 16:00:11', '2026-06-22 16:00:11', NULL),
(4, '1,000 Saplings Planted in Rajapet', '1000-saplings-planted', 'Volunteers and villagers planted 1,000 native trees as part of the green belt initiative.', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', 1, NULL, NULL, NULL, '2026-06-22 16:00:11', NULL, '2026-06-22 16:00:11', '2026-06-22 16:00:11', NULL);

INSERT INTO `events` (`id`, `title`, `slug`, `description`, `location`, `start_date`, `end_date`, `featured_image`, `is_published`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Volunteer Training Camp — March 2026', 'volunteer-training-march-2026', 'Orientation for new village and school coordinators.', 'Hyderabad', '2026-03-15 09:00:00', '2026-03-16 17:00:00', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80', 1, NULL, '2026-06-22 16:00:11', '2026-06-22 16:00:11', NULL),
(4, 'Digital Literacy Drive', 'digital-literacy-drive', 'Free computer training for rural school teachers.', 'Rampur', '2026-04-01 10:00:00', '2026-04-01 16:00:00', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, NULL, '2026-06-22 16:00:11', '2026-06-22 16:00:11', NULL);

INSERT INTO `success_stories` (`id`, `title`, `slug`, `summary`, `content`, `featured_image`, `village_id`, `school_id`, `is_featured`, `seo_title`, `seo_description`, `seo_keywords`, `published_at`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(3, 'Kondapur Water Transformation', 'kondapur-water-success', 'How rainwater harvesting changed farming outcomes.', 'After installing harvesting structures, 120 families now have reliable irrigation through dry seasons.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 6, NULL, 1, NULL, NULL, NULL, '2026-06-22 16:00:11', NULL, '2026-06-22 16:00:11', '2026-06-22 16:00:11', NULL),
(4, 'Rampur Digital Classroom Success', 'rampur-digital-classroom', 'Students learning coding for the first time.', 'The new smart classroom serves 200 students with tablets, projectors, and internet connectivity.', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, 7, 1, NULL, NULL, NULL, '2026-06-22 16:00:11', NULL, '2026-06-22 16:00:11', '2026-06-25 15:06:02', NULL);

INSERT INTO `galleries` (`id`, `galleryable_type`, `galleryable_id`, `title`, `image_path`, `video_url`, `sort_order`, `created_at`, `updated_at`) VALUES
(3, 'village', 0, 't3', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', NULL, 0, '2026-06-22 15:42:21', '2026-06-22 15:42:21');

INSERT INTO `impact_metrics` (`id`, `metricable_type`, `metricable_id`, `metric_name`, `metric_value`, `created_at`, `updated_at`) VALUES
(3, 'site', 0, 'villages', 3, '2026-06-22 16:00:12', '2026-06-22 16:00:48'),
(4, 'site', 0, 'schools', 3, '2026-06-22 16:00:12', '2026-06-22 16:00:48'),
(5, 'site', 0, 'projects', 4, '2026-06-22 16:00:13', '2026-06-22 16:00:48'),
(6, 'site', 0, 'beneficiaries', 365, '2026-06-22 16:00:13', '2026-06-22 16:00:48'),
(7, 'site', 0, 'volunteers', 77, '2026-06-22 16:00:13', '2026-06-22 16:00:48');

INSERT INTO `activity_logs` (`id`, `loggable_type`, `loggable_id`, `title`, `description`, `activity_type`, `image`, `activity_date`, `created_by`, `created_at`, `updated_at`) VALUES
(4, 'school', 7, 'Digital classroom inaugurated', NULL, 'milestone', NULL, '2026-06-22', NULL, '2026-06-22 16:00:14', '2026-06-22 16:00:14'),
(5, 'site', 0, '1,000 trees planted in Rajapet', NULL, 'event', NULL, '2026-06-22', NULL, '2026-06-22 16:00:14', '2026-06-22 16:00:14'),
(11, 'village', 6, 'Water harvesting structure completed', NULL, 'update', NULL, '2026-06-22', NULL, '2026-06-22 16:00:49', '2026-06-22 16:00:49');

-- Admin user (login after Laravel API is wired)
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'test@gmail.com', NOW(), '$2y$12$MxOblVaqIN/bmfHXD5A.luy0qc/0tElgsks/MnSZlFbZrCed53W1i', NOW(), NOW());

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `email`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Admin', 'test@gmail.com', 1, NOW(), NOW());

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1);

SET FOREIGN_KEY_CHECKS = 1;
