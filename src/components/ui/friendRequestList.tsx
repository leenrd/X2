"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { FC, useState } from "react";

interface FriendRequestListProps {
  sessionId: string;
  requests: incomingFriendRequest[];
}

const FriendRequestList: FC<FriendRequestListProps> = ({
  sessionId,
  requests,
}) => {
  const [incomingFriendRequests, setIncomingFriendRequests] =
    useState<incomingFriendRequest[]>(requests);
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
                //   onClick={() => acceptFriend(request.senderId)}
                aria-label="accept friend"
                className="text-white px-3 bg-blue-600 hover:bg-blue-700 grid place-items-center rounded-sm transition hover:shadow-md"
              >
                {/* <Check className="font-semibold text-white w-3/4 h-3/4" /> */}
                Accept
              </button>

              <button
                //   onClick={() => denyFriend(request.senderId)}
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
