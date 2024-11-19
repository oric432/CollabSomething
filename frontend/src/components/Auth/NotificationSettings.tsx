import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">
                        Email Notifications
                    </Label>
                    <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">
                        Push Notifications
                    </Label>
                    <Switch id="push-notifications" />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <Switch id="marketing-emails" />
                </div>
            </CardContent>
        </Card>
    );
}
