import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">
            {t("auth.dialogSignin.title")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("auth.dialogSignin.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <SignupForm />

          <div className="mt-8 text-center text-sm">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="underline hover:no-underline transition-colors"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
