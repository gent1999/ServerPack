-- AlterTable
ALTER TABLE "articles" DROP COLUMN "excerpt",
DROP COLUMN "status",
ADD COLUMN     "tag" TEXT NOT NULL DEFAULT 'General',
ALTER COLUMN "publishedAt" SET NOT NULL,
ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "ArticleStatus";
