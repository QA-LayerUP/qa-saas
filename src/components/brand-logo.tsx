import Image from "next/image";

export function BrandLogo({
  className = "h-8 w-auto",
  width = 140,
  height = 42,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <>
      <Image
        src="/brand/logo-layerup.svg"
        alt="Layer Up"
        width={width}
        height={height}
        className={`hidden dark:block ${className}`}
        priority
      />
      <Image
        src="/brand/logo-layerup-light.svg"
        alt="Layer Up"
        width={width}
        height={height}
        className={`dark:hidden ${className}`}
        priority
      />
    </>
  );
}
