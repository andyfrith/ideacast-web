import { SignIn } from "@clerk/nextjs";

/**
 * Clerk-hosted sign-in flow; path must stay public in `middleware.ts`.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
          },
        }}
      />
    </div>
  );
}
