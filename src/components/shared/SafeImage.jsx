import { useState } from 'react';
import { resolveImageUrl } from '@/lib/villageImages';

export default function SafeImage({
  src,
  alt = '',
  fallbackIndex = 0,
  width = 1920,
  className = '',
  loading,
  onError: onErrorProp,
  ...props
}) {
  const [resolved, setResolved] = useState(() => resolveImageUrl(src, fallbackIndex, width));
  const [errored, setErrored] = useState(false);

  const handleError = (e) => {
    if (!errored) {
      setErrored(true);
      setResolved(resolveImageUrl(null, fallbackIndex, width));
    }
    onErrorProp?.(e);
  };

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
}
