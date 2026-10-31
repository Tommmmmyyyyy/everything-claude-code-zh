import { notFound } from "next/navigation";
import type { Metadata } from "next";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default function Layout() {
  // En production, l'administration n'est servie que si le mode GitHub est configuré.
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO) notFound();
  return <KeystaticApp />;
}
