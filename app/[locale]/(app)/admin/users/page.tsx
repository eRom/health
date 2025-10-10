import { getUsers } from '@/app/actions/admin/get-users';
import { UsersTable } from '@/components/admin/users-table';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.users" });

  return {
    title: t("title"),
    description: t("title"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `https://healthincloud.app/${locale}/admin/users`,
      languages: {
        fr: "https://healthincloud.app/fr/admin/users",
        en: "https://healthincloud.app/en/admin/users",
      },
    },
  };
}

export default async function AdminUsersPage() {
  const users = await getUsers()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des membres</h2>
          <p className="text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <UsersTable users={users} />
    </div>
  )
}
