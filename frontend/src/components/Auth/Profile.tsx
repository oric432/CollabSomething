import { ProfileHeader } from "@/components/Auth/ProfileHeader";
import { PersonalInfo } from "@/components/Auth/PersonalInfo";
import { SecuritySettings } from "@/components/Auth/SecuritySettings";

export function Profile() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <ProfileHeader />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <PersonalInfo />
                    <SecuritySettings />
                </div>
            </div>
        </div>
    );
}
