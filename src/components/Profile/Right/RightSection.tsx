// components/Profile/Right/RightSection.tsx
import React from "react";
import SolvedProblems from "./SolvedProblems";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth } from "@/firebase/firebase";
import Heatmap from "./Heatmap";
// import ActivityHeatmap from "@/components/ActivityHeatmap"; // use your heatmap component here

const RightSection = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  if (!user) {
    // Redirect unauthenticated users
    router.push("/auth");
    return null;
  }
  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl w-full md:w-2/3 text-white">
      <SolvedProblems uid={user.uid} />
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Submission Activity</h3>
        <Heatmap />
      </div>
    </div>
  );
};

export default RightSection;
