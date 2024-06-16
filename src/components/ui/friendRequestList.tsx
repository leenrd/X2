"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { log } from "console";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FriendRequestListProps {
  sessionId: string;
  requests: IncomingFriendRequest[];
}

const FriendRequestList: FC<FriendRequestListProps> = ({
  sessionId,
  requests,
}) => {
  const router = useRouter();
  const [incomingFriendRequests, setIncomingFriendRequests] =
    useState<IncomingFriendRequest[]>(requests);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    console.log("listening to ", `user:${sessionId}:incoming_friend_requests`);

    const friendRequestHandler = ({
      senderId,
      senderEmail,
      senderName,
      senderImage,
    }: IncomingFriendRequest) => {
      console.log("function got called");
      setIncomingFriendRequests((prev) => [
        ...prev,
        { senderId, senderEmail, senderName, senderImage },
      ]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    try {
      await axios.post("/api/friends/accept", { id: senderId });

      setIncomingFriendRequests((prev) => {
        const updatedRequests = prev.filter(
          (request) => request.senderId !== senderId
        );
        console.log("Updated Requests:", updatedRequests);
        return updatedRequests;
      });
      toast.success("Friend request accepted!", {
        icon: "🎉",
      });
      router.refresh();
    } catch (error: any) {
      console.log(error.response);
      if (error instanceof AxiosError) {
        return new Response("Invalid request payload", { status: 422 });
      }
    }
  };

  const denyFriend = async (senderId: string) => {
    try {
      await axios.post("/api/friends/deny", { id: senderId });

      setIncomingFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );
      toast.success("Friend successfully denied!", {
        icon: "😔",
      });
      router.refresh();
    } catch (error: any) {
      console.log(error.response);
      if (error instanceof AxiosError) {
        return new Response("Invalid request payload", { status: 422 });
      }
    }
  };

  return (
    <>
      {" "}
      {incomingFriendRequests.length === 0 ? (
        <p className="leading-3 font-semibold">Nothing to show here ....</p>
      ) : (
        incomingFriendRequests.map((request) => (
          <div
            key={request.senderId}
            className="flex gap-10 items-center border border-slate-200 rounded-md w-fit px-6 py-3"
          >
            <section className="flex gap-5 items-center justify-start">
              <div className="relative h-8 w-8 bg-gray-50">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  className="rounded-full scale-125"
                  src={request.senderImage || ""}
                  alt="Your profile picture"
                />
              </div>
              <div className="flex flex-col">
                <span aria-hidden="true">{request.senderName}</span>
                <span className="text-xs text-zinc-400" aria-hidden="true">
                  {request.senderEmail}
                </span>
              </div>
            </section>
            <div className="flex gap-2.5">
              <button
                onClick={() => acceptFriend(request.senderId)}
                aria-label="accept friend"
                className="text-white px-3 bg-blue-600 hover:bg-blue-700 grid place-items-center rounded-sm transition hover:shadow-md"
              >
                Accept
              </button>

              <button
                onClick={() => denyFriend(request.senderId)}
                aria-label="deny friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-sm transition hover:shadow-md"
              >
                <X className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequestList;
