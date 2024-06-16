import ChatInput from "@/components/chat-input";
import Messages from "@/components/messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const Page: FC<PageProps> = async ({ params }) => {
  const chatId = params.chatId;
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const [userId1, userId2] = chatId.split("--");

  if (userId1 !== session.user.id && userId2 !== session.user.id) {
    notFound();
  }

  const chatPartnerId = userId1 === session.user.id ? userId2 : userId1;
  const chatPartner = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const partnerParsed = JSON.parse(chatPartner) as User;
  const initialMessages = (await getChatMessages(chatId)) as Message[];

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)] ">
      <header className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12 ml-6">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={partnerParsed.image}
                alt={`${partnerParsed.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold tracking-tighter">
                {partnerParsed.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>
      </header>
      <Messages
        initialMessages={initialMessages}
        chatId={chatId}
        chatPartner={partnerParsed}
        sessionId={session.user.id}
        imgFromSession={session.user.image}
      />
      <ChatInput chatId={chatId} chatPartner={partnerParsed} />
    </div>
  );
};

export default Page;
