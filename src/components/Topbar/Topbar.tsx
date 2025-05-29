import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import profileImg from "../../../public/avatar.png";
import Logout from "../Buttons/Logout";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";

import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);
  const router = useRouter();

  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImageUrl(data.profileImageUrl || null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchProfileImage();
  }, [user]);

  const handleProblemChange = (isForward: boolean) => {
    const { order } = problems[router.query.pid as string] as Problem;
    const direction = isForward ? 1 : -1;
    const nextProblemOrder = order + direction;

    const nextProblemKey = Object.keys(problems).find(
      (key) => problems[key].order === nextProblemOrder
    );

    if (isForward && !nextProblemKey) {
      const firstProblemKey = Object.keys(problems).find(
        (key) => problems[key].order === 1
      );
      router.push(`/problems/${firstProblemKey}`);
    } else if (!isForward && !nextProblemKey) {
      const lastProblemKey = Object.keys(problems).find(
        (key) => problems[key].order === Object.keys(problems).length
      );
      router.push(`/problems/${lastProblemKey}`);
    } else {
      router.push(`/problems/${nextProblemKey}`);
    }
  };

  return (
    <nav className="relative flex h-[70px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7">
      <div
        className={`flex w-full items-center justify-between ${
          !problemPage ? "max-w-[1200px] mx-auto" : ""
        }`}
      >
        {/* Left Section - Removed profile image, leaving empty flex space */}
        {/* <Link href="/" className="h-[22px] flex-1">
          <Image src="/logo-full.png" alt="Logo" height={100} width={100} />
        </Link> */}

        <Link href="/" className="h-auto flex items-center">
          <Image
            src="/logo-full.png"
            alt="Logo"
            width={180}
            height={60}
            className="object-contain"
          />
        </Link>

        {/* Problem Navigation Section */}
        {problemPage && (
          <div className="flex items-center gap-4 flex-1 justify-center">
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleProblemChange(false)}
            >
              <FaChevronLeft />
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer"
            >
              <BsList />
              <p>Problem List</p>
            </Link>
            <div
              className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleProblemChange(true)}
            >
              <FaChevronRight />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <a
            href=""
            target="_blank"
            rel="noreferrer"
            className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill"
          >
            Premium
          </a>

          {!user && (
            <Link
              href="/auth"
              onClick={() => {
                setAuthModalState((prev) => ({
                  ...prev,
                  isOpen: true,
                  type: "login",
                }));
              }}
            >
              <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded">
                Sign In
              </button>
            </Link>
          )}

          {user && problemPage && <Timer />}

          {user && (
            <div
              className="cursor-pointer group relative"
              onClick={() => router.push("/profile")}
            >
              <Image
                src={profileImageUrl || profileImg}
                alt="profile-img"
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
              <div className="absolute top-10 left-2/4 -translate-x-2/4 mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm">{user.email}</p>
              </div>
            </div>
          )}

          {user && <Logout />}
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
