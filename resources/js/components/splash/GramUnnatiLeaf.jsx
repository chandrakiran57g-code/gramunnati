import { motion } from 'framer-motion';

const LEAF_PATH =
  'M40 6 C16 32, 10 72, 40 114 C70 72, 64 32, 40 6 Z';

export default function GramUnnatiLeaf({ gradientId = 'leaf-grad', className = '' }) {
  return (
    <svg
      viewBox="0 0 80 120"
      className={className}
      aria-hidden="true"
      overflow="visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#52B788" />
          <stop offset="45%" stopColor="#2D6A4F" />
          <stop offset="100%" stopColor="#1B4332" />
        </linearGradient>
      </defs>
      <motion.path
        d={LEAF_PATH}
        fill={`url(#${gradientId})`}
        stroke="#1B4332"
        strokeWidth="0.6"
        strokeOpacity="0.25"
      />
      <path
        d="M40 14 Q38 60 40 106"
        fill="none"
        stroke="#D8F3DC"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
    </svg>
  );
}
