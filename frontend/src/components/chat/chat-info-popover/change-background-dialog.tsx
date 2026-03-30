//TODO: Modularize

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, RotateCcw, UserIcon, XIcon } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { fileToBase64 } from "@/lib/helper";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import wpDark from "@/assets/wp.png";
import wpLight from "@/assets/wp-white.png";

interface Props {
  maxSize?: number;
  onFileChange?: (file: FileWithPreview | null) => void;
  isOpen: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}
const ChangeBackgroundDialog = ({
  maxSize = 10 * 1024 * 1024, // 10MB
  onFileChange,
  isOpen,
  onOpenChange,
}: Props) => {
  const { singleChat, sendUpdateChatBackground, updatingChatBackground } =
    useChat();

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

  const { theme } = useTheme();

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const defaultBackground = isDarkMode ? wpDark : wpLight;

  const currentFile = files[0];
  const previewUrl =
    currentFile?.preview || singleChat?.chat?.background || defaultBackground;

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  const handleUpdate = async (reset: boolean = false) => {
    if (!singleChat) return;

    if (reset) {
      const success = await sendUpdateChatBackground(
        singleChat?.chat?._id,
        "RESET",
      );
      if (success) onOpenChange(false);
      return;
    }

    let backgroundData = singleChat?.chat?.background;

    if (currentFile?.file) {
      try {
        backgroundData = await fileToBase64(currentFile.file as Blob);
      } catch (error) {
        toast.error("Error processing file");
        return;
      }
    }

    if (!backgroundData) {
      toast.error("Error processing file");
      return;
    }

    const success = await sendUpdateChatBackground(
      singleChat?.chat?._id,
      backgroundData,
    );
    if (success) {
      onOpenChange(false);
      removeFile(currentFile.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg">
        <DialogHeader className="flex items-center">
          <h2 className="text-xl">Change Group Background</h2>
        </DialogHeader>

        <DialogDescription className="flex flex-col items-center">
          Chat Preview
        </DialogDescription>
        <div className="flex flex-row justify-around">
          <div className={"flex flex-col items-center gap-4"}>
            <div className="relative">
              <div
                className={cn(
                  "group/avatar relative h-62 w-42 cursor-pointer overflow-hidden rounded-md border border-dashed transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/20",
                  previewUrl && "border-solid ",
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <input {...getInputProps()} className="sr-only" />

                {previewUrl ? (
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col-reverse p-2 ">
                      <div className="min-w-5 flex flex-row-reverse">
                        <div className="max-w-20 px-3 py-2 text-xs wrap-break-word shadow-sm bg-accent dark:bg-primary/40 rounded-tr-xl rounded-l-xl">
                          Message
                        </div>
                      </div>
                      <div className="min-w-5 flex">
                        <div className="min-w-5 max-w-20 px-3 py-2 text-xs wrap-break-word shadow-sm bg-[#F5F5F5] dark:bg-accent rounded-bl-xl rounded-r-xl">
                          Message
                        </div>
                      </div>

                      <div className="min-w-5 flex flex-row-reverse">
                        <div className="min-w-5 max-w-20 px-3 py-2 text-xs wrap-break-word shadow-sm bg-accent dark:bg-primary/40 rounded-tr-xl rounded-l-xl">
                          Message
                        </div>
                      </div>
                      <div className="min-w-5 flex">
                        <div className="min-w-5 max-w-20 px-3 py-2 text-xs wrap-break-word shadow-sm bg-[#F5F5F5] dark:bg-accent rounded-bl-xl rounded-r-xl">
                          Message
                        </div>
                      </div>
                      <div className="flex justify-center m-10">
                        <Spinner />
                      </div>
                    </div>
                  </div>
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
                {currentFile ? "Background uploaded" : "Upload a background"}
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

          {/* Spread themes */}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row justify-center gap-10">
            <Button
              type="button"
              className="w-1/3 hover:cursor-pointer bg-accent hover:bg-accent/80"
              onClick={() => handleUpdate(true)}
              disabled={!singleChat?.chat.background}
            >
              <RotateCcw size={16} />
              Restore Default
            </Button>
            <Button
              type="button"
              className="w-1/3 hover:cursor-pointer"
              onClick={() => handleUpdate()}
              disabled={updatingChatBackground || currentFile === undefined}
            >
              Change Theme
            </Button>
          </div>
          {updatingChatBackground && (
            <div className="flex grow mt-2 items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeBackgroundDialog;
