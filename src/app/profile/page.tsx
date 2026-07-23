import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForms } from "@/components/profile-forms";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, pendingEmail: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Профиль</h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">Управляйте своим именем, email и паролем.</p>
      </div>
      <ProfileForms name={user.name} email={user.email} pendingEmail={user.pendingEmail} />
    </div>
  );
}
