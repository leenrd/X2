"use client";

import { FC, useState } from "react";
import Button from "./button";
import { UserRoundPlus } from "lucide-react";
import { addFriendSchema } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendBtnProps {}

type FormData = z.infer<typeof addFriendSchema>;

const AddFriendBtn: FC<AddFriendBtnProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendSchema),
  });

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendSchema.parse({ email });
      await axios.post("/api/friends/add", { email: validatedEmail });
      setShowSuccessState(true);
      toast.success("Friend request sent!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Invalid input. Please try again.");
        setError("email", { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.error("User not found.");
          setError("email", { message: error.response?.data });
          return;
        } else {
          console.log(error.message);
          toast.error("An error occurred. Please try again.");
        }
      }
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form action="post" className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Enter your friend&apos;s email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400  focus:ring-slate-700 sm:text-sm sm:leading-6 pl-4 ${
            errors.email
              ? "ring-red-500 border-red-600 focus:ring-red-700"
              : "ring-gray-300"
          }`}
          placeholder="you@example.com"
        />
        <Button
          className="flex items-center gap-1 justify-center"
          isLoading={isSubmitting}
          type="submit"
        >
          <UserRoundPlus size={15} />
          Add
        </Button>
      </div>
      <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Friend request sent!</p>
      ) : null}
    </form>
  );
};

export default AddFriendBtn;
