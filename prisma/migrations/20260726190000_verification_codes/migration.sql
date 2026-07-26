-- Switch from long-lived link tokens to short numeric codes for email
-- verification and password reset.
DROP INDEX "VerificationToken_token_key";
ALTER TABLE "VerificationToken" RENAME COLUMN "token" TO "code";
CREATE INDEX "VerificationToken_userId_code_idx" ON "VerificationToken"("userId", "code");

DROP INDEX "PasswordResetToken_token_key";
ALTER TABLE "PasswordResetToken" RENAME COLUMN "token" TO "code";
CREATE INDEX "PasswordResetToken_userId_code_idx" ON "PasswordResetToken"("userId", "code");
