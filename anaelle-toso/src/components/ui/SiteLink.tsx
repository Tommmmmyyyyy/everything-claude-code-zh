import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { DEMO, siteHref } from "@/lib/config";

/** Lien interne : next/link en production, simple <a> relatif en mode démo (export statique). */
export function SiteLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (DEMO) return <a href={siteHref(href)} {...rest} />;
  return <Link href={href} {...rest} />;
}
