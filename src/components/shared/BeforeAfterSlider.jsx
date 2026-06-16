import { useState, useRef, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel = 'Before', afterLabel = 'After' }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleDown = () => { dragging.current = true; };
  const handleUp = () => { dragging.current = false; };

  useEffect(() => {
    const handleMouseMove = (e) => { if (dragging.current) handleMove(e); };
    const handleTouchMove = (e) => { if (dragging.current) handleMove(e); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize select-none" onMouseDown={handleDown} onTouchStart={handleDown}>
      <img src={afterImage} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
        <img src={beforeImage} alt={beforeLabel} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (sliderPos / 100)}%` }} />
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{beforeLabel}</span>
      </div>
      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{afterLabel}</span>
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white bg-black/40 py-1">← Drag to Compare →</div>
    </div>
  );
}