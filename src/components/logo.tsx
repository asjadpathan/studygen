import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="StudyGen Logo"
        width={100}
        height={32}
        className="h-8 w-auto"
      />
    </div>
  );
}
