import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendEmailChangeVerification, sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/** Registration flow: confirms the account's current email. */
export async function createAndSendVerificationEmail(
  userId: string,
  email: string,
  name: string,
  origin: string,
) {
  const token = generateToken();

  await prisma.verificationToken.deleteMany({ where: { userId, newEmail: null } });
  await prisma.verificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const verifyUrl = `${origin}/verify-email?token=${token}`;
  await sendVerificationEmail(email, name, verifyUrl);
}

/** Profile email-change flow: confirms ownership of a new email before it takes effect. */
export async function createAndSendEmailChangeVerification(
  userId: string,
  newEmail: string,
  name: string,
  origin: string,
) {
  const token = generateToken();

  await prisma.verificationToken.deleteMany({ where: { userId, newEmail: { not: null } } });
  await prisma.verificationToken.create({
    data: { userId, token, newEmail, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const verifyUrl = `${origin}/verify-email?token=${token}`;
  await sendEmailChangeVerification(newEmail, name, verifyUrl);
}

export async function createAndSendPasswordResetEmail(
  userId: string,
  email: string,
  name: string,
  origin: string,
) {
  const token = generateToken();

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetUrl = `${origin}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, name, resetUrl);
}
