"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = (newFriend: User) => {
      router.refresh();
      setActiveChats((prev) => [...prev, newFriend]);
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      setUnseenMessages((prev) => [...prev, message]);
    };

    const removeFriendHandler = (friendId: string) => {
      router.push("/feed/add");
      setActiveChats((prev) => prev.filter((friend) => friend.id !== friendId));
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);
    pusherClient.bind("remove_friend", removeFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
      pusherClient.unbind("remove_friend", removeFriendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (!pathname?.includes("chat")) {
      setUnseenMessages((prev) =>
        prev.filter((msg) => !pathname?.includes(msg.senderId))
      );
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[20rem] overflow-y-auto space-y-1 -mx-2">
      {activeChats.sort().map((friend) => {
        const unseenMsgCount = unseenMessages.filter((msg) => {
          return msg.senderId === friend.id;
        }).length;
        {
          return !friend ? null : (
            <li key={friend.id}>
              <a
                href={`/feed/chat/${chatHrefConstructor(sessionId, friend.id)}`}
                className="flex items-center gap-x-6 px-3 py-3 rounded-md hover:bg-black/15"
              >
                <div className="w-8 h-8 relative rounded-full">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full scale-125"
                    src={friend.image || ""}
                    alt="Your profile picture"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-black">
                    {friend.name}
                  </span>
                  <span className="text-xs text-gray-500">{friend.email}</span>
                </div>
                {unseenMsgCount > 0 ? (
                  <span className="rounded-full w-6 h-6 text-xs flex justify-center text-center items-center text-white bg-red-600">
                    {unseenMsgCount < 99 ? unseenMsgCount : "99+"}
                  </span>
                ) : null}
              </a>
            </li>
          );
        }
      })}
    </ul>
  );
};

export default SidebarChatList;
