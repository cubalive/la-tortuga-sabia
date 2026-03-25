"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import * as THREE from "three";

/* ═══ Quelina — Central Jade Sphere with Golden Constellations ═══ */
function Quelina() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (glowRef.current) {
      const scale = 1.15 + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  // Golden constellation points on sphere surface
  const constellationPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.02;
      points.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return points;
  }, []);

  // Lines connecting nearby constellation points
  const constellationLines = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < constellationPoints.length; i++) {
      for (let j = i + 1; j < constellationPoints.length; j++) {
        if (constellationPoints[i].distanceTo(constellationPoints[j]) < 0.8) {
          lines.push([constellationPoints[i], constellationPoints[j]]);
        }
      }
    }
    return lines;
  }, [constellationPoints]);

  return (
    <group>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#2D6A4F"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Main sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#2D6A4F"
          emissive="#1B4332"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Constellation dots */}
      {constellationPoints.map((point, i) => (
        <mesh key={`star-${i}`} position={point}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#C9882A" />
        </mesh>
      ))}

      {/* Constellation lines */}
      {constellationLines.map(([start, end], i) => (
        <ConstellationLine key={`line-${i}`} start={start} end={end} />
      ))}
    </group>
  );
}

function ConstellationLine({
  start,
  end,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
}) {
  const points = useMemo(
    () => [
      [start.x, start.y, start.z] as [number, number, number],
      [end.x, end.y, end.z] as [number, number, number],
    ],
    [start, end]
  );

  return (
    <Line
      points={points}
      color="#C9882A"
      transparent
      opacity={0.4}
      lineWidth={1}
    />
  );
}

/* ═══ Orbiting Planet ═══ */
function Planet({
  name,
  color,
  radius,
  speed,
  size,
  orbitTilt,
}: {
  name: string;
  color: string;
  radius: number;
  speed: number;
  size: number;
  orbitTilt: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * orbitTilt;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* Planet label - invisible but for accessibility */}
      <mesh position={[0, size + 0.15, 0]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/* ═══ Golden Stardust ═══ */
function GoldenDust() {
  const ref = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.02;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#C9882A"
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ═══ Dynamic Pulsing Light ═══ */
function PulsingLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight ref={lightRef} position={[5, 5, 5]} color="#C9882A" />
      <pointLight position={[-5, -3, -5]} color="#2D6A4F" intensity={0.8} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
    </>
  );
}

/* ═══ Auto-rotate on mobile ═══ */
function ResponsiveControls() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      autoRotate={isMobile}
      autoRotateSpeed={0.5}
      maxPolarAngle={Math.PI * 0.75}
      minPolarAngle={Math.PI * 0.25}
    />
  );
}

/* ═══ Scene ═══ */
function Scene() {
  return (
    <>
      <PulsingLight />
      <ResponsiveControls />

      {/* Star field */}
      <Stars
        radius={50}
        depth={60}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Quelina at center */}
      <Quelina />

      {/* 4 Orbiting Planets — one for each Tomo */}
      <Planet
        name="Tomo I"
        color="#4a7c5f"
        radius={2.5}
        speed={0.4}
        size={0.2}
        orbitTilt={0.3}
      />
      <Planet
        name="Tomo II"
        color="#7B68EE"
        radius={3.2}
        speed={0.3}
        size={0.18}
        orbitTilt={0.5}
      />
      <Planet
        name="Tomo III"
        color="#4682B4"
        radius={4.0}
        speed={0.2}
        size={0.22}
        orbitTilt={0.2}
      />
      <Planet
        name="Tomo IV"
        color="#C9882A"
        radius={4.8}
        speed={0.15}
        size={0.15}
        orbitTilt={0.6}
      />

      {/* Golden stardust */}
      <GoldenDust />
    </>
  );
}

/* ═══ Exported Component ═══ */
export default function QuellinaUniverse() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
