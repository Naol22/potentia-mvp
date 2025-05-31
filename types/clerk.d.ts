// types/clerk.d.ts
declare module '@clerk/nextjs/server' {
  export interface SessionClaims {
    o?: {
      id: string;
      rol: string;
      slg: string;
    };
    sub?: string;
    exp?: number;
    iat?: number;
    iss?: string;
  }

  export interface AuthObject {
    sessionClaims?: SessionClaims;
    userId?: string;
  }
}