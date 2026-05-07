import { useState } from 'react';

interface Props {
  src: string | null;
  alt: string;
  fallbackChar: string;
  fallbackColor: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, fallbackChar, fallbackColor, className = '' }: Props) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center font-bold text-white ${className}`}
        style={{ backgroundColor: fallbackColor }}
        aria-label={alt}
      >
        {fallbackChar.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
