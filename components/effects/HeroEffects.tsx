"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader: morphing nebula with noise
const vertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  // Simplex noise approximation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float noise = snoise(vec3(pos.x * 2.0, pos.y * 2.0, uTime * 0.3));
    pos.z += noise * 0.15;
    vElevation = noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader: jade/gold/purple nebula colors
const fragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;

  void main() {
    // Color palette: jade, gold, purple nebula
    vec3 jade = vec3(0.176, 0.416, 0.310);
    vec3 gold = vec3(0.788, 0.533, 0.165);
    vec3 purple = vec3(0.290, 0.102, 0.420);
    vec3 dark = vec3(0.020, 0.051, 0.071);

    float t = vElevation * 0.5 + 0.5;
    float pulse = sin(uTime * 0.5) * 0.5 + 0.5;

    vec3 color = mix(dark, jade, t * 0.6);
    color = mix(color, gold, smoothstep(0.5, 0.8, t) * 0.4);
    color = mix(color, purple, smoothstep(0.3, 0.6, vUv.x) * 0.3 * pulse);

    float alpha = smoothstep(0.0, 0.3, t) * 0.4;
    alpha *= smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
    alpha *= smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);

    gl_FragColor = vec4(color, alpha);
  }
`;

/* ═══ Effect 1: Animated Nebula Plane (GLSL shader) ═══ */
export function NebulaShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -3]} scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ═══ Effect 2: Morphing Constellation Lines ═══ */
export function ConstellationWeb() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const stars: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push(new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 2,
      ));
    }
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dist = stars[i].distanceTo(stars[j]);
        if (dist < 3.5) {
          pos.push(stars[i].x, stars[i].y, stars[i].z);
          pos.push(stars[j].x, stars[j].y, stars[j].z);
          col.push(0.79, 0.53, 0.16, 0.79, 0.53, 0.16);
        }
      }
    }
    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }, []);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.2} />
    </lineSegments>
  );
}

/* ═══ Effect 3: Floating Light Orbs (volumetric) ═══ */
export function FloatingOrbs() {
  const count = 6;
  const orbs = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        -1 - Math.random() * 3,
      ] as [number, number, number],
      color: ["#C9882A", "#2D6A4F", "#7B68EE", "#4682B4", "#E0A840", "#40916C"][i],
      speed: 0.3 + Math.random() * 0.5,
      size: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2,
    })),
  []);

  return (
    <>
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}
    </>
  );
}

function FloatingOrb({ position, color, speed, size, phase }: {
  position: [number, number, number]; color: string; speed: number; size: number; phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 1.5;
      ref.current.position.x = position[0] + Math.cos(t * speed * 0.7 + phase) * 0.8;
      const scale = size * (1 + Math.sin(t * 2 + phase) * 0.3);
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
      {/* Glow halo */}
      <mesh scale={[3, 3, 3]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </mesh>
  );
}

/* ═══ Effect 4: Rising Particle Stream ═══ */
export function RisingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 12 - 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      spd[i] = 0.2 + Math.random() * 0.5;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.02;
      if (pos[i * 3 + 1] > 6) pos[i * 3 + 1] = -6;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C9882A" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ═══ Effect 5: Pulsing Aurora Ring ═══ */
export function AuroraRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.x = Math.PI * 0.5 + Math.sin(t * 0.3) * 0.1;
      ref.current.rotation.z = t * 0.05;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 0.8) * 0.04;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <torusGeometry args={[4, 0.8, 16, 64]} />
      <meshBasicMaterial color="#2D6A4F" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}
