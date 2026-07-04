-- CMSRR MySQL schema + seed (generated 2026-07-04 16:15:31)
-- Import on cPanel: phpMyAdmin → Import → cmsrr.sql
-- Admin login: test@gmail.com / testadmin123

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `email_verified_at` TIMESTAMP NULL,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `full_name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `mobile_verified_at` TIMESTAMP NULL,
  `profile_photo` VARCHAR(255) NULL,
  `gender` VARCHAR(255) NULL,
  `date_of_birth` DATE NULL,
  `state_id` BIGINT UNSIGNED NULL,
  `district_id` BIGINT UNSIGNED NULL,
  `mandal_id` BIGINT UNSIGNED NULL,
  `village_id` BIGINT UNSIGNED NULL,
  `pincode` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `guard_name` VARCHAR(255) NOT NULL DEFAULT 'web',
  `description` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_categories`;
CREATE TABLE `user_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_category_user`;
CREATE TABLE `user_category_user` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `abilities` LONGTEXT NULL,
  `last_used_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(255) NULL,
  `user_agent` LONGTEXT NULL,
  `payload` LONGTEXT NOT NULL,
  `last_activity` INT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `states`;
CREATE TABLE `states` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `districts`;
CREATE TABLE `districts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `mandals`;
CREATE TABLE `mandals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `district_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(255) NOT NULL,
  `value` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cms_pages`;
CREATE TABLE `cms_pages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `short_description` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `short_description_te` LONGTEXT NULL,
  `content_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  `video_url` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `faqs`;
CREATE TABLE `faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `question` LONGTEXT NOT NULL,
  `answer` LONGTEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `question_te` LONGTEXT NULL,
  `answer_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `villages`;
CREATE TABLE `villages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `state_id` BIGINT UNSIGNED NULL,
  `district_id` BIGINT UNSIGNED NULL,
  `mandal_id` BIGINT UNSIGNED NULL,
  `village_name` VARCHAR(255) NOT NULL,
  `village_code` VARCHAR(255) NULL,
  `slug` VARCHAR(255) NOT NULL,
  `pincode` VARCHAR(255) NULL,
  `latitude` DECIMAL(14, 2) NULL,
  `longitude` DECIMAL(14, 2) NULL,
  `short_description` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `history` LONGTEXT NULL,
  `population` INT NOT NULL DEFAULT '0',
  `male_population` INT NOT NULL DEFAULT '0',
  `female_population` INT NOT NULL DEFAULT '0',
  `children_count` INT NOT NULL DEFAULT '0',
  `senior_citizen_count` INT NOT NULL DEFAULT '0',
  `literacy_rate` DECIMAL(14, 2) NULL,
  `farmer_count` INT NOT NULL DEFAULT '0',
  `cultivable_land` VARCHAR(255) NULL,
  `major_crops` VARCHAR(255) NULL,
  `trees_count` INT NOT NULL DEFAULT '0',
  `water_bodies_count` INT NOT NULL DEFAULT '0',
  `logo` VARCHAR(255) NULL,
  `cover_image` VARCHAR(255) NULL,
  `primary_representative_id` BIGINT UNSIGNED NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `village_name_te` VARCHAR(255) NULL,
  `short_description_te` LONGTEXT NULL,
  `description_te` LONGTEXT NULL,
  `history_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `schools`;
CREATE TABLE `schools` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `village_id` BIGINT UNSIGNED NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `school_type` VARCHAR(255) NULL,
  `udise_code` VARCHAR(255) NULL,
  `principal_name` VARCHAR(255) NULL,
  `contact_number` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `student_count` INT NOT NULL DEFAULT '0',
  `teacher_count` INT NOT NULL DEFAULT '0',
  `classroom_count` INT NOT NULL DEFAULT '0',
  `library_available` TINYINT(1) NOT NULL DEFAULT '0',
  `computer_lab_available` TINYINT(1) NOT NULL DEFAULT '0',
  `playground_available` TINYINT(1) NOT NULL DEFAULT '0',
  `drinking_water_available` TINYINT(1) NOT NULL DEFAULT '0',
  `toilet_available` TINYINT(1) NOT NULL DEFAULT '0',
  `electricity_available` TINYINT(1) NOT NULL DEFAULT '0',
  `digital_classroom_available` TINYINT(1) NOT NULL DEFAULT '0',
  `boundary_wall_available` TINYINT(1) NOT NULL DEFAULT '0',
  `logo` VARCHAR(255) NULL,
  `cover_image` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `school_name_te` VARCHAR(255) NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  `short_description` LONGTEXT NULL,
  `short_description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `project_categories`;
