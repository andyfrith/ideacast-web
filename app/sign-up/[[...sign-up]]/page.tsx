import { SignUp } from "@clerk/nextjs";

/**
 * Clerk-hosted sign-up flow; path must stay public in `middleware.ts`.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
          },
        }}
      />
    </div>
  );
}
