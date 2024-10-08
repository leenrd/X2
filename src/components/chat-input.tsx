"use client";

import axios from "axios";
import { FC, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { runGemini } from "@/lib/ai";

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
  lastMessage: Message;
}

const ChatInput: FC<ChatInputProps> = ({
  chatPartner,
  chatId,
  lastMessage,
}) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [fromAI, setFromAI] = useState<string>("Fetching AI quick reply...");

  const sendMessage = async () => {
    if (!input) return;
    setLoading(true);

    try {
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
      setFromAI(await runGemini(lastMessage.message));
      textareaRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  const handleAI = () => {
    setInput((prev) => (prev = fromAI));
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-black">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button
              isLoading={isLoading}
              onClick={sendMessage}
              type="submit"
              IconUse={"SendHorizontal"}
              iconPlacement="right"
              variant={"expandIcon"}
              size={"md"}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
      <Button
        variant={"ghost"}
        onClick={() => handleAI()}
        className="mb-7 mt-3 py-2 flex items-center justify-start gap-4 w-full"
      >
        <Sparkles className="animate-pulse" size={20} />
        <p className="truncate">
          Click to use AI quick reply :: <strong>{fromAI}</strong>
        </p>
      </Button>
    </div>
  );
};

export default ChatInput;