CREATE TABLE `project_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `name_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_category_id` BIGINT UNSIGNED NULL,
  `village_id` BIGINT UNSIGNED NULL,
  `school_id` BIGINT UNSIGNED NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `short_description` LONGTEXT NULL,
  `description` LONGTEXT NULL,
  `objective` LONGTEXT NULL,
  `budget_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0',
  `raised_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0',
  `spent_amount` DECIMAL(14, 2) NOT NULL DEFAULT '0',
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `cover_image` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `updated_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `project_name_te` VARCHAR(255) NULL,
  `short_description_te` LONGTEXT NULL,
  `description_te` LONGTEXT NULL,
  `objective_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `programs`;
CREATE TABLE `programs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `icon` VARCHAR(255) NULL,
  `cover_image` VARCHAR(255) NULL,
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `sort_order` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `team_groups`;
CREATE TABLE `team_groups` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `display_order` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `name_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_group_id` BIGINT UNSIGNED NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `designation` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `display_order` INT NOT NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `designation_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(255) NULL,
  `partner_type` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `partnership_date` DATE NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `name_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `beneficiaries`;
CREATE TABLE `beneficiaries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `beneficiary_type` VARCHAR(255) NULL,
  `image` VARCHAR(255) NULL,
  `description` LONGTEXT NULL,
  `village_id` BIGINT UNSIGNED NULL,
  `school_id` BIGINT UNSIGNED NULL,
  `impact_details` LONGTEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `name_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(255) NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT '0',
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `published_at` TIMESTAMP NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `content_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  `summary` LONGTEXT NULL,
  `summary_te` LONGTEXT NULL,
  `category` VARCHAR(255) NULL DEFAULT 'general',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `location` VARCHAR(255) NULL,
  `start_date` TIMESTAMP NULL,
  `end_date` TIMESTAMP NULL,
  `featured_image` VARCHAR(255) NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT '0',
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  `location_te` VARCHAR(255) NULL,
  `registration_link` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `success_stories`;
CREATE TABLE `success_stories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `summary` LONGTEXT NULL,
  `content` LONGTEXT NULL,
  `featured_image` VARCHAR(255) NULL,
  `village_id` BIGINT UNSIGNED NULL,
  `school_id` BIGINT UNSIGNED NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  `seo_title` VARCHAR(255) NULL,
  `seo_description` LONGTEXT NULL,
  `seo_keywords` VARCHAR(255) NULL,
  `published_at` TIMESTAMP NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `deleted_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `summary_te` LONGTEXT NULL,
  `content_te` LONGTEXT NULL,
  `seo_title_te` VARCHAR(255) NULL,
  `seo_description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `galleries`;
