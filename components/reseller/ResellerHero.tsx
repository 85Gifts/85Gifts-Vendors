import Image from 'next/image';

interface ResellerHeroProps {
  className?: string;
}

export default function ResellerHero({ className = '' }: ResellerHeroProps) {
  return (
    <Image
      src="/webtech-experts.png"
      alt="Reseller earnings and referral growth illustration"
      width={3000}
      height={2000}
      priority
      className={`h-auto ${className}`}
    />
  );
}
