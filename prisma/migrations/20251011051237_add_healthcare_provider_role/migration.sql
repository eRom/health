-- CreateEnum
CREATE TYPE "AssociationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'HEALTHCARE_PROVIDER';

-- CreateTable
CREATE TABLE "PatientProviderAssociation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "AssociationStatus" NOT NULL DEFAULT 'PENDING',
    "invitationToken" TEXT,
    "invitationSentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProviderAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPatientMessage" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderPatientMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProviderAssociation_invitationToken_key" ON "PatientProviderAssociation"("invitationToken");

-- CreateIndex
CREATE INDEX "PatientProviderAssociation_providerId_status_idx" ON "PatientProviderAssociation"("providerId", "status");

-- CreateIndex
CREATE INDEX "PatientProviderAssociation_invitationToken_idx" ON "PatientProviderAssociation"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProviderAssociation_patientId_providerId_key" ON "PatientProviderAssociation"("patientId", "providerId");

-- CreateIndex
CREATE INDEX "ProviderPatientMessage_associationId_createdAt_idx" ON "ProviderPatientMessage"("associationId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderPatientMessage_senderId_idx" ON "ProviderPatientMessage"("senderId");

-- AddForeignKey
ALTER TABLE "PatientProviderAssociation" ADD CONSTRAINT "PatientProviderAssociation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProviderAssociation" ADD CONSTRAINT "PatientProviderAssociation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPatientMessage" ADD CONSTRAINT "ProviderPatientMessage_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "PatientProviderAssociation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPatientMessage" ADD CONSTRAINT "ProviderPatientMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
