import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/libs/auth-options";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!session.user.onboardingComplete && !session.user.onboardingSkipped) redirect("/welcome");

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
