-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "account_recipient_id" INTEGER;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_recipient_id_fkey" FOREIGN KEY ("account_recipient_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
