import React, { useMemo } from 'react';

// Assets are self-hosted under /public/hero-parallax to avoid depending on a
// third-party CDN (the previous CodePen S3 bucket now returns 403, which is why
// the animation disappeared). Layer "1" was never recoverable from the archive,
// so layer "2" doubles as the closest foreground layer.
const layersData = [
  { className: 'layer-6', speed: '120s', size: '222px', zIndex: 1, image: '6' },
  { className: 'layer-5', speed: '95s', size: '311px', zIndex: 1, image: '5' },
  { className: 'layer-4', speed: '75s', size: '468px', zIndex: 1, image: '4' },
  { className: 'bike-1', speed: '10s', size: '75px', zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'bike-2', speed: '15s', size: '75px', zIndex: 2, image: 'bike', animation: 'parallax_bike', bottom: '100px', noRepeat: true },
  { className: 'layer-3', speed: '55s', size: '158px', zIndex: 3, image: '3' },
  { className: 'layer-2', speed: '30s', size: '145px', zIndex: 4, image: '2' },
  { className: 'layer-1', speed: '20s', size: '136px', zIndex: 5, image: '2' },
];

export default function MountainVistaParallax() {
  const dynamicStyles = useMemo(
    () =>
      layersData
        .map((layer) => {
          const url = `/hero-parallax/${layer.image}.png`;
          return `
          .mountain-vista-hero .${layer.className} {
            background-image: url(${url});
            animation-duration: ${layer.speed};
            background-size: auto ${layer.size};
            z-index: ${layer.zIndex};
            ${layer.animation ? `animation-name: ${layer.animation};` : 'animation-name: parallax_scroll;'}
            ${layer.bottom ? `bottom: ${layer.bottom};` : ''}
            ${layer.noRepeat ? 'background-repeat: no-repeat;' : 'background-repeat: repeat-x;'}
          }
        `;
        })
        .join('\n'),
    []
  );

  return (
    <div className="mountain-vista-hero absolute inset-0" aria-hidden="true">
      <style>{dynamicStyles}</style>
      {layersData.map((layer) => (
        <div key={layer.className} className={`parallax-layer ${layer.className}`} />
      ))}
    </div>
  );
}
