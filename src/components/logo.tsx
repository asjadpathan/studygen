import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="StudyGen Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="text-2xl font-bold font-headline text-primary">
        StudyGen
      </span>
    </div>
  );
}
