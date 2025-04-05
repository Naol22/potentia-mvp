import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-15">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
