import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req, res) {
    const pathname = req.nextUrl.pathname;

    const isAuth = await getToken({ req });
    const userInLogin = pathname.startsWith("/login");
    const sensitiveRoutes = ["/feed"];
    const userInSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (userInLogin) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/feed", req.url));
      }

      return NextResponse.next();
    }

    if (!isAuth && userInSensitiveRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matchter: ["/", "/login", "/feed/:path*"],
};
