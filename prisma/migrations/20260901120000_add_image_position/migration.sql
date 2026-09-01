-- AlterTable
ALTER TABLE "SectionContent" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT;

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT;

-- AlterTable
ALTER TABLE "TopicTile" ADD COLUMN IF NOT EXISTS "imagePosition" TEXT;
