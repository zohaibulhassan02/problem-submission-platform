// pages/profile/edit.tsx
import EditProfileForm from "@/components/Profile/EditProfileForm";
import { auth } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const EditProfilePage = () => {
  const [user] = useAuthState(auth);

  if (!user) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black py-10">
      <EditProfileForm uid={user.uid} />
    </div>
  );
};

export default EditProfilePage;
