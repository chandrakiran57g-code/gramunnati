import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  mud: '#8B6914',
  mudLight: '#A0785A',
  mudDark: '#6B4F3A',
  thatch: '#C4A35A',
  thatchLight: '#D4B86A',
  wood: '#5C4033',
  field: '#B8A038',
  fieldGreen: '#6B8E23',
  path: '#9B7653',
  stone: '#7A7067',
  water: '#5A7A6A',
  trunk: '#4A3728',
  leaf: '#3D5C2E',
  leafDark: '#2F4A22',
  smoke: '#C8B8A8',
};

function RollingHill({ position, scale, color }) {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
      <meshStandardMaterial color={color} roughness={1} flatShading={false} />
    </mesh>
  );
}

function MudHouse({ position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.48, 0.68]} />
        <meshStandardMaterial color={COLORS.mudLight} roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.08, 0.35]}>
        <boxGeometry args={[0.72, 0.12, 0.06]} />
        <meshStandardMaterial color={COLORS.mudDark} roughness={1} />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.58, 0.38, 10]} />
        <meshStandardMaterial color={COLORS.thatch} roughness={1} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow>
        <coneGeometry args={[0.62, 0.28, 10]} />
        <meshStandardMaterial color={COLORS.thatchLight} roughness={1} />
      </mesh>
      <mesh position={[0, 0.2, 0.35]}>
        <boxGeometry args={[0.18, 0.3, 0.02]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.95} />
      </mesh>
      <mesh position={[-0.22, 0.52, 0.35]}>
        <boxGeometry args={[0.12, 0.14, 0.02]} />
        <meshStandardMaterial color="#1a1208" roughness={1} />
      </mesh>
    </group>
  );
}

function VillageSchool({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.95, 0.8]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[1.28, 0.14, 0.92]} />
        <meshStandardMaterial color="#8B4513" roughness={0.88} />
      </mesh>
      {[-0.38, 0, 0.38].map((x) => (
        <mesh key={x} position={[x, 0.48, 0.41]}>
          <planeGeometry args={[0.2, 0.28]} />
          <meshStandardMaterial color="#4A6741" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.18, 0.42]}>
        <boxGeometry args={[0.28, 0.38, 0.03]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.95} />
      </mesh>
    </group>
  );
}

function BanyanTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.1, 8]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.75, 10, 8]} />
        <meshStandardMaterial color={COLORS.leaf} roughness={0.9} />
      </mesh>
      <mesh position={[0.45, 1.05, 0.2]} castShadow>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color={COLORS.leafDark} roughness={0.92} />
      </mesh>
      <mesh position={[-0.4, 1.1, -0.15]} castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={COLORS.leaf} roughness={0.92} />
      </mesh>
    </group>
  );
}

function PalmTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 1.5, 6]} />
        <meshStandardMaterial color="#6B5344" roughness={0.95} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[0, 1.55, 0]}
          rotation={[0.4 + i * 0.15, (i * Math.PI * 2) / 5, 0.6]}
        >
          <boxGeometry args={[0.08, 0.7, 0.02]} />
          <meshStandardMaterial color={COLORS.leaf} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function VillageWell({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.44, 10]} />
        <meshStandardMaterial color={COLORS.stone} roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <torusGeometry args={[0.3, 0.04, 8, 16]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.9} />
      </mesh>
      <mesh position={[-0.28, 0.62, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.06, 0.55, 0.06]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.92} />
      </mesh>
      <mesh position={[0.28, 0.62, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.06, 0.55, 0.06]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.92} />
      </mesh>
    </group>
  );
}

function HayStack({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.22, 0.56, 8]} />
        <meshStandardMaterial color={COLORS.thatchLight} roughness={1} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <coneGeometry args={[0.24, 0.22, 8]} />
        <meshStandardMaterial color={COLORS.field} roughness={1} />
      </mesh>
    </group>
  );
}

function BullockCart({ position, rotation = 0 }) {
  const wheel = useRef();
  useFrame((_, delta) => {
    if (wheel.current) wheel.current.rotation.x += delta * 0.15;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.35]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.95} />
      </mesh>
      <group ref={wheel} position={[-0.18, 0.14, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 12]} />
          <meshStandardMaterial color={COLORS.mudDark} roughness={0.9} />
        </mesh>
      </group>
      <mesh position={[0.18, 0.14, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 12]} />
        <meshStandardMaterial color={COLORS.mudDark} roughness={0.9} />
      </mesh>
      <mesh position={[-0.32, 0.42, 0]}>
        <boxGeometry args={[0.04, 0.55, 0.04]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.95} />
      </mesh>
    </group>
  );
}

