-- Add new columns to Driver table
ALTER TABLE "Driver" 
ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "complianceStatus" TEXT NOT NULL DEFAULT 'compliant',
ADD COLUMN IF NOT EXISTS "licenseExpiryDate" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '5 years';

-- Add comment for documentation
COMMENT ON COLUMN "Driver"."lastActivity" IS 'Last time driver was active';
COMMENT ON COLUMN "Driver"."complianceStatus" IS 'Compliance status: compliant, warning, non_compliant';
COMMENT ON COLUMN "Driver"."licenseExpiryDate" IS 'License expiration date';
