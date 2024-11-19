import { ProfileLayout } from "@/components/Auth/ProfileLayout";
import { ProfileHeader } from "@/components/Auth/ProfileHeader";
import { PersonalInfo } from "@/components/Auth/PersonalInfo";
import { SecuritySettings } from "@/components/Auth/SecuritySettings";

export default function ProfilePage() {
    return (
        <ProfileLayout>
            <div className="container mx-auto p-6 space-y-6">
                <ProfileHeader />
                <div className="max-w-3xl mx-auto space-y-6">
                    <PersonalInfo />
                    <SecuritySettings />
                </div>
            </div>
        </ProfileLayout>
    );
}
