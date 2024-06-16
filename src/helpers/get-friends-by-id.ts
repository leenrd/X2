import { fetchRedis } from "./redis";

export async function getFriendsById(userId: string) {
  const getFriendsFromDb = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    getFriendsFromDb.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:{friendId}`)) as User;

      return friend;
    })
  );

  return friends;
}
