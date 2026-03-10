"use client";

import { useState } from "react";
import { useTheme } from "@/components/shared/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Bell, Palette, Camera, Moon, Sun, Laptop, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: "Settings Saved", description: "Your preferences have been updated." });
    }, 1000);
  };

  const handleDeleteAccount = () => {
    toast({ title: "Action Restricted", description: "Account deletion is disabled in this demo.", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Lock className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-5">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your profile details and public information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20 ring-2 ring-slate-200 ring-offset-2 dark:ring-slate-700">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-[#0061FF]/10 text-[#0061FF] font-bold">ST</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md dark:border-slate-800">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Profile Photo</p>
                  <p className="text-sm text-slate-500">JPG, GIF or PNG. Max 800KB.</p>
                  <Button size="sm" variant="outline" className="mt-2">Change Photo</Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue="Sandesh" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue="Thapa" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" defaultValue="sandeshthapa2028@gmail.com" disabled className="opacity-60" />
                <p className="text-xs text-slate-500">Contact support to change your email address.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Product Designer & Developer" />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/60 pt-4 dark:border-slate-800 dark:bg-slate-800/30">
              <Button onClick={handleSave} disabled={isLoading} className="min-w-28">
                {isLoading ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="account" className="space-y-5">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
              <CardTitle className="text-base">Password & Security</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/60 pt-4 dark:border-slate-800 dark:bg-slate-800/30">
              <Button onClick={handleSave} disabled={isLoading} className="min-w-36">
                {isLoading ? "Updating…" : "Update Password"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Authenticator App</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Secure your account with an authenticator app.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <CardTitle className="text-base text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              </div>
              <CardDescription>Irreversible and destructive actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete Account</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete your account and all data.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-5">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
              <CardTitle className="text-base">Theme Preferences</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
              {[
                {
                  id: "light", label: "Light",
                  preview: <div className="flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-white"><Sun className="h-7 w-7 text-amber-400" /></div>,
                },
                {
                  id: "dark", label: "Dark",
                  preview: <div className="flex h-20 items-center justify-center rounded-lg border border-slate-700 bg-slate-950"><Moon className="h-7 w-7 text-indigo-400" /></div>,
                },
                {
                  id: "system", label: "System",
                  preview: <div className="flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-200 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800"><Laptop className="h-7 w-7 text-slate-500" /></div>,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as "light" | "dark" | "system")}
                  className={`group cursor-pointer rounded-xl border-2 p-3 text-left transition-all ${
                    theme === t.id
                      ? "border-[#0061FF] bg-[#0061FF]/[0.04] shadow-sm dark:bg-[#0061FF]/10"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  }`}
                >
                  {t.preview}
                  <div className={`mt-2.5 text-center text-sm font-medium ${theme === t.id ? "text-[#0061FF]" : "text-slate-700 dark:text-slate-300"}`}>
                    {t.label}
                    {theme === t.id && <span className="ml-1 text-[10px]">✓</span>}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-5">
          {[
            {
              title: "Email Notifications",
              description: "Choose which emails you want to receive.",
              items: [
                { id: "marketing", label: "Marketing emails", desc: "News about products, features, and promotions.", defaultChecked: false },
                { id: "social", label: "Social emails", desc: "Friend requests, follows, and activity updates.", defaultChecked: true },
                { id: "security", label: "Security alerts", desc: "Important emails about your account security.", defaultChecked: true, disabled: true },
              ],
            },
            {
              title: "Push Notifications",
              description: "Choose which push notifications you want to receive.",
              items: [
                { id: "new-orders", label: "New Orders", desc: "Get notified when a new order is placed.", defaultChecked: true },
                { id: "order-updates", label: "Order Status Updates", desc: "Get notified when an order status changes.", defaultChecked: true },
              ],
            },
          ].map((section) => (
            <Card key={section.title}>
              <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
                {section.items.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <Label htmlFor={item.id} className="flex flex-col gap-0.5 cursor-pointer">
                      <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-xs font-normal text-slate-500">{item.desc}</span>
                    </Label>
                    <Switch id={item.id} defaultChecked={item.defaultChecked} disabled={item.disabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
