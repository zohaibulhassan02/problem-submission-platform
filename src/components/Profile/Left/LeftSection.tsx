// components/Profile/Left/LeftSection.tsx
import Image from "next/image";
import React, { useEffect, useState } from "react";
import profileImg from "../../../../public/profile-img.png";
import {
  FaMapMarkerAlt,
  FaUniversity,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { IoMdPricetag } from "react-icons/io";
import { FiLink } from "react-icons/fi";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

type UserData = {
  displayName: string;
  username?: string;
  description?: string;
  location?: string;
  university?: string;
  resumeUrl?: string;
  github?: string;
  linkedin?: string;
  techStack?: string[];
  profileImageUrl?: string;
};

const LeftSection = ({ uid }: { uid: string }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(firestore, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          console.log("Photo URL from Firestore:", data.profileImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (uid) fetchUserData();
  }, [uid]);

  if (!userData) {
    return (
      <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-full md:w-1/3 shadow-lg">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e1e] text-white p-6 rounded-xl w-full md:w-1/3 shadow-lg">
      <div className="flex flex-col">
        <div className="flex gap-4">
          {userData.profileImageUrl ? (
            // Remote image from userData.photoURL
            <Image
              src={userData.profileImageUrl}
              alt={userData.displayName || "Profile Image"}
              height={96}
              width={96}
              className="rounded-md object-cover"
            />
          ) : (
            // Fallback to local static image
            <Image
              src={profileImg}
              alt="Default Profile"
              className="h-[80px] w-[80px] rounded-md object-cover"
              width={80}
              height={80}
              priority
            />
          )}

          <div>
            <h2 className="text-xl font-semibold">
              {userData.displayName || "Unnamed User"}
            </h2>
            <p className="text-gray-400 text-sm">{userData.username || uid}</p>
          </div>
        </div>

        {userData.description && (
          <p className="text-sm mt-4 text-gray-300">{userData.description}</p>
        )}

        <button
          className="mt-4 bg-light-green hover:bg-green-800 text-white py-2.5 px-4 rounded-lg text-sm"
          onClick={() => router.push("/profile/edit")}
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-6 space-y-3 text-sm text-gray-300">
        {userData.location && (
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt />
            <span>{userData.location}</span>
          </div>
        )}
        {userData.university && (
          <div className="flex items-center gap-2">
            <FaUniversity />
            <span>{userData.university}</span>
          </div>
        )}
        {userData.resumeUrl && (
          <div className="flex items-center gap-2">
            <FiLink />
            <a
              href={userData.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Resume
            </a>
          </div>
        )}
        {userData.github && (
          <div className="flex items-center gap-2">
            <FaGithub />
            <a
              href={`https://github.com/${userData.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {userData.github}
            </a>
          </div>
        )}
        {userData.linkedin && (
          <div className="flex items-center gap-2">
            <FaLinkedin />
            <a
              href={`https://linkedin.com/in/${userData.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {userData.linkedin}
            </a>
          </div>
        )}
      </div>

      {userData.techStack && userData.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          <IoMdPricetag />
          {userData.techStack.map((tag) => (
            <span
              key={tag}
              className="bg-dark-fill-3 text-white text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeftSection;
