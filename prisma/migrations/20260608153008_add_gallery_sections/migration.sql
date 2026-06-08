-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN IF NOT EXISTS "sectionId" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "GallerySection" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GallerySection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT IF NOT EXISTS "GalleryItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "GallerySection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
