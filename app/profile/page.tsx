import ProfilePage from "@/components/profile-page";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Profile ",
    description: "User profile and settings",
};

export default async function Page() {
    const session = await verifySession();

    if (!session) {
        redirect("/login");
    }

    return <ProfilePage />;
}
