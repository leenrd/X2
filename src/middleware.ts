import { withAuth } from "next-auth/middleware";

export default withAuth(async function middleware(req, res) {
  // Your code here
});

export const config = {
  matchter: ["/", "/login", "/dashboard/:path*"],
};
