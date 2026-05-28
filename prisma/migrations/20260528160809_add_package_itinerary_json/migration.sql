-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "itineraryJson" JSONB;

-- AlterTable
ALTER TABLE "SiteSettings" ALTER COLUMN "inquiryLabel" SET DEFAULT 'Contact Us';
