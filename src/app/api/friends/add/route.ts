import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendSchema } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendSchema.parse(body.email);

    const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const idToAdd = (await fetchRedis("get", `user:email:${emailToAdd}`)) as
      | string
      | null;

    const data = (await RESTResponse.json()) as { result: string | null };
    console.log(data);

    const session = await getServerSession(authOptions);

    if (!idToAdd) {
      return new Response("User not found", { status: 404 });
    }

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("You can't add yourself as a friend", {
        status: 400,
      });
    }

    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Friend request already sent", { status: 400 });
    }

    const isAlreadyFriend = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriend) {
      return new Response("You are already friends", { status: 400 });
    }

    // Add friend request to the user if all checks pass
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("Friend request sent", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Internal server error", { status: 500 });
  }
}
