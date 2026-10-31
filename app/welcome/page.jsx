import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Onboarding from "@/components/Onboarding";
import { authOptions } from "@/libs/auth-options";

export default async function WelcomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.onboardingComplete) redirect("/dashboard");

  return <Onboarding />;
}
