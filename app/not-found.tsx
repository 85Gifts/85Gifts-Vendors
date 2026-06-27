import Link from 'next/link';
import NotFoundSVG from '@/components/NotFoundSVG';

export default function NotFound() {
  return (
    <div className="wrapper w-full h-screen flex items-center justify-center bg-background relative">
      <Link href="/" className="absolute top-6 left-6 bg-blue-500 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm z-10 no-underline">← Return Home</Link>
      <NotFoundSVG />
    </div>
  )
}
