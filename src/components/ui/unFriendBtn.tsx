"use client";

import { FC, useState } from "react";
import Button from "./button";
import { AudioLines, Loader, UserRoundX } from "lucide-react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UnFriendBtnProps {
  partnerId: string;
  chatId: string;
}

const UnFriendBtn: FC<UnFriendBtnProps> = ({ partnerId, chatId }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function unfriendUser(friendId: string, chatId: string) {
    try {
      setIsLoading(true);
      await axios.post("/api/friends/unfriend", {
        friendId: friendId,
        chatId: chatId,
      });
      toast.success("Unfriended", {
        icon: "😔",
      });
      router.push("/feed/add");
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data === "You're not friends to begin with") {
          toast.error("You're not friends to begin with");
          return;
        } else {
          console.log(error.message);
          toast.error(error.response?.data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="pr-8 flex gap-1.5 items-center">
      <Button variant={"ghost"}>
        <AudioLines size={17} className="mr-2" />
        <p>Transcript</p>
      </Button>
      <Button
        variant={"destructive"}
        onClick={() => unfriendUser(partnerId, chatId)}
        disabled={isLoading}
      >
        {!isLoading ? (
          <UserRoundX size={17} className="text-white mr-2" />
        ) : (
          <Loader className="animate-spin mr-2" size={17} />
        )}
        <p>Unfriend</p>
      </Button>
    </div>
  );
};

export default UnFriendBtn;
