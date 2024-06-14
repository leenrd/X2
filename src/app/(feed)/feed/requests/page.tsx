import FriendRequestList from "@/components/ui/friendRequestList";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

const Page: FC = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const requestSenderIDs = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingRequestsCredentials = await Promise.all(
    requestSenderIDs.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;
      return {
        senderId,
        senderName: senderParsed.name,
        senderEmail: senderParsed.email,
        senderImage: senderParsed.image,
      };
    })
  );

  return (
    <main className="pt-8 pl-10">
      <h1 className="font-bold text-3xl mb-8 tracking-tighter">
        Friend Requests
      </h1>
      <div className="flex flex-col gap-4 overflow-y-scroll min-h-[75vh]">
        <FriendRequestList
          requests={incomingRequestsCredentials}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default Page;
