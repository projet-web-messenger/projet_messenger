/*
  Warnings:

  - You are about to drop the column `kindeId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_kindeId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kindeId";
