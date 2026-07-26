import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendEmailChangeVerification, sendPasswordResetEmail } from "@/lib/email";

const CODE_TTL_MS = 15 * 60 * 1000;

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Registration flow: confirms the account's current email. */
export async function createAndSendVerificationEmail(userId: string, email: string, name: string) {
  const code = generateCode();

  await prisma.verificationToken.deleteMany({ where: { userId, newEmail: null } });
  await prisma.verificationToken.create({
    data: { userId, code, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  await sendVerificationEmail(email, name, code);
}

/** Profile email-change flow: confirms ownership of a new email before it takes effect. */
export async function createAndSendEmailChangeVerification(userId: string, newEmail: string, name: string) {
  const code = generateCode();

  await prisma.verificationToken.deleteMany({ where: { userId, newEmail: { not: null } } });
  await prisma.verificationToken.create({
    data: { userId, code, newEmail, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  await sendEmailChangeVerification(newEmail, name, code);
}

export async function createAndSendPasswordResetEmail(userId: string, email: string, name: string) {
  const code = generateCode();

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: { userId, code, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  await sendPasswordResetEmail(email, name, code);
}
