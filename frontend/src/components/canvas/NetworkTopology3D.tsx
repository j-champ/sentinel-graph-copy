import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PortNodeDefinition, AlertLevel } from '../../types';
import { CANONICAL_PORTS } from '../../constants/nodes';
import { AlertTriangle, ShieldCheck, Activity, Eye, Zap } from 'lucide-react';

interface NetworkTopology3DProps {
  activePort: number | string | null;
  onSelectPort: (port: PortNodeDefinition | null) => void;
  alertLevel: AlertLevel;
  threatIntensity: number;
  isSimulated: boolean;
  reducedMotion?: boolean;
}

// 1. Individual 3D Port Node with threat-reactive shader-like aesthetics
function PortNodeMesh({
  node,
  isActive,
  isTarget,
  alertLevel,
  onClick,
  onPointerOver,
  onPointerOut,
  reducedMotion,
}: {
  node: PortNodeDefinition;
  isActive: boolean;
  isTarget: boolean;
  alertLevel: AlertLevel;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  reducedMotion?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Compute node theme color based on status
  const nodeColor = useMemo(() => {
    if (isTarget) {
      if (alertLevel === 'CRITICAL') return '#ef4444';
      if (alertLevel === 'ELEVATED') return '#f97316';
      if (alertLevel === 'WATCH') return '#fbbf24';
      return '#00e5ff';
    }
    if (node.protocol === 'UDP') return '#8b5cf6';
    if (node.protocol === 'IP') return '#f59e0b';
    if (node.protocol === 'DYNAMIC') return '#64748b';
    return '#00e5ff';
  }, [isTarget, alertLevel, node.protocol]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (ringRef.current && isTarget) {
      ringRef.current.rotation.z = t * 1.5;
      const s = 1 + Math.sin(t * 3) * 0.15;
      ringRef.current.scale.set(s, s, s);
    }
    if (meshRef.current && (isActive || isTarget)) {
      meshRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group position={[node.x, node.y, node.z]}>
      {/* Outer energy pulse ring for active threat target */}
      {isTarget && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.68, 32]} />
          <meshBasicMaterial color={nodeColor} side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Main Node Core */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onPointerOut();
          document.body.style.cursor = 'auto';
        }}
      >
        <octahedronGeometry args={[isActive || isTarget ? 0.38 : 0.28, 0]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isTarget ? 0.9 : isActive ? 0.6 : 0.2}
          roughness={0.2}
          metalness={0.8}
          wireframe={!isActive && !isTarget}
        />
      </mesh>

      {/* Floating 3D Text Label */}
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.24}
        color={isTarget ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {`${node.name} (${node.port})`}
      </Text>
    </group>
  );
}

