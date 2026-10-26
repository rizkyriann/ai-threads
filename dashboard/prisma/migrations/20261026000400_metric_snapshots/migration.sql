ALTER TABLE `posts` ADD COLUMN `isTopPerformance` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `metric_snapshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` VARCHAR(30) NOT NULL,
    `snapshotDate` DATE NOT NULL,
    `capturedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `views` INTEGER NULL,
    `likes` INTEGER NULL,
    `replies` INTEGER NULL,
    `reposts` INTEGER NULL,
    `quotes` INTEGER NULL,

    UNIQUE INDEX `metric_snapshots_postId_snapshotDate_key`(`postId`, `snapshotDate`),
    INDEX `metric_snapshots_snapshotDate_idx`(`snapshotDate`),
    PRIMARY KEY (`id`),
    CONSTRAINT `metric_snapshots_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
