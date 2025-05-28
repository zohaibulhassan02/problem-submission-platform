import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import Image from "next/image";

type FormDataType = {
  displayName: string;
  email: string;
  description: string;
  location: string;
  university: string;
  github: string;
  linkedin: string;
  techStack: string[];
  [key: string]: string | string[];
};

const EditProfileForm = ({ uid }: { uid: string }) => {
  const [formData, setFormData] = useState<FormDataType>({
    displayName: "",
    email: "",
    description: "",
    location: "",
    university: "",
    github: "",
    linkedin: "",
    techStack: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          displayName: data.displayName || "",
          email: data.email || "",
          description: data.description || "",
          location: data.location || "",
          university: data.university || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
          techStack: data.techStack || [],
        });
        if (data.profileImageUrl) {
          setImagePreview(data.profileImageUrl);
        }
      }
    };
    fetchData();
  }, [uid]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "techStack"
          ? value.split(",").map((item) => item.trim())
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error("User data not found.");
        return;
      }

      const existingData = docSnap.data();
      const changedFields: { [key: string]: any } = {};

      const uploadImageToCloudinary = async (file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Image = reader.result;
            try {
              const response = await fetch("/api/upload-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageBase64: base64Image }),
              });

              const data = await response.json();
              if (response.ok) {
                resolve(data.imageUrl);
              } else {
                reject(data.error);
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsDataURL(file);
        });
      };

      if (imageFile) {
        try {
          const imageUrl = await uploadImageToCloudinary(imageFile);
          changedFields.profileImageUrl = imageUrl;
        } catch (uploadErr) {
          toast.error("Image upload failed.");
          console.error("Cloudinary Upload Error:", uploadErr);
          return;
        }
      }

      for (const key in formData) {
        const newVal = formData[key];
        const oldVal = existingData[key];

        const isEqual =
          Array.isArray(newVal) && Array.isArray(oldVal)
            ? JSON.stringify(newVal) === JSON.stringify(oldVal)
            : newVal === oldVal;

        if (!isEqual) {
          changedFields[key] = newVal;
        }
      }

      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes detected.");
        return;
      }

      changedFields.updatedAt = Date.now();
      await updateDoc(docRef, changedFields);

      toast.success("Profile updated successfully!", {
        position: "top-center",
        theme: "dark",
      });

      router.push("/profile");
    } catch (err) {
      toast.error("Failed to update profile.", {
        position: "top-center",
        theme: "dark",
      });
      console.error("Update error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 space-y-4 bg-gray-900 rounded-xl text-white"
    >
      <h2 className="text-xl font-bold">Edit Profile</h2>

      {/* Profile Image Upload */}
      <div>
        <label className="block mb-2 font-semibold">Profile Image</label>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt="Profile Preview"
            width={96}
            height={96}
            className="w-24 h-24 object-cover rounded-md mb-2"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-white"
        />
      </div>

      {/* Input fields */}
      {[
        "displayName",
        "email",
        "location",
        "university",
        "github",
        "linkedin",
      ].map((field) => (
        <input
          key={field}
          type="text"
          name={field}
          value={formData[field] as string}
          onChange={handleChange}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white"
        />
      ))}

      {/* Description */}
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white resize-none"
      />

      {/* Tech stack */}
      <input
        type="text"
        name="techStack"
        value={(formData.techStack as string[]).join(", ")}
        onChange={handleChange}
        placeholder="Skills (comma-separated)"
        className="w-full px-4 py-2 rounded bg-gray-800 text-white"
      />

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditProfileForm;
