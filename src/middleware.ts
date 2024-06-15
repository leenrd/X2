import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";

export default withAuth(async function middleware(req, res) {
  const pathname = req.nextUrl.pathname;

  const isAuth = getToken({ req });
  const userInLogin = pathname.startsWith("/login");
  const sensitiveRoutes = ["/dashboard"];
});

export const config = {
  matchter: ["/", "/login", "/dashboard/:path*"],
};
