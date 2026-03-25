"use client";

import { useEffect, useRef } from "react";

export default function ShapeBlur({
  shapeSize = 0.8,
  roundness = 0.5,
  borderSize = 0.05,
  circleSize = 0.3,
  color1 = "#2D6A4F",
  color2 = "#C9882A",
  color3 = "#050d12",
  pixelRatioProp = 1,
}: {
  shapeSize?: number;
  roundness?: number;
  borderSize?: number;
  circleSize?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  pixelRatioProp?: number;
  variation?: number;
  circleEdge?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;

    const vertSrc = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      uniform float shapeSize;
      uniform float roundness;
      uniform float borderSize;
      uniform float circleSize;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;

      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        uv = uv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        float t = time * 0.3;

        vec2 p1 = vec2(sin(t * 0.7) * 0.4, cos(t * 0.5) * 0.3);
        vec2 p2 = vec2(cos(t * 0.6) * 0.5, sin(t * 0.8) * 0.4);
        vec2 p3 = vec2(sin(t * 0.4 + 2.0) * 0.3, cos(t * 0.3 + 1.0) * 0.5);

        float d1 = length(uv - p1) - shapeSize * circleSize;
        float d2 = sdRoundBox(uv - p2, vec2(shapeSize * 0.3), roundness);
        float d3 = length(uv - p3) - shapeSize * circleSize * 0.7;

        float shape = min(min(d1, d2), d3);
        float border = abs(shape) - borderSize;

        vec3 col = color3;
        col = mix(col, color1, smoothstep(0.4, 0.0, d1));
        col = mix(col, color2, smoothstep(0.4, 0.0, d2));
        col = mix(col, color1 * 0.7 + color2 * 0.3, smoothstep(0.3, 0.0, d3));
        col = mix(col, vec3(1.0), smoothstep(0.02, 0.0, abs(border)) * 0.15);

        float alpha = 1.0 - smoothstep(0.0, 0.6, shape);
        alpha *= 0.7;

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "time");
    const uRes = gl.getUniformLocation(prog, "resolution");
    const uShape = gl.getUniformLocation(prog, "shapeSize");
    const uRound = gl.getUniformLocation(prog, "roundness");
    const uBorder = gl.getUniformLocation(prog, "borderSize");
    const uCircle = gl.getUniformLocation(prog, "circleSize");
    const uC1 = gl.getUniformLocation(prog, "color1");
    const uC2 = gl.getUniformLocation(prog, "color2");
    const uC3 = gl.getUniformLocation(prog, "color3");

    const hex = (h: string) => [
      parseInt(h.slice(1, 3), 16) / 255,
      parseInt(h.slice(3, 5), 16) / 255,
      parseInt(h.slice(5, 7), 16) / 255,
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth * pixelRatioProp;
      canvas.height = canvas.offsetHeight * pixelRatioProp;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let id: number;
    const render = (t: number) => {
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uShape, shapeSize);
      gl.uniform1f(uRound, roundness);
      gl.uniform1f(uBorder, borderSize);
      gl.uniform1f(uCircle, circleSize);
      const [r1, g1, b1] = hex(color1);
      const [r2, g2, b2] = hex(color2);
      const [r3, g3, b3] = hex(color3);
      gl.uniform3f(uC1, r1, g1, b1);
      gl.uniform3f(uC2, r2, g2, b2);
      gl.uniform3f(uC3, r3, g3, b3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      id = requestAnimationFrame(render);
    };
    id = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, [shapeSize, roundness, borderSize, circleSize, color1, color2, color3, pixelRatioProp]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }}
    />
  );
}
