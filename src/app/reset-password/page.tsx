import { ResetPasswordClient } from "@/components/reset-password-client";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ResetPasswordClient defaultEmail={email} />;
}
