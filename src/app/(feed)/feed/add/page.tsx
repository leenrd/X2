import AddFriendForm from "@/components/ui/addFriendForm";
import { FC } from "react";

const Page: FC = ({}) => {
  return (
    <main className="pt-8 pl-10">
      <h1 className="font-bold text-3xl mb-8 tracking-tighter">Add a friend</h1>
      <AddFriendForm />
    </main>
  );
};

export default Page;
