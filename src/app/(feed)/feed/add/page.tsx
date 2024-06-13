import AddFriendBtn from "@/components/ui/addFriendBtn";
import { FC } from "react";

const Page: FC = ({}) => {
  return (
    <main className="pt-8 pl-5">
      <h1 className="font-bold text-3xl mb-8 tracking-tighter">Add a friend</h1>
      <AddFriendBtn />
    </main>
  );
};

export default Page;
