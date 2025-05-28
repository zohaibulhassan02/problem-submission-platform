import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ message: "No image provided" });
    }

    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "profile-images",
    });

    res.status(200).json({ imageUrl: uploadResponse.secure_url });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
}
