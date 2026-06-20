import { useEffect, useRef, useState } from 'react';
import SafeImage from '@/components/shared/SafeImage';
import { VILLAGE_HERO_PHOTOS } from '@/lib/villageImages';

const VIDEO_SRC = '/video/Generate_video_without_subtitles_202606202043.mp4';
const POSTER_SRC = VILLAGE_HERO_PHOTOS[0].url.replace('w=1920', 'w=1200');

export default function VisionVideo({ className = '' }) {
  const videoRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useFallback) return undefined;

    const play = () => {
      video.play().catch(() => {
        /* autoplay blocked — poster stays visible until interaction */
      });
    };

    if (video.readyState >= 2) {
      setReady(true);
      play();
    } else {
      video.addEventListener('loadeddata', () => {
        setReady(true);
        play();
      }, { once: true });
    }

    return undefined;
  }, [useFallback]);

  if (useFallback) {
    return (
      <SafeImage
        src={POSTER_SRC}
        alt="Citizens supporting village development"
        fallbackIndex={0}
        width={1200}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`relative w-full h-full bg-[#2d4a3e] ${className}`}>
      <SafeImage
        src={POSTER_SRC}
        alt=""
        fallbackIndex={0}
        width={1200}
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`relative z-[1] w-full h-full object-cover transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Citizens supporting village development"
        onError={() => setUseFallback(true)}
        onLoadedData={() => setReady(true)}
      />
    </div>
  );
}
