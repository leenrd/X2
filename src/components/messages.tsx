"use client";

import { cn, toPusherKey } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";
import { FC, useRef, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
  chatId: string;
  imgFromSession: string | null | undefined;
  chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatId,
  chatPartner,
  imgFromSession,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const messageHandler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef}>
        {messages.map((message, index) => {
          const currentUser = message.senderId === sessionId;
          const hasBeforeMessageFromSameUser =
            messages[index - 1]?.senderId === messages[index].senderId;
          const hasNextMessageFromSameUser =
            messages[index + 1]?.senderId === messages[index].senderId;

          return (
            <div
              key={`${message.id}-${message.timestamp}`}
              className="chat-message"
            >
              <div
                className={cn("flex items-end mb-1", {
                  "justify-end": currentUser,
                })}
              >
                <div
                  className={cn(
                    "flex flex-col space-y-2 text-base max-w-xs mx-2",
                    {
                      "order-1 items-end": currentUser,
                      "order-2 items-start": !currentUser,
                    }
                  )}
                >
                  <span
                    className={cn("px-4 py-2 rounded-lg inline-block", {
                      "bg-sky-600 text-white": currentUser,
                      "bg-gray-200 text-gray-900": !currentUser,
                      "rounded-br-none":
                        (!hasBeforeMessageFromSameUser && currentUser) ||
                        (hasNextMessageFromSameUser && currentUser),
                      "rounded-tr-none":
                        hasBeforeMessageFromSameUser && currentUser,
                      "rounded-bl-none":
                        (!hasBeforeMessageFromSameUser && !currentUser) ||
                        (hasNextMessageFromSameUser && !currentUser),
                      "rounded-tl-none":
                        hasBeforeMessageFromSameUser && !currentUser,
                    })}
                  >
                    {message.message}{" "}
                    <span
                      className={cn("ml-2 text-xs", {
                        "text-gray-200/60": currentUser,
                        "text-gray-400/60": !currentUser,
                      })}
                    >
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </span>
                </div>
                <div
                  className={cn("relative w-6 h-6", {
                    "order-2": currentUser,
                    "order-1": !currentUser,
                    invisible: hasBeforeMessageFromSameUser,
                  })}
                >
                  <Image
                    fill
                    src={
                      currentUser
                        ? (imgFromSession as string)
                        : chatPartner.image
                    }
                    alt="Profile picture"
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
