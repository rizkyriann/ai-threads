-- CreateTable
CREATE TABLE `profile_versions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` INTEGER NOT NULL,
    `niche` VARCHAR(191) NOT NULL DEFAULT '',
    `topics` TEXT NOT NULL,
    `audience` TEXT NOT NULL,
    `tone` TEXT NOT NULL,
    `language` VARCHAR(100) NOT NULL DEFAULT 'Bahasa Indonesia',
    `rules` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `profile_versions_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `example_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileVersionId` INTEGER NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `isTop` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `example_posts_profileVersionId_idx`(`profileVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(30) NOT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'MISSED', 'CANCELED') NOT NULL DEFAULT 'DRAFT',
    `mode` ENUM('MANUAL', 'SCHEDULED', 'AUTO') NOT NULL DEFAULT 'MANUAL',
    `source` ENUM('AI', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `topic` VARCHAR(191) NOT NULL DEFAULT '',
    `text` VARCHAR(500) NOT NULL,
    `profileVersionId` INTEGER NULL,
    `scheduledAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `threadsMediaId` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `errorMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `posts_idempotencyKey_key`(`idempotencyKey`),
    INDEX `posts_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `example_posts` ADD CONSTRAINT `example_posts_profileVersionId_fkey` FOREIGN KEY (`profileVersionId`) REFERENCES `profile_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_profileVersionId_fkey` FOREIGN KEY (`profileVersionId`) REFERENCES `profile_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
