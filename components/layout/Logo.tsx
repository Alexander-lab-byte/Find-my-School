import Link from "next/link";
import { Icon } from "@/components/common/Icon";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Find My School Mongolia, home">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon name="graduation" className="size-4.5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-base font-semibold text-foreground sm:text-[17px]">
          Find My School
        </span>
        <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle sm:block">
          Mongolia
        </span>
      </span>
    </Link>
  );
}
