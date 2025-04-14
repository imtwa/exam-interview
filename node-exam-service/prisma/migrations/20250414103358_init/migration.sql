/*
  Warnings:

  - You are about to drop the column `created_at` on the `exam_front_user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `exam_front_user` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `exam_front_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exam_front_user` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `exam_front_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_subcategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'parsed', 'error') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `qtype` INTEGER NOT NULL,
    `question` TEXT NOT NULL,
    `options` TEXT NULL,
    `answer` TEXT NOT NULL,
    `ai_analysis` TEXT NOT NULL,
    `difficulty` INTEGER NULL,
    `userId` INTEGER NULL,
    `documentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_exampaper` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `subCategoryId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_examquestion` (
    `examId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`examId`, `questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_front_favorite` (
    `userId` INTEGER NOT NULL,
    `examPaperId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`userId`, `examPaperId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exam_front_subcategory` ADD CONSTRAINT `exam_front_subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `exam_front_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_document` ADD CONSTRAINT `exam_front_document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `exam_front_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_question` ADD CONSTRAINT `exam_front_question_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `exam_front_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_question` ADD CONSTRAINT `exam_front_question_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `exam_front_document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_exampaper` ADD CONSTRAINT `exam_front_exampaper_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `exam_front_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_exampaper` ADD CONSTRAINT `exam_front_exampaper_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `exam_front_subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_exampaper` ADD CONSTRAINT `exam_front_exampaper_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `exam_front_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_examquestion` ADD CONSTRAINT `exam_front_examquestion_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exam_front_exampaper`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_examquestion` ADD CONSTRAINT `exam_front_examquestion_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `exam_front_question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_favorite` ADD CONSTRAINT `exam_front_favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `exam_front_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_front_favorite` ADD CONSTRAINT `exam_front_favorite_examPaperId_fkey` FOREIGN KEY (`examPaperId`) REFERENCES `exam_front_exampaper`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