CREATE TABLE `galleries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `galleryable_type` VARCHAR(255) NOT NULL,
  `galleryable_id` BIGINT UNSIGNED NOT NULL DEFAULT '0',
  `title` VARCHAR(255) NULL,
  `image_path` VARCHAR(255) NULL,
  `video_url` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `impact_metrics`;
CREATE TABLE `impact_metrics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `metricable_type` VARCHAR(255) NOT NULL,
  `metricable_id` BIGINT UNSIGNED NOT NULL DEFAULT '0',
  `metric_name` VARCHAR(255) NOT NULL,
  `metric_value` DECIMAL(14, 2) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loggable_type` VARCHAR(255) NOT NULL,
  `loggable_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `activity_type` VARCHAR(255) NULL,
  `image` VARCHAR(255) NULL,
  `activity_date` DATE NULL,
  `created_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  `description_te` LONGTEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `documentable_type` VARCHAR(255) NOT NULL,
  `documentable_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(255) NULL,
  `file_size` INT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `title_te` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `designation` VARCHAR(255) NULL,
  `photo` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT '0',
  `sort_order` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `name_te` VARCHAR(255) NULL,
  `content_te` LONGTEXT NULL,
  `designation_te` VARCHAR(255) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `donations`;
CREATE TABLE `donations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `donor_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `amount` DECIMAL(14, 2) NOT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'INR',
  `target_type` VARCHAR(255) NOT NULL DEFAULT 'general',
  `village_id` BIGINT UNSIGNED NULL,
  `school_id` BIGINT UNSIGNED NULL,
  `project_id` BIGINT UNSIGNED NULL,
  `message` LONGTEXT NULL,
  `is_anonymous` TINYINT(1) NOT NULL DEFAULT '0',
  `payment_status` VARCHAR(255) NOT NULL DEFAULT 'pending',
  `payment_gateway` VARCHAR(255) NULL,
  `receipt_number` VARCHAR(255) NULL,
  `transaction_id` VARCHAR(255) NULL,
  `stripe_payment_intent_id` VARCHAR(255) NULL,
  `donated_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `volunteers`;
CREATE TABLE `volunteers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `state` VARCHAR(255) NULL,
  `district` VARCHAR(255) NULL,
  `occupation` VARCHAR(255) NULL,
  `availability` VARCHAR(255) NULL,
  `skills` LONGTEXT NULL,
  `experience` LONGTEXT NULL,
  `photo` VARCHAR(255) NULL,
  `program_category` VARCHAR(255) NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'active',
  `age` INT NULL,
  `volunteer_code` VARCHAR(255) NULL,
  `hours_contributed` INT NOT NULL DEFAULT '0',
  `projects_joined` INT NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `mobile` VARCHAR(255) NULL,
  `subject` VARCHAR(255) NULL,
  `message` LONGTEXT NOT NULL,
  `status` VARCHAR(255) NOT NULL DEFAULT 'new',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT '0',
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(255) NOT NULL,
  `module` VARCHAR(255) NOT NULL,
  `record_id` BIGINT UNSIGNED NULL,
  `old_values` LONGTEXT NULL,
  `new_values` LONGTEXT NULL,
  `created_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'test@gmail.com', NULL, '$2y$12$qrdxALlT0myHjr7H44JEPOtBQ51XLXjqgRQVNNai8D3BhRS9VvsTi', NULL, '2026-07-04 16:08:14', '2026-07-04 16:08:14');

INSERT INTO `profiles` (`id`, `user_id`, `first_name`, `last_name`, `full_name`, `email`, `mobile`, `mobile_verified_at`, `profile_photo`, `gender`, `date_of_birth`, `state_id`, `district_id`, `mandal_id`, `village_id`, `pincode`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'Admin', 'test@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-07-04 16:08:15', '2026-07-04 16:08:15');

INSERT INTO `roles` (`id`, `name`, `guard_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', 'Full access', '2026-07-04 16:08:10', '2026-07-04 16:08:10'),
(2, 'Member', 'web', 'Default member', '2026-07-04 16:08:11', '2026-07-04 16:08:11');

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1);

INSERT INTO `user_categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'Citizen', 'citizen', '2026-07-04 16:08:11', '2026-07-04 16:08:11');

-- user_category_user: no rows

-- personal_access_tokens: no rows

-- password_reset_tokens: no rows

-- sessions: no rows

INSERT INTO `states` (`id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Telangana', 'TS', 1, '2026-07-04 16:08:15', '2026-07-04 16:08:15');

