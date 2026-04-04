import Link from "next/link";

export function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const textClass = size === "lg" ? "text-xl" : "text-lg";
  return (
    <Link href="/" className={`${textClass} font-semibold tracking-tight`}>
      <span className="text-foreground">Pay</span>
      <span className="text-blue-400">Mate</span>
    </Link>
  );
}
