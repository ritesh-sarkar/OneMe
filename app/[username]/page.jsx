import { connectToDatabase } from "@/libs/db";
import { ProfileData } from "@/libs/models/ProfileData";
import { User } from "@/libs/models/User";
import PublicProfile from "@/components/User";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username: rawUsername } = await params;
  const username = (rawUsername || "").replace(/^@/, "").toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,29}$/.test(username)) {
    return { title: "Profile not found | OneMe", robots: { index: false, follow: false } };
  }

  await connectToDatabase();
  const account = await User.findOne({
    username,
    emailVerifiedAt: { $ne: null },
  })
    .select("_id name")
    .lean();
  if (!account)
    return { title: "Profile not found | OneMe", robots: { index: false, follow: false } };

  const record = await ProfileData.findOne({ ownerId: account._id }).select("data.profile").lean();
  const profile = record?.data?.profile;
  if (profile?.isPublished !== true) {
    return { title: "Profile not found | OneMe", robots: { index: false, follow: false } };
  }

  return {
    title: `${account.name} | OneMe`,
    description: profile.tagline || `View ${account.name}'s OneMe profile.`,
    robots: {
      index: profile.privacy?.searchEngineIndexing === true,
      follow: true,
    },
  };
}

export default function PublicProfilePage() {
  return <PublicProfile />;
}
