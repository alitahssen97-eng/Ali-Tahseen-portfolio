"use client";

import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Plasma.css";

/** Wrap animation time (seconds) to avoid shader precision loss after long uptime */
const TIME_WRAP_SEC = 50 * Math.PI * 2;

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  try {
    const renderer = new Renderer({
      canvas,
      webgl: 2,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    if (!renderer.gl || !renderer.isWebgl2) return null;
    return renderer;
  } catch {
    return null;
  }
}

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  // Keep T in a bounded range so sin/cos stay accurate during long sessions
  const float TAU = 6.28318530718;
  float i, d, z, T = mod(iTime * uSpeed * uDirection, 50.0 * TAU);
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export type PlasmaProps = {
  color?: string;
  speed?: number;
  direction?: "forward" | "reverse" | "pingpong";
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  className?: string;
};

export function Plasma({
  color = "#ffffff",
  speed = 1,
  direction = "forward",
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  className,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    let destroyed = false;
    let initialized = false;
    let renderer: Renderer | null = null;
    let raf = 0;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let removeListeners: (() => void) | null = null;

    const init = () => {
      if (destroyed || initialized) return;

      const rect = containerEl.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) {
        raf = requestAnimationFrame(init);
        return;
      }

      canvas = document.createElement("canvas");
      renderer = createRenderer(canvas);

      if (!renderer?.gl) {
        setUseFallback(true);
        return;
      }

      initialized = true;

      const gl = renderer.gl;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      containerEl.appendChild(canvas);

      const useCustomColor = color ? 1.0 : 0.0;
      const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];
      const directionMultiplier = direction === "reverse" ? -1.0 : 1.0;

      const geometry = new Triangle(gl);

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uCustomColor: { value: new Float32Array(customColorRgb) },
          uUseCustomColor: { value: useCustomColor },
          uSpeed: { value: speed * 0.4 },
          uDirection: { value: directionMultiplier },
          uScale: { value: scale },
          uOpacity: { value: opacity },
          uMouse: { value: new Float32Array([0, 0]) },
          uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const handleMouseMove = (e: MouseEvent) => {
        if (!mouseInteractive || destroyed) return;
        const bounds = containerEl.getBoundingClientRect();
        mousePos.current.x = e.clientX - bounds.left;
        mousePos.current.y = e.clientY - bounds.top;
        const mouseUniform = program.uniforms.uMouse.value as Float32Array;
        mouseUniform[0] = mousePos.current.x;
        mouseUniform[1] = mousePos.current.y;
      };

      if (mouseInteractive) {
        containerEl.addEventListener("mousemove", handleMouseMove);
      }

      const setSize = () => {
        if (destroyed || !renderer) return;
        const bounds = containerEl.getBoundingClientRect();
        const width = Math.max(1, Math.floor(bounds.width));
        const height = Math.max(1, Math.floor(bounds.height));
        renderer.setSize(width, height);
        const res = program.uniforms.iResolution.value as Float32Array;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      };

      ro = new ResizeObserver(setSize);
      ro.observe(containerEl);
      setSize();

      let contextLost = false;
      let isVisible = true;
      let pageVisible = !document.hidden;
      const t0 = performance.now();

      const loop = (t: number) => {
        if (destroyed || contextLost || !isVisible || !pageVisible || !renderer)
          return;

        const timeValue = ((t - t0) * 0.001) % TIME_WRAP_SEC;

        if (direction === "pingpong") {
          const pingpongDuration = 10;
          const segmentTime = timeValue % pingpongDuration;
          const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
          const u = segmentTime / pingpongDuration;
          const smooth = u * u * (3 - 2 * u);
          const pingpongTime = isForward
            ? smooth * pingpongDuration
            : (1 - smooth) * pingpongDuration;
          program.uniforms.uDirection.value = 1.0;
          program.uniforms.iTime.value = pingpongTime;
        } else {
          program.uniforms.iTime.value = timeValue;
        }

        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
      };

      const handleVisibility = () => {
        pageVisible = !document.hidden;
        if (pageVisible && isVisible && !contextLost && !destroyed) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      };

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        contextLost = true;
        cancelAnimationFrame(raf);
        if (!destroyed) setUseFallback(true);
      };

      const handleContextRestored = () => {
        contextLost = false;
        if (isVisible && !destroyed) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      };

      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      io = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          if (isVisible && !wasVisible && !contextLost && !destroyed) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(loop);
          }
        },
        { threshold: 0 }
      );
      io.observe(containerEl);

      document.addEventListener("visibilitychange", handleVisibility);
      raf = requestAnimationFrame(loop);

      removeListeners = () => {
        containerEl.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("visibilitychange", handleVisibility);
        canvas?.removeEventListener("webglcontextlost", handleContextLost);
        canvas?.removeEventListener("webglcontextrestored", handleContextRestored);
      };
    };

    raf = requestAnimationFrame(init);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      removeListeners?.();
      ro?.disconnect();
      io?.disconnect();
      if (canvas && containerEl.contains(canvas)) {
        const loseExt = renderer?.gl?.getExtension("WEBGL_lose_context");
        loseExt?.loseContext();
        containerEl.removeChild(canvas);
      }
      renderer = null;
      canvas = null;
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  const containerClass = [
    "plasma-container",
    useFallback ? "plasma-fallback" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div ref={containerRef} className={containerClass} />;
}

export default Plasma;
