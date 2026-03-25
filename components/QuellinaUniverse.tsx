"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import * as THREE from "three";

/* ═══ Cute Quelina Turtle ═══ */
function Quelina() {
  const group = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const [blinking, setBlinking] = useState(false);

  // Blink every 3-4 seconds
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      // Gentle floating
      group.current.position.y = Math.sin(t * 0.8) * 0.15;
      group.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    }
    // Eye blink
    if (eyeL.current && eyeR.current) {
      const sy = blinking ? 0.1 : 1;
      eyeL.current.scale.y = sy;
      eyeR.current.scale.y = sy;
    }
    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2) * 0.3;
    }
  });

  // Shell constellation points
  const constellations = useMemo(() => {
    const pts: { pos: [number, number, number]; delay: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const phi = Math.acos(2 * Math.random() - 1) * 0.6 + 0.3;
      const theta = Math.random() * Math.PI * 2;
      const r = 0.82;
      pts.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) + 0.35,
          r * Math.sin(phi) * Math.sin(theta),
        ],
        delay: Math.random() * 3,
      });
    }
    return pts;
  }, []);

  return (
    <group ref={group}>
      {/* Body — flattened jade sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.6} metalness={0.2} />
        <mesh scale={[1, 0.65, 1]}>
          <sphereGeometry args={[1.01, 32, 32]} />
          <meshStandardMaterial color="#2D6A4F" roughness={0.5} />
        </mesh>
      </mesh>

      {/* Shell — dome on top */}
      <mesh position={[0, 0.35, 0]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#1B4332"
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Shell hexagonal lines */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <mesh
          key={angle}
          position={[0, 0.4, 0]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.02, 0.5, 0.8]} />
          <meshStandardMaterial color="#C9882A" emissive="#C9882A" emissiveIntensity={0.3} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Constellation dots on shell */}
      {constellations.map((c, i) => (
        <ConstellationDot key={i} position={c.pos} delay={c.delay} />
      ))}

      {/* Head */}
      <mesh position={[1.1, 0.1, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#40916C" roughness={0.5} />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeL} position={[1.35, 0.22, 0.15]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#050d12" />
      </mesh>
      <mesh position={[1.38, 0.24, 0.14]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={eyeR} position={[1.35, 0.22, -0.15]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#050d12" />
      </mesh>
      <mesh position={[1.38, 0.24, -0.14]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Smile */}
      <mesh position={[1.32, 0.02, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <torusGeometry args={[0.08, 0.015, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#1B4332" />
      </mesh>

      {/* Legs — 4 rounded cylinders */}
      {[
        [0.5, -0.45, 0.55],
        [0.5, -0.45, -0.55],
        [-0.5, -0.45, 0.55],
        [-0.5, -0.45, -0.55],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <capsuleGeometry args={[0.12, 0.25, 8, 16]} />
          <meshStandardMaterial color="#40916C" roughness={0.6} />
        </mesh>
      ))}

      {/* Tail */}
      <mesh ref={tailRef} position={[-1.15, -0.1, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color="#40916C" />
      </mesh>
    </group>
  );
}

/* ═══ Glowing constellation dot on shell ═══ */
function ConstellationDot({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 1.5 + delay) * 0.4;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#C9882A" transparent opacity={0.6} />
    </mesh>
  );
}

/* ═══ Orbiting Planet with Ring ═══ */
function Planet({
  color,
  ringColor,
  radius,
  speed,
  size,
  tilt,
}: {
  color: string;
  ringColor: string;
  radius: number;
  speed: number;
  size: number;
  tilt: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = Math.sin(t * 0.5) * tilt;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Luminous ring */}
      <mesh rotation={[Math.PI * 0.4, 0, 0]}>
        <torusGeometry args={[size * 1.8, 0.015, 8, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ═══ Golden Orbiting Dust ═══ */
function GoldenDust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 4;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C9882A" size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ═══ Pulsing Lights ═══ */
function Lights() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(clock.getElapsedTime() * 2) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight ref={lightRef} position={[5, 5, 5]} color="#C9882A" />
      <pointLight position={[-5, -3, -5]} color="#2D6A4F" intensity={0.6} />
      <directionalLight position={[0, 10, 5]} intensity={0.4} />
    </>
  );
}

/* ═══ Controls — auto-rotate on mobile ═══ */
function Controls() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      autoRotate={mobile}
      autoRotateSpeed={0.5}
      maxPolarAngle={Math.PI * 0.7}
      minPolarAngle={Math.PI * 0.3}
    />
  );
}

/* ═══ Scene ═══ */
function Scene() {
  return (
    <>
      <Lights />
      <Controls />
      <Stars radius={50} depth={60} count={2000} factor={4} saturation={0} fade speed={0.5} />
      <Quelina />
      <Planet color="#40916C" ringColor="#40916C" radius={2.8} speed={0.35} size={0.18} tilt={0.3} />
      <Planet color="#C9882A" ringColor="#E0A840" radius={3.6} speed={0.25} size={0.15} tilt={0.4} />
      <Planet color="#4682B4" ringColor="#6BA3D6" radius={4.5} speed={0.18} size={0.2} tilt={0.2} />
      <Planet color="#DB7093" ringColor="#FFB6C1" radius={5.4} speed={0.12} size={0.13} tilt={0.5} />
      <GoldenDust />
    </>
  );
}

/* ═══ Exported ═══ */
export default function QuellinaUniverse() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1, 5], fov: 55 }} style={{ background: "transparent" }} dpr={[1, 2]}>
        <Scene />
      </Canvas>
    </div>
  );
}
