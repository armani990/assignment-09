
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Camera,
  Building2,
  LockKeyhole,
  LoaderCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authClient, useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getAuthToken() {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  return data.token;
}

async function uploadProfileImage(file) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("ImgBB API key is missing.");
  }

  const imageData = new FormData();
  imageData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: imageData,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error("Profile image upload failed.");
  }

  return result.data.url;
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-5" />
      </div>

      <div>
        <h2 className="font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, id, ...props }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    role: "",
    businessName: "",
  });

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const role = profile.role || session?.user?.role;

  // Load current user's profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (!API_URL) {
        throw new Error("API base URL is not configured.");
      }

      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load profile.");
      }

      setProfile({
        name: result.name || "",
        email: result.email || "",
        image: result.image || "",
        role: result.role || "",
        businessName: result.businessName || "",
      });

      setName(result.name || "");
      setBusinessName(result.businessName || "");
    } catch (error) {
      toast.error(error.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && session?.user) {
      loadProfile();
    }
  }, [isPending, session?.user, loadProfile]);

  // Preview selected image
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  // Validate selected image
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      toast.error("Image size must be less than 32MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  }

  // Update name and profile image
  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setProfileSaving(true);

      let imageUrl = profile.image;

      if (imageFile) {
        imageUrl = await uploadProfileImage(imageFile);
      }

      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile.");
      }

      setProfile((previous) => ({
        ...previous,
        name: name.trim(),
        image: imageUrl || "",
      }));

      setImageFile(null);

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  }

  // Update vendor business name
  async function handleBusinessSubmit(event) {
    event.preventDefault();

    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    try {
      setBusinessSaving(true);

      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/profile/business-name`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            businessName: businessName.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update business name."
        );
      }

      setProfile((previous) => ({
        ...previous,
        businessName: result.businessName || businessName.trim(),
      }));

      toast.success("Business name updated successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setBusinessSaving(false);
    }
  }

  // Change account password
  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        throw new Error(error.message || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setPasswordSaving(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoaderCircle className="size-9 animate-spin text-brand" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const displayedImage = imagePreview || profile.image;

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Profile Settings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal information and account security.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProfile}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Account Overview */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-brand/30 bg-brand/10">
          {displayedImage ? (
            <img
              src={displayedImage}
              alt={profile.name || "Profile"}
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-9 text-brand" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-bold text-foreground">
            {profile.name || "Your Name"}
          </h2>

          <p className="mt-1 break-all text-sm text-muted-foreground">
            {profile.email}
          </p>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold capitalize text-brand">
            <ShieldCheck className="size-3.5" />
            {role || "User"} Account
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleProfileSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <SectionHeading
          icon={UserRound}
          title="Personal Information"
          description="Update your name and profile picture."
        />

        {/* Profile Image */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10">
            {displayedImage ? (
              <img
                src={displayedImage}
                alt="Profile preview"
                className="size-full object-cover"
              />
            ) : (
              <UserRound className="size-9 text-brand" />
            )}
          </div>

          <div>
            <label
              htmlFor="profileImage"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              <Camera className="size-4" />
              Change Photo
            </label>

            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or other image formats. Maximum 32MB.
            </p>

            {imageFile && (
              <p className="mt-1 max-w-xs truncate text-xs text-brand">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="profileName"
            label="Full Name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            required
          />

          <div className="space-y-2">
            <label
              htmlFor="profileEmail"
              className="block text-sm font-medium text-muted-foreground"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="profileEmail"
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-border bg-muted py-3 pl-11 pr-4 text-sm text-muted-foreground outline-none"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Email address cannot be changed here.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      {/* Vendor Business Information */}
      {role === "vendor" && (
        <form
          onSubmit={handleBusinessSubmit}
          className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
          <SectionHeading
            icon={Building2}
            title="Business Information"
            description="Manage your restaurant or business name."
          />

          <Field
            id="businessName"
            label="Business Name"
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Enter your business name"
            maxLength={100}
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={businessSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {businessSaving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {businessSaving ? "Saving..." : "Save Business Info"}
            </button>
          </div>
        </form>
      )}

      {/* Password Settings */}
      <form
        onSubmit={handlePasswordSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-7"
      >
        <SectionHeading
          icon={LockKeyhole}
          title="Change Password"
          description="Update your account password to keep your account secure."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-muted-foreground"
            >
              Current Password
            </label>

            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                placeholder="Enter current password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword((previous) => !previous)
                }
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand"
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-muted-foreground"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword((previous) => !previous)
                }
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand"
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-muted-foreground"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Your new password must contain at least 6 characters.
        </p>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordSaving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}

            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
