import type { MessageType } from "@/types/chat.types";
import {
  messageSchema,
  type MessageSchemaType,
} from "@/validators/message.validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Check, Paperclip, Send, X } from "lucide-react";
import { Form, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import ChatReplyBar from "./chat-reply-bar";
import { useChat } from "@/hooks/use-chat";
import EditMessageBar from "./edit-message-bar";

interface Props {
  replyTo: MessageType | null;
  editMessage: MessageType | null;
  chatId: string | null;
  currentUserId: string | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
}

const ChatFooter = ({
  replyTo,
  editMessage,
  chatId,
  currentUserId,
  onCancelReply,
  onCancelEdit,
}: Props) => {
  const { sendMessage, sendEditMessage } = useChat();

  const [image, setImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState<string>(editMessage?.content || "");

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "" },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) setImage(reader.result?.toString());
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const onSubmit = (values: MessageSchemaType) => {
    if (!values.message?.trim() && !image) {
      toast.error("Please enter a message or select an image");
      return;
    }

    if (!chatId) return;

    if (editMessage) {
      editMessage.content = text;
      sendEditMessage(chatId, editMessage);
      onCancelEdit();
    } else {
      sendMessage({
        chatId,
        content: values.message,
        image: image || undefined,
        replyTo,
      });
      onCancelReply();
    }
    handleRemoveImage();
    form.reset();
    setText("");
  };

  const cancelEditAndClearField = () => {
    setText("");
    onCancelEdit();
  };

  useEffect(() => {
    if (editMessage?.content) setText(editMessage.content);
  }, [editMessage?.content]);

  return (
    <>
      <div className="sticky bottom-0 inset-x-0 z-999 bg-card border-t border-border py-4">
        {image && (
          <div className="max-w-6xl mx-auto px-8.5">
            <div className="relative w-fit">
              <img
                src={image}
                className="object-contain h-16 bg-muted min-w-16"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-px right-1 bg-black/50 text-white rounded-full cursor-pointer"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-6xl px-8.5 mx-auto flex items-end gap-2"
          >
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => imageInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageChange}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Input
                    {...field}
                    value={text}
                    autoComplete="off"
                    placeholder="Type new message"
                    className="min-h-10 bg-background"
                    onChangeCapture={(e) => setText(e.currentTarget.value)}
                  />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-lg"
              disabled={
                (text.length <= 0 && !image) || editMessage?.content === text
              }
            >
              {editMessage?.content && <Check className="h-3.5 w-3.5" />}
              {!editMessage?.content && <Send className="h-3.5 w-3.5" />}
            </Button>
          </form>
        </Form>
      </div>

      {replyTo && (
        <ChatReplyBar
          replyTo={replyTo}
          currentUserId={currentUserId}
          onCancel={onCancelReply}
        />
      )}

      {editMessage && <EditMessageBar onCancel={cancelEditAndClearField} />}
    </>
  );
};

export default ChatFooter;
