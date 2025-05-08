import * as clerk from "@clerk/nextjs/server";

declare module "@clerk/nextjs/server" {
  interface SessionClaims {
    public_metadata: {
      role?: "regular" | "admin" | "client";
    };
  }
}