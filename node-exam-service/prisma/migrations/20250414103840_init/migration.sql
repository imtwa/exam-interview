-- DropIndex
DROP INDEX `exam_front_document_userId_fkey` ON `exam_front_document`;

-- DropIndex
DROP INDEX `exam_front_exampaper_categoryId_fkey` ON `exam_front_exampaper`;

-- DropIndex
DROP INDEX `exam_front_exampaper_subCategoryId_fkey` ON `exam_front_exampaper`;

-- DropIndex
DROP INDEX `exam_front_exampaper_userId_fkey` ON `exam_front_exampaper`;

-- DropIndex
DROP INDEX `exam_front_examquestion_questionId_fkey` ON `exam_front_examquestion`;

-- DropIndex
DROP INDEX `exam_front_favorite_examPaperId_fkey` ON `exam_front_favorite`;

-- DropIndex
DROP INDEX `exam_front_question_documentId_fkey` ON `exam_front_question`;

-- DropIndex
DROP INDEX `exam_front_question_userId_fkey` ON `exam_front_question`;

-- DropIndex
DROP INDEX `exam_front_subcategory_categoryId_fkey` ON `exam_front_subcategory`;

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
