import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config";

export const cloudinaryDelete = async (publicId: string) => {
  await cloudinary.uploader
    .destroy(publicId)
    .catch((err) => console.error("Cloudinary Delete Failed:", err));
};

export const cloudinaryPost = async (
  img: string,
  folder: string,
): Promise<UploadApiResponse> => {
  return await cloudinary.uploader.upload(img, {
    folder,
  });
};