// 2. Animated Traffic Arc connecting nodes to central core
function TrafficArc({
  node,
  isTarget,
  alertLevel,
  threatIntensity,
  reducedMotion,
}: {
  node: PortNodeDefinition;
  isTarget: boolean;
  alertLevel: AlertLevel;
  threatIntensity: number;
  reducedMotion?: boolean;
}) {
  const packetRef = useRef<THREE.Mesh>(null);

  // Connection curve from central origin (0, 0, 0) to node position
  const curve = useMemo(() => {
    const start = new THREE.Vector3(0, 0, 0);
    const end = new THREE.Vector3(node.x, node.y, node.z);
    const mid = new THREE.Vector3(
      node.x * 0.5,
      Math.sin(node.id) * 0.8 + (isTarget ? 1.2 : 0.5),
      node.z * 0.5
    );
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [node, isTarget]);

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  const lineColor = useMemo(() => {
    if (isTarget) {
      if (alertLevel === 'CRITICAL') return '#ef4444';
      if (alertLevel === 'ELEVATED') return '#f97316';
      if (alertLevel === 'WATCH') return '#fbbf24';
      return '#00e5ff';
    }
    return '#1e293b';
  }, [isTarget, alertLevel]);

  useFrame((state) => {
    if (reducedMotion || !packetRef.current) return;
    const speed = isTarget ? 0.8 + threatIntensity * 1.5 : 0.3;
    const t = (state.clock.getElapsedTime() * speed + node.id * 0.1) % 1;
    const pos = curve.getPointAt(t);
    packetRef.current.position.copy(pos);
  });

  return (
    <group>
      {/* Background Arc line */}
      <primitive
        object={
          new THREE.Line(
            lineGeo,
            new THREE.LineBasicMaterial({
              color: lineColor,
              transparent: true,
              opacity: isTarget ? 0.85 : 0.25,
              linewidth: isTarget ? 2 : 1,
            })
          )
        }
      />

      {/* Traveling Data Packet particle along the arc */}
      {(isTarget || node.id % 3 === 0) && (
        <mesh ref={packetRef}>
          <sphereGeometry args={[isTarget ? 0.08 : 0.04, 8, 8]} />
          <meshBasicMaterial color={isTarget ? lineColor : '#00e5ff'} />
        </mesh>
      )}
    </group>
  );
}

// 3. Central Core Router / Security Kernel
function CoreKernel({
  alertLevel,
  threatIntensity,
  reducedMotion,
}: {
  alertLevel: AlertLevel;
  threatIntensity: number;
  reducedMotion?: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const coreColor = useMemo(() => {
    if (alertLevel === 'CRITICAL') return '#ef4444';
    if (alertLevel === 'ELEVATED') return '#f97316';
    if (alertLevel === 'WATCH') return '#fbbf24';
    return '#00e5ff';
  }, [alertLevel]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.4;
      coreRef.current.rotation.y = t * 0.6;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.8;
      const s = 1.0 + Math.sin(t * 2) * (0.05 + threatIntensity * 0.1);
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Gyro Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.2, 0.025, 16, 64]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.5} />
      </mesh>

      {/* Central Holographic Kernel */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.6 + threatIntensity * 0.4}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Central Label */}
      <Text position={[0, -0.95, 0]} fontSize={0.2} color="#94a3b8" anchorX="center" anchorY="middle">
        CENTRAL INGRESS ROUTER
      </Text>
    </group>
  );
}

// 4. Ground Coordinate Grid and Environment
function SpatialAtmosphere() {
  return (
    <group position={[0, -1.8, 0]}>
      <gridHelper args={[24, 24, '#1e293b', '#0f172a']} />
    </group>
  );
}