INSERT INTO `districts` (`id`, `state_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Hyderabad', 'HYD', 1, '2026-07-04 16:08:15', '2026-07-04 16:08:15');

INSERT INTO `mandals` (`id`, `district_id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Ameerpet', 'AMP', 1, '2026-07-04 16:08:15', '2026-07-04 16:08:15');

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'site_name', 'CMSR', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(2, 'site_tagline', 'Common Man Social Responsibility', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(3, 'contact_email', 'contact@cmsr.in', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(4, 'contact_phone', '+91 98765 43210', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(5, 'contact_address', 'Hyderabad, Telangana, India', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(6, 'donation_enabled', 'true', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(7, 'nav_config', '{"items":[{"key":"about-us","label":"About Us","type":"dropdown","enabled":true,"order":0,"source":"cms","navGroup":"about_us"},{"key":"teams","label":"Teams","type":"dropdown","enabled":true,"order":1,"source":"team_groups"},{"key":"what-we-do","label":"What We Do","type":"dropdown","enabled":true,"order":2,"source":"programs"},{"key":"member-list","label":"Member List","type":"link","enabled":true,"order":3,"path":"\\/members"},{"key":"partners","label":"Partner Organizations","type":"link","enabled":true,"order":4,"path":"\\/partners"},{"key":"gallery","label":"Gallery","type":"link","enabled":true,"order":5,"path":"\\/gallery"},{"key":"contact","label":"Contact Us","type":"link","enabled":true,"order":6,"path":"\\/contact"}]}', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(8, 'cms_nav_groups', '{"1":"about_us","2":"about_us","3":"about_us","4":"about_us","5":"about_us","6":"about_us","7":"about_us"}', '2026-07-04 16:08:16', '2026-07-04 16:08:16');

INSERT INTO `cms_pages` (`id`, `title`, `slug`, `short_description`, `content`, `featured_image`, `seo_title`, `seo_description`, `status`, `display_order`, `created_at`, `updated_at`, `title_te`, `short_description_te`, `content_te`, `seo_title_te`, `seo_description_te`, `video_url`) VALUES
(1, 'About CMSR', 'about-cmsr', 'About our mission to empower villages and schools across India.', 'As responsible citizens, we all have a social responsibility towards our communities. Through CMSR, citizens voluntarily come together to support village development and school empowerment across India.', NULL, NULL, NULL, 'active', 1, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Our Vision', 'our-vision', 'Our Village – Our Responsibility – Our Development', 'By uniting citizens, communities, and institutions on a common platform, we create sustainable, self-reliant model villages and schools.', NULL, NULL, NULL, 'active', 2, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Our Mission', 'our-mission', 'Connecting people to build better villages and schools.', 'Our mission is to create a nationwide digital platform that connects villagers, donors, volunteers, and organizations.', NULL, NULL, NULL, 'active', 3, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'About Villages', 'about-villages', 'Understanding the village development program.', 'The village module allows communities to create digital profiles, track development needs, and receive donations.', NULL, NULL, NULL, 'active', 4, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'About Schools', 'about-schools', 'How we empower rural schools.', 'Our school empowerment program focuses on infrastructure, digital classrooms, and connecting schools with donors.', NULL, NULL, NULL, 'active', 5, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'About Volunteers', 'about-volunteers', 'Join our volunteer network.', 'Volunteers are the backbone of CMSR. Register on the Volunteer page to be matched with relevant projects.', NULL, NULL, NULL, 'active', 6, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'About Donations', 'about-donations', 'How your donations make an impact.', 'Every donation is tracked transparently. Donate to a village, school, or project and see your impact.', NULL, NULL, NULL, 'active', 7, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `faqs` (`id`, `question`, `answer`, `sort_order`, `is_active`, `created_at`, `updated_at`, `question_te`, `answer_te`) VALUES
(1, 'What is CMSR?', 'CMSR (Common Man Social Responsibility) is a nationwide platform connecting citizens to village and school development.', 1, 1, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(2, 'How do I become a volunteer?', 'Visit the Volunteer page, fill in the registration form with your skills and availability. Our team will review and contact you.', 4, 1, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL);

INSERT INTO `villages` (`id`, `state_id`, `district_id`, `mandal_id`, `village_name`, `village_code`, `slug`, `pincode`, `latitude`, `longitude`, `short_description`, `description`, `history`, `population`, `male_population`, `female_population`, `children_count`, `senior_citizen_count`, `literacy_rate`, `farmer_count`, `cultivable_land`, `major_crops`, `trees_count`, `water_bodies_count`, `logo`, `cover_image`, `primary_representative_id`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `village_name_te`, `short_description_te`, `description_te`, `history_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 1, 1, 1, 'Kondapur', NULL, 'kondapur', NULL, NULL, NULL, 'Digital classroom and water supply.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, 1, 'Rajapet', NULL, 'rajapet', NULL, NULL, NULL, 'Women SHG and tree plantation.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 1, 1, 'Rampur', NULL, 'rampur', NULL, NULL, NULL, 'Model primary school and computer lab initiative.', NULL, NULL, 0, 0, 0, 0, 0, NULL, 0, NULL, NULL, 0, 0, NULL, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `schools` (`id`, `village_id`, `school_name`, `slug`, `school_type`, `udise_code`, `principal_name`, `contact_number`, `email`, `website`, `student_count`, `teacher_count`, `classroom_count`, `library_available`, `computer_lab_available`, `playground_available`, `drinking_water_available`, `toilet_available`, `electricity_available`, `digital_classroom_available`, `boundary_wall_available`, `logo`, `cover_image`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `school_name_te`, `seo_title_te`, `seo_description_te`, `short_description`, `short_description_te`) VALUES
(1, 1, 'ZPHS Kondapur', 'zphs-kondapur', 'government', NULL, NULL, NULL, NULL, NULL, 320, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 3, 'Model Primary School Rampur', 'model-primary-rampur', 'model', NULL, NULL, NULL, NULL, NULL, 200, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', 1, 1, NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `project_categories` (`id`, `name`, `slug`, `icon`, `description`, `created_at`, `updated_at`, `name_te`, `description_te`) VALUES
(1, 'Water Conservation', 'water-conservation', '💧', NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(2, 'School Development', 'school-development', '🏫', NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(3, 'Tree Plantation', 'tree-plantation', '🌳', NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL);

INSERT INTO `projects` (`id`, `project_category_id`, `village_id`, `school_id`, `project_name`, `slug`, `short_description`, `description`, `objective`, `budget_amount`, `raised_amount`, `spent_amount`, `start_date`, `end_date`, `status`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `project_name_te`, `short_description_te`, `description_te`, `objective_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 1, 1, NULL, 'Water Harvest — Kondapur', 'water-harvest-kondapur', 'Rainwater harvesting for farming families.', NULL, NULL, 500000, 320000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, 1, NULL, 'Digital Classroom — Kondapur', 'digital-classroom-kondapur', 'Smart board, tablets and internet for ZPHS Kondapur.', NULL, NULL, 350000, 210000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 3, 2, NULL, 'Green Drive — Chittoor Belt', 'green-drive-chittoor', 'Large-scale tree plantation across Rajapet villages.', NULL, NULL, 200000, 145000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2, 3, 2, 'Computer Lab — Rampur School', 'computer-lab-rampur', 'First computer lab for 200 students at Model Primary School Rampur.', NULL, NULL, 180000, 45000, 0, NULL, NULL, 'active', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80', NULL, NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO `programs` (`id`, `title`, `slug`, `description`, `icon`, `cover_image`, `seo_title`, `seo_description`, `seo_keywords`, `status`, `sort_order`, `created_at`, `updated_at`, `title_te`, `description_te`, `seo_title_te`, `seo_description_te`) VALUES
(1, 'Village Development', 'village-development', 'Comprehensive rural development initiatives focusing on infrastructure, governance, and community empowerment.', '🏘️', NULL, NULL, NULL, NULL, 'active', 1, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(2, 'School Empowerment', 'school-empowerment', 'Transforming rural schools through digital classrooms, infrastructure upgrades, and teacher training.', '🏫', NULL, NULL, NULL, NULL, 'active', 2, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(3, 'Tree Plantation', 'tree-plantation', 'Large-scale afforestation drives planting native species and fruit orchards across villages.', '🌳', NULL, NULL, NULL, NULL, 'active', 3, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(4, 'Water Conservation', 'water-conservation', 'Building check dams, rainwater harvesting systems, and rejuvenating traditional water bodies.', '💧', NULL, NULL, NULL, NULL, 'active', 4, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(5, 'Agriculture Development', 'agriculture-development', 'Supporting farmers with modern techniques, organic farming, and market linkages.', '🌾', NULL, NULL, NULL, NULL, 'active', 5, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(6, 'Women SHGs', 'women-shgs', 'Empowering rural women through Self-Help Groups and entrepreneurship programs.', '👩', NULL, NULL, NULL, NULL, 'active', 6, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(7, 'Skill Development', 'skill-development', 'Youth-focused skill training in IT, trades, and entrepreneurship.', '🎓', NULL, NULL, NULL, NULL, 'active', 7, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL),
(8, 'Healthcare', 'healthcare', 'Improving rural healthcare through medical camps and health awareness drives.', '🏥', NULL, NULL, NULL, NULL, 'active', 8, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL, NULL, NULL);

INSERT INTO `team_groups` (`id`, `name`, `slug`, `description`, `status`, `display_order`, `created_at`, `updated_at`, `name_te`, `description_te`) VALUES
(1, 'Core Team', 'core-team', 'The founding and leadership team driving CMSR forward.', 'active', 1, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(2, 'Advisory Board', 'advisory-board', 'Distinguished experts guiding our strategy and governance.', 'active', 2, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(3, 'Technical Team', 'technical-team', 'Engineers and developers building the platform.', 'active', 3, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(4, 'Village Coordinators', 'village-coordinators', 'Field coordinators working directly with villages.', 'active', 4, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL),
(5, 'School Coordinators', 'school-coordinators', 'Coordinators managing school empowerment programs.', 'active', 5, '2026-07-04 16:08:16', '2026-07-04 16:08:16', NULL, NULL);

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
(1, NULL, 'Anonymous Donor', NULL, NULL, 5000, 'INR', 'project', NULL, NULL, 1, NULL, 1, 'success', NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(2, NULL, 'Suresh Patel', 'suresh@example.com', NULL, 10000, 'INR', 'project', NULL, NULL, 2, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(3, NULL, 'Meena Devi', 'meena@example.com', NULL, 2500, 'INR', 'village', 1, NULL, NULL, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(4, NULL, 'Corporate CSR Fund', 'csr@example.com', NULL, 50000, 'INR', 'project', NULL, NULL, 3, NULL, 0, 'success', NULL, NULL, NULL, NULL, '2026-07-04 16:08:16', '2026-07-04 16:08:16', '2026-07-04 16:08:16');

INSERT INTO `volunteers` (`id`, `user_id`, `full_name`, `email`, `mobile`, `state`, `district`, `occupation`, `availability`, `skills`, `experience`, `photo`, `program_category`, `status`, `age`, `volunteer_code`, `hours_contributed`, `projects_joined`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Priya Sharma', 'priya@example.com', '9876543210', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(2, NULL, 'Ravi Kumar', 'ravi@example.com', '9876543211', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-04 16:08:16', '2026-07-04 16:08:16'),
(3, NULL, 'Anitha Reddy', 'anitha@example.com', '9876543212', 'Telangana', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, 0, 0, '2026-07-04 16:08:16', '2026-07-04 16:08:16');

-- contact_messages: no rows

-- notifications: no rows

-- audit_logs: no rows

SET FOREIGN_KEY_CHECKS=1;
