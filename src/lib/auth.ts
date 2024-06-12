import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: process.env.DATABASE_URL,
};