function CropField({ position, size = [4, 3] }) {
  const stalks = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: ((i % 10) - 4.5) * (size[0] / 10),
        z: (Math.floor(i / 10) - 3.5) * (size[1] / 8),
        h: 0.12 + (i % 5) * 0.02,
        color: i % 2 === 0 ? '#A09030' : '#8B7D2B',
      })),
    [size]
  );

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color={COLORS.field} roughness={1} />
      </mesh>
      {stalks.map((s, i) => (
        <mesh key={i} position={[s.x, -0.42, s.z]}>
          <boxGeometry args={[0.04, s.h, 0.02]} />
          <meshStandardMaterial color={s.color} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function DirtPath() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.3]} position={[0.5, -0.48, 1.5]} receiveShadow>
      <planeGeometry args={[1.2, 8]} />
      <meshStandardMaterial color={COLORS.path} roughness={1} />
    </mesh>
  );
}

function VillagePond({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.9, 32]} />
      <meshStandardMaterial
        color={COLORS.water}
        roughness={0.15}
        metalness={0.05}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function ChimneySmoke({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const phase = clock.elapsedTime % 2.5;
    ref.current.position.y = position[1] + phase * 0.28;
    const s = 0.45 + phase * 0.25;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshStandardMaterial color={COLORS.smoke} transparent opacity={0.28} roughness={1} />
    </mesh>
  );
}

function SceneContent({ reducedMotion }) {
  const worldRef = useRef();

  useFrame((state) => {
    if (!worldRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    worldRef.current.rotation.y = Math.sin(t * 0.08) * 0.04;
  });

  const scatteredTrees = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        position: [(Math.random() - 0.5) * 14, -0.5, (Math.random() - 0.5) * 10 - 2],
        scale: 0.7 + Math.random() * 0.6,
        type: i % 4 === 0 ? 'palm' : 'banyan',
      })),
    []
  );

  return (
    <>
      <color attach="background" args={['#C4855A']} />
      <fog attach="fog" args={['#D4A574', 8, 28]} />

      <Sky
        distance={450000}
        sunPosition={[12, 3, -6]}
        inclination={0.55}
        azimuth={0.28}
        mieCoefficient={0.012}
        mieDirectionalG={0.85}
        rayleigh={0.6}
        turbidity={12}
      />

      <ambientLight intensity={0.55} color="#FFE4C4" />
      <directionalLight
        position={[10, 4, -3]}
        intensity={1.6}
        color="#FFD699"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 3, 4]} intensity={0.25} color="#E8C4A0" />
      <hemisphereLight args={['#F5DEB3', '#6B8E23', 0.45]} />

      <group ref={worldRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.52, 0]} receiveShadow>
          <planeGeometry args={[32, 32]} />
          <meshStandardMaterial color="#7A9A4A" roughness={1} />
        </mesh>

        <RollingHill position={[-5, -0.1, -4]} scale={[5, 1.5, 4]} color="#6B8E23" />
        <RollingHill position={[5, -0.15, -5]} scale={[6, 1.8, 4.5]} color="#5A7A3A" />
        <RollingHill position={[0, -0.2, -8]} scale={[8, 2.2, 6]} color="#4A6A32" />

        <CropField position={[-4, 0, -1]} size={[5, 4]} />
        <CropField position={[4.5, 0, -2]} size={[4, 3.5]} />

        <DirtPath />
        <VillagePond position={[2.5, -0.47, 0.8]} />

        <MudHouse position={[-1.8, -0.52, 1.2]} rotation={0.5} scale={1.05} />
        <MudHouse position={[-0.3, -0.52, 2]} rotation={-0.4} />
        <MudHouse position={[1.1, -0.52, 1.3]} rotation={1.2} scale={0.92} />
        <MudHouse position={[0.4, -0.52, 0.2]} rotation={2.4} scale={0.88} />

        <ChimneySmoke position={[-1.8, 0.95, 1.2]} />
        <ChimneySmoke position={[-0.3, 0.95, 2]} />

        <VillageSchool position={[-3.2, -0.52, 2.5]} />
        <VillageWell position={[0.8, -0.52, -0.3]} />
        <HayStack position={[1.8, -0.52, -0.8]} />
        <HayStack position={[2.1, -0.52, -0.5]} scale={0.85} />
        <BullockCart position={[-0.5, -0.52, -1.2]} rotation={0.6} />

        {scatteredTrees.map((t, i) =>
          t.type === 'palm' ? (
            <PalmTree key={i} position={t.position} scale={t.scale} />
          ) : (
            <BanyanTree key={i} position={t.position} scale={t.scale} />
          )
        )}
      </group>
    </>
  );
}

export default function VillageScene3D({ className = '' }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!ready) {
    return <div className={`${className} home-hero-fallback`} aria-hidden="true" />;
  }

  return (
    <div className={`${className} village-scene-wrap`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 2.4, 8], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContent reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