// 5. 2D Fallback for environments lacking WebGL
function Topology2DFallback({
  activePort,
  onSelectPort,
  alertLevel,
}: {
  activePort: number | string | null;
  onSelectPort: (port: PortNodeDefinition | null) => void;
  alertLevel: AlertLevel;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-cyber-surface/90 text-center">
      <div className="flex items-center gap-2 text-cyber-cyan text-sm font-mono mb-2">
        <Activity className="w-4 h-4" />
        <span>2D SCHEMATIC TOPOLOGY FALLBACK (16 CANONICAL NODES)</span>
      </div>
      <p className="text-xs text-cyber-muted max-w-md mb-6">
        WebGL acceleration disabled or unavailable. Showing planar service node schematic.
      </p>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-3xl">
        {CANONICAL_PORTS.map((node) => {
          const isTarget = activePort === node.port;
          return (
            <button
              key={node.id}
              onClick={() => onSelectPort(isTarget ? null : node)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isTarget
                  ? alertLevel === 'CRITICAL'
                    ? 'border-cyber-crimson bg-cyber-crimson/10 text-cyber-crimson shadow-glow-crimson'
                    : 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan shadow-glow-cyan'
                  : 'border-cyber-border bg-cyber-card hover:border-cyber-borderLight text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono text-cyber-muted">PORT {node.port}</div>
              <div className="text-xs font-bold truncate">{node.name}</div>
              <div className="text-[9px] font-mono opacity-70">{node.protocol}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NetworkTopology3D({
  activePort,
  onSelectPort,
  alertLevel,
  threatIntensity,
  isSimulated,
  reducedMotion = false,
}: NetworkTopology3DProps) {
  const [hoveredNode, setHoveredNode] = useState<PortNodeDefinition | null>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');

  // Check WebGL availability on mount
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlAvailable(false);
        setViewMode('2D');
      }
    } catch {
      setWebGlAvailable(false);
      setViewMode('2D');
    }
  }, []);

  if (!webGlAvailable || viewMode === '2D') {
    return (
      <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] rounded-xl overflow-hidden border border-cyber-border bg-cyber-bg">
        {webGlAvailable && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setViewMode('3D')}
              className="px-2.5 py-1 rounded-md bg-cyber-card border border-cyber-cyan/40 text-cyber-cyan font-mono text-[11px] font-bold shadow-glow-cyan hover:bg-cyber-cyan/20 transition-all"
            >
              SWITCH TO 3D SPATIAL
            </button>
          </div>
        )}
        <Topology2DFallback activePort={activePort} onSelectPort={onSelectPort} alertLevel={alertLevel} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] rounded-xl overflow-hidden border border-cyber-border bg-cyber-bg">
      {/* Overlay Status Pill */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-cyber-card/80 backdrop-blur-md border border-cyber-border text-[11px] font-mono flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
          <span>16 SERVICE PORT NODES (ST-GNN)</span>
        </div>

        {isSimulated ? (
          <div className="px-2 py-1 rounded-md bg-cyber-violet/20 border border-cyber-violet/40 text-[10px] font-mono font-bold text-cyber-violet">
            SCENARIO SIMULATION
          </div>
        ) : (
          <div className="px-2 py-1 rounded-md bg-cyber-cyan/20 border border-cyber-cyan/40 text-[10px] font-mono font-bold text-cyber-cyan flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>LIVE BACKEND STREAM</span>
          </div>
        )}
      </div>

      {/* View Mode Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setViewMode('2D')}
          className="px-2.5 py-1 rounded-md bg-cyber-card/90 border border-cyber-border hover:border-cyber-borderLight text-slate-300 font-mono text-[11px] transition-colors"
          title="Switch to 2D Planar Schematic"
        >
          2D SCHEMATIC
        </button>
      </div>

      {/* Floating Node Inspector Tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 z-10 max-w-xs p-3.5 rounded-lg bg-cyber-surface/95 backdrop-blur-lg border border-cyber-border shadow-2xl text-left pointer-events-none font-mono">
          <div className="flex items-center justify-between gap-2 border-b border-cyber-border pb-1.5 mb-2">
            <span className="text-xs font-bold text-cyber-cyan">PORT {hoveredNode.port}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-border text-slate-300">
              {hoveredNode.protocol}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">{hoveredNode.name}</div>
          <div className="text-xs text-cyber-muted mb-2">{hoveredNode.service}</div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{hoveredNode.description}</p>
        </div>
      )}

      {/* Three.js / React Three Fiber Canvas */}
      <Canvas
        camera={{ position: [0, 8, 14], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onPointerDown={(e) => {
          // Deselect node when clicking empty canvas space
          if (e.target === e.currentTarget) {
            onSelectPort(null);
          }
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 15, 10]} intensity={1.2} color="#00e5ff" />
        <pointLight position={[-10, 10, -10]} intensity={0.8} color="#8b5cf6" />
        {alertLevel === 'CRITICAL' && (
          <pointLight position={[0, 2, 0]} intensity={2.0} color="#ef4444" distance={12} />
        )}

        <SpatialAtmosphere />

        <CoreKernel alertLevel={alertLevel} threatIntensity={threatIntensity} reducedMotion={reducedMotion} />

        {/* 16 Nodes & Directed Arcs */}
        {CANONICAL_PORTS.map((node) => {
          const isTarget = activePort === node.port;
          const isActive = hoveredNode?.id === node.id || isTarget;
          return (
            <React.Fragment key={node.id}>
              <TrafficArc
                node={node}
                isTarget={isTarget}
                alertLevel={alertLevel}
                threatIntensity={threatIntensity}
                reducedMotion={reducedMotion}
              />
              <PortNodeMesh
                node={node}
                isActive={isActive}
                isTarget={isTarget}
                alertLevel={alertLevel}
                onClick={() => onSelectPort(isTarget ? null : node)}
                onPointerOver={() => setHoveredNode(node)}
                onPointerOut={() => setHoveredNode(null)}
                reducedMotion={reducedMotion}
              />
            </React.Fragment>
          );
        })}

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={25}
          minDistance={5}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>

      {/* Camera Guidance Controls Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono text-cyber-muted">
        <div className="flex items-center gap-3">
          <span>DRAG: ORBIT CAMERA</span>
          <span>•</span>
          <span>SCROLL: ZOOM</span>
          <span>•</span>
          <span>CLICK NODE: INSPECT TELEMETRY</span>
        </div>
        {activePort !== null && (
          <div className="pointer-events-auto">
            <button
              onClick={() => onSelectPort(null)}
              className="px-2.5 py-1 rounded bg-cyber-card/90 border border-cyber-border hover:border-cyber-cyan text-cyber-cyan text-[11px] transition-colors"
            >
              CLEAR FOCUS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
