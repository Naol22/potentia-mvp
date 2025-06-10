interface SessionClaims {
    o: {
      rol: string;
      // Add other OpenID Connect claims as needed
    };
  }
  
  interface AuthResult {
    sessionClaims: SessionClaims | undefined;
    userId: string | undefined;
  }
  