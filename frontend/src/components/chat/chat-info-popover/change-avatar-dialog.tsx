import type React from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlertIcon, UserIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/helper";
import { useChat } from "@/hooks/use-chat";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  maxSize?: number;
  onFileChange?: (file: FileWithPreview | null) => void;
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChangeAvatarDialog = ({
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileChange,
  isOpen,
  onOpenChange,
}: Props) => {
  const { singleChat, sendUpdateChatAvatar, updatingChatAvatar } = useChat();

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/*",
    multiple: false,
    onFilesChange: (files) => {
      onFileChange?.(files[0] || null);
    },
  });

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || singleChat?.chat?.avatar;

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  const handleUpdate = async () => {
    if (!singleChat) return;
    let avatarData = singleChat?.chat?.avatar;

    if (currentFile?.file) {
      try {
        avatarData = await fileToBase64(currentFile.file as Blob);
      } catch (error) {
        toast.error("Error processing file");
        return;
      }
    }

    if (!avatarData) {
      toast.error("Error processing file");
      return;
    }

    const success = await sendUpdateChatAvatar(
      singleChat?.chat?._id,
      avatarData,
    );
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg">
        <DialogHeader className="flex items-center">
          <h2 className="text-xl">Change Group Avatar</h2>
          <br />
        </DialogHeader>

        <div className={"flex flex-col items-center gap-4"}>
          <div className="relative">
            <div
              className={cn(
                "group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/20",
                previewUrl && "border-solid",
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input {...getInputProps()} className="sr-only" />

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserIcon className="text-muted-foreground size-6" />
                </div>
              )}
            </div>

            {currentFile && (
              <Button
                size="icon"
                variant="outline"
                onClick={handleRemove}
                className="absolute inset-e-0.5 top-0.5 z-10 size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
                aria-label="Remove avatar"
              >
                <XIcon className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Upload Instructions */}
          <div className="space-y-0.5 text-center">
            <p className="text-sm font-medium">
              {currentFile ? "Avatar uploaded" : "Upload avatar"}
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG up to {formatBytes(maxSize)}
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive" className="mt-5">
              <CircleAlertIcon />
              <AlertTitle>File upload error(s)</AlertTitle>
              <AlertDescription>
                {errors.map((error, index) => (
                  <p key={index} className="last:mb-0">
                    {error}
                  </p>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-row justify-center gap-10">
          <Button
            type="button"
            className="w-1/2 hover:cursor-pointer"
            onClick={() => handleUpdate()}
            disabled={updatingChatAvatar || currentFile === undefined}
          >
            {updatingChatAvatar && <Spinner />}
            Change Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAvatarDialog;
