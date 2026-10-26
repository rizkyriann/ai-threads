ALTER TABLE `posts` ADD COLUMN `nextRetryAt` DATETIME(3) NULL;

CREATE TABLE `job_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job` VARCHAR(100) NOT NULL,
    `status` ENUM('RUNNING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'RUNNING',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `detail` TEXT NULL,

    INDEX `job_logs_job_startedAt_idx`(`job`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
