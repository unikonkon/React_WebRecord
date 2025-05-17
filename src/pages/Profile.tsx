
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const Profile = () => {
  const { currentUser, updateUserProfile, updateUserEmail, updateUserPassword, logout } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string>("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setProfilePictureURL(currentUser.photoURL || "");
    }
  }, [currentUser]);

  // Handle profile picture selection
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
      
      // Show preview
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePictureURL(url);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsUpdatingProfile(true);
      
      let photoURL = currentUser.photoURL;
      
      // Upload profile picture if changed
      if (profilePicture) {
        const fileExtension = profilePicture.name.split('.').pop() || "jpg";
        const storageRef = ref(storage, `profile-pictures/${currentUser.uid}.${fileExtension}`);
        await uploadBytes(storageRef, profilePicture);
        photoURL = await getDownloadURL(storageRef);
      }
      
      // Update profile (displayName and photoURL)
      await updateUserProfile({
        displayName,
        photoURL,
      });
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateUserEmail(email);
      }
      
      toast({
        title: t("success"),
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: t("error"),
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!currentUser) return;
    
    // Validate password
    if (newPassword.length < 6) {
      toast({
        title: t("error"),
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUpdatingPassword(true);
      
      await updateUserPassword(newPassword);
      
      // Reset form
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: t("success"),
        description: "Password updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: t("error"),
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  const isAnonymous = currentUser.isAnonymous;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8">{t("userProfile")}</h1>
          
          <div className="grid gap-8">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t("updateProfile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="size-24">
                    {profilePictureURL ? (
                      <AvatarImage src={profilePictureURL} alt={displayName} />
                    ) : (
                      <AvatarFallback className="text-xl">
                        {displayName?.charAt(0) || email?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="text-center">
                    <label 
                      htmlFor="profile-picture" 
                      className="text-sm text-primary cursor-pointer hover:underline"
                    >
                      Change profile picture
                    </label>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Profile Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      {t("displayName")}
                    </label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      disabled={isUpdatingProfile || isAnonymous}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      {t("email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      disabled={isUpdatingProfile || isAnonymous}
                    />
                  </div>
                </div>
                
                {isAnonymous ? (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm">
                    You're signed in as a guest. Create an account to update your profile.
                  </div>
                ) : (
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="w-full"
                  >
                    {isUpdatingProfile ? t("loading") : t("updateProfile")}
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Password Card */}
            {!isAnonymous && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("changePassword")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">
                        New Password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••"
                        disabled={isUpdatingPassword}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        {t("confirmPassword")}
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        disabled={isUpdatingPassword}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                    className="w-full"
                  >
                    {isUpdatingPassword ? t("loading") : t("changePassword")}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Account Actions */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
            >
              {t("logout")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
