export const getPublicIdFromUrl = (url: string) => {
  if (!url.includes("cloudinary.com")) return "";

  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;

  const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");
  return publicIdWithExtension.split(".")[0];
};
