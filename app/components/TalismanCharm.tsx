import Image from 'next/image';
import { useState } from 'react';

interface TalismanCharmProps {
  imageUrl: string;
  alt: string;
}

export default function TalismanCharm({ imageUrl, alt }: TalismanCharmProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-red-50 shadow-md">
      <div className="relative h-64 w-full">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded-lg transition-opacity duration-300"
            onLoadingComplete={() => setIsLoading(false)}
          />
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600"></div>
          </div>
        )}
      </div>
    </div>
  );
} 