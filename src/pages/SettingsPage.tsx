import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Camera,
  Save,
  LogOut,
  CreditCard,
  Shield,
  Loader2,
  Palette,
  Sun,
  Moon,
} from "lucide-react";

const SettingsPage = () => {
  const { user, profile, subscription, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [userGoal, setUserGoal] = useState(profile?.user_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");

  const initials = (displayName || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        user_goal: userGoal,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);
    setUploading(false);
    toast.success("Avatar updated");
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent — check your inbox");
    }
  };

  const planLabel =
    subscription?.plan === "pro"
      ? "Pro"
      : subscription?.plan === "elite"
        ? "Elite"
        : "Free";

  const planColor =
    subscription?.plan === "pro"
      ? "bg-[hsl(var(--pro))] text-[hsl(var(--pro-foreground))]"
      : subscription?.plan === "elite"
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-muted-foreground";

  return (
    <div className="p-6 md:p-10 max-w-3xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile, security, and subscription.
        </p>
      </div>

      {/* ── Profile ── */}
      <section className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <User className="w-5 h-5 text-primary" />
          Profile
        </div>

        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-foreground" />
              ) : (
                <Camera className="w-5 h-5 text-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-medium">{displayName || "No name set"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userGoal">Career Goal</Label>
            <Input
              id="userGoal"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. Become a data engineer"
            />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </section>

      {/* ── Account & Security ── */}
      <section className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="w-5 h-5 text-primary" />
          Account &amp; Security
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Password</p>
              <p className="text-muted-foreground text-sm">Send a reset link to your email</p>
            </div>
            <Button variant="outline" size="sm" onClick={handlePasswordReset}>
              Reset Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-muted-foreground text-sm">End your current session</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Palette className="w-5 h-5 text-primary" />
          Appearance
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">Theme</p>
              <p className="text-muted-foreground text-sm">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
          </div>
          <Switch
            checked={theme === "light"}
            onCheckedChange={toggleTheme}
            aria-label="Toggle light mode"
          />
        </div>
      </section>


      <section className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="w-5 h-5 text-primary" />
          Subscription
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${planColor} text-xs px-3 py-1 rounded-full`}>{planLabel}</Badge>
          <span className="text-sm text-muted-foreground capitalize">
            {subscription?.status ?? "active"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {subscription?.plan === "free"
            ? "Upgrade to Pro or Elite for unlimited AI analyses, interview prep, and priority support."
            : `You're on the ${planLabel} plan. Manage your billing from the pricing page.`}
        </p>

        {subscription?.plan === "free" && (
          <Button variant="hero" size="sm" asChild>
            <a href="/pricing">Upgrade Plan</a>
          </Button>
        )}
      </section>
    </div>
  );
};

export default SettingsPage;
