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

-- AddForeignKey (safe, no-op if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'GalleryItem_sectionId_fkey'
    ) THEN
        ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_sectionId_fkey"
            FOREIGN KEY ("sectionId") REFERENCES "GallerySection"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
