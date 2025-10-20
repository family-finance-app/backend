/*
  Warnings:

  - The `currency` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DEBIT', 'CREDIT', 'CASH', 'BANK', 'INVESTMENT', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('UAH', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "type",
ADD COLUMN     "type" "AccountType" NOT NULL,
DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyType" NOT NULL DEFAULT 'UAH';
