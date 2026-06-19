import Image from "next/image"

export function BazoconLogo() {
  return (
    <Image
      src="/bazocon.png"
      width={320}
      height={120}
      alt="BAZOCON"
      priority
      className="h-auto w-36 object-contain sm:w-44"
    />
  )
}
