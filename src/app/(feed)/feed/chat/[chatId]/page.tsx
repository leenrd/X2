import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
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

  return <div>{chatId}</div>;
};

export default Page;
