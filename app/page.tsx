import { redirect } from "next/navigation";

/**
 * Entry URL sends authenticated users straight into the app hub.
 */
export default function Home() {
  redirect("/dashboard");
}
