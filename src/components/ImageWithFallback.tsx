import { useState, useEffect } from 'react';

interface Props {
  src: string | null;
  alt: string;
  fallbackChar: string;
  fallbackColor: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, fallbackChar, fallbackColor, className = '' }: Props) {
  const [failed, setFailed] = useState(!src);

  // Reseta o estado quando a src muda (evita ficar travado no fallback)
  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center font-bold text-white ${className}`}
        style={{ backgroundColor: fallbackColor }}
        aria-label={alt}
      >
        {(fallbackChar || '?').toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
