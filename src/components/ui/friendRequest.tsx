"use client";

import { fetchRedis } from "@/helpers/redis";
import { Users } from "lucide-react";
import Link from "next/link";
import { FC, useCallback, useEffect, useState } from "react";

interface FriendRequestProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendRequest: FC<FriendRequestProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

  return (
    <Link
      href="/feed/requests"
      className="text-gray-700 hover:text-gray-950 hover:bg-gray-50 group pl-4 flex gap-2 items-center rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <Users className="h-4 w-4" />
      <p className="truncate">Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center text-center items-center text-white bg-red-600">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequest;
