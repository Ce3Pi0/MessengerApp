import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from "@/hooks/use-file-upload";
import { fileToBase64 } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { OTHER_ROUTES } from "@/routes/routes";
import { updateUserSchemaType } from "@/validators/auth.validator";
import { CircleAlertIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AvatarUploadProps {
  maxSize?: number;
  className?: string;
  onFileChange?: (file: FileWithPreview | null) => void;
}

const EditAccount = ({
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  onFileChange,
}: AvatarUploadProps) => {
  const { user, isLoading, updateAccount } = useAuth();

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
  const previewUrl = currentFile?.preview || user?.avatar;

  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [isOpen, setIsOpen] = useState(true);

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate(-1);
    }
  };

  const handleUpdate = async () => {
    let avatarData = user?.avatar;

    if (currentFile?.file) {
      try {
        avatarData = await fileToBase64(currentFile.file as Blob);
      } catch (error) {
        console.error("File processing error:", error);
        return;
      }
    }

    const data = updateUserSchemaType.parse({ name, avatar: avatarData });

    const success = await updateAccount(data);
    if (success) navigate(OTHER_ROUTES.ROOT);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center justify-center gap-3">
          <DialogTitle className="text-xl">Update your account</DialogTitle>
          <DialogDescription>
            Fill out the information you want to update
          </DialogDescription>
        </DialogHeader>
        <div className={cn("flex flex-col items-center gap-4", className)}>
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

        <Field className="flex flex-col justify-center items-center">
          <FieldLabel className="max-w-fit">Name</FieldLabel>
          <Input
            className="max-w-1/2 text-center"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FieldDescription className="max-w-fit">
            Update your name
          </FieldDescription>
        </Field>
        <div className="flex flex-row justify-center gap-10">
          <Button
            type="button"
            className="w-1/2"
            onClick={() => handleUpdate()}
            disabled={isLoading}
          >
            {isLoading && <Spinner />}
            Update Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAccount;
