ALTER TABLE `posts` ADD COLUMN `threadsContainerId` VARCHAR(191) NULL;

CREATE TABLE `threads_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `threadsUserId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `encryptedAccessToken` TEXT NOT NULL,
    `tokenExpiresAt` DATETIME(3) NULL,
    `connectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `threads_accounts_threadsUserId_key`(`threadsUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
