import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const UnfriendValidation = z.object({
      chatId: z.string(),
      friendId: z.string(),
    });

    const body = await req.json();
    const { chatId, friendId } = UnfriendValidation.parse(body);

    const session = await getServerSession(authOptions);
    if (!session) return { status: 401, body: { message: "Unauthorized" } };

    const isFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      friendId
    );

    if (!isFriends) {
      return new Response("You're not friends. Please refresh the page", {
        status: 400,
      });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${friendId}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "remove_friend",
        friend
      ),
      db.srem(`user:${session.user.id}:friends`, friendId),
      db.srem(`user:${friendId}:friends`, session.user.id),
      db.del(`chat:${chatId}:messages`),
    ]);

    return new Response("Unfriended", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid Request Payload", { status: 400 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
