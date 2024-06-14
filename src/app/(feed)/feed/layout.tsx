import { Icon, Icons } from "@/components/icons";
import SignOutButton from "@/components/ui/signOutButton";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

interface sideBarProps {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sideBarItems: sideBarProps[] = [
  {
    id: 1,
    name: "Add Friend",
    href: "/feed/add",
    Icon: "UserPlus",
  },
];

const Layout: FC<LayoutProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  return (
    <div className="w-full flex h-screen">
      <aside className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-100 px-6">
        <Link href="/feed" className="flex h-16 shrink-0 items-center">
          <Icons.Shell className="h-8 w-auto text-black" />
        </Link>

        <h1 className="leading-4 text-lg font-bold tracking-tighter">
          Your Chats
        </h1>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>Chat&apos;s the user have</li>
            <li>
              <h1 className="leading-4 text-lg font-bold tracking-tighter">
                Overview
              </h1>

              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sideBarItems.map((item) => {
                  const Icon = Icons[item.Icon];
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-gray-700 hover:text-gray-950 hover:bg-gray-50 group pl-4 flex gap-2 items-center rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="-mx-6 mt-auto mb-4 flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full scale-125"
                    src={session.user.image || ""}
                    alt="Your profile picture"
                  />
                </div>

                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{session.user.name}</span>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="mr-2 h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </aside>
      <article className="max-h-screen container py-16 md:py-12 w-full">
        {children}
      </article>
    </div>
  );
};

export default Layout;
