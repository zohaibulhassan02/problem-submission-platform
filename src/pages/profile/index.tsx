import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import Image from "next/image";
// import profileImg from "../../public/avatar.png";
import { useRouter } from "next/router";
import Topbar from "@/components/Topbar/Topbar";
import RightSection from "@/components/Profile/Right/RightSection";
import LeftSection from "@/components/Profile/Left/LeftSection";

const ProfilePage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!user) {
    // Redirect unauthenticated users
    router.push("/auth");
    return null;
  }

  return (
    <main className="bg-dark-layer-2 min-h-screen">
      <Topbar />
      <div className="min-h-screen text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <LeftSection uid={user.uid} />
          <RightSection />
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
