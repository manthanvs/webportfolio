"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { reducedMotion } from "@/lib/fx";

/**
 * Particle grid displaced by layered sine "signals". The pointer pushes particles
 * up; `progress` (0..1, from scroll) calms the noise into an ordered wave.
 * Renders only while visible.
 */
export default function SignalField({ progress }: { progress: React.RefObject<number> }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 3.2, 9);
    camera.lookAt(0, 0, 0);

    const mobile = window.innerWidth < 768;
    const COLS = mobile ? 110 : 200;
    const ROWS = mobile ? 70 : 110;
    const pos = new Float32Array(COLS * ROWS * 3);
    let k = 0;
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        pos[k++] = (x / (COLS - 1) - 0.5) * 18;
        pos[k++] = 0;
        pos[k++] = (y / (ROWS - 1) - 0.5) * 11;
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uPixel: { value: renderer.getPixelRatio() },
      uSignal: { value: new THREE.Color("#ff5a1f") },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        uniform float uTime, uProgress, uPixel;
        uniform vec2 uMouse;
        varying float vH;
        varying float vM;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        void main(){
          vec3 p = position;
          float t = uTime * .6;
          float chaos = 1. - uProgress;
          float noise = (hash(floor(p.xz * 3.) + floor(t * 6.)) - .5) * .9 * chaos;
          float wave = sin(p.x * .7 + t) * .45 + sin(p.z * 1.1 - t * 1.3) * .3 + sin((p.x + p.z) * .35 + t * .7) * .5;
          float d = distance(p.xz, uMouse);
          float m = smoothstep(2.6, 0., d);
          p.y = wave * (.4 + uProgress * .8) + noise + m * 1.4;
          vH = p.y; vM = m;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.6 + m * 2.5) * uPixel * (9. / -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSignal;
        varying float vH;
        varying float vM;
        void main(){
          vec2 c = gl_PointCoord - .5;
          if (dot(c, c) > .25) discard;
          vec3 base = mix(vec3(.45,.45,.5), vec3(.93,.92,.9), smoothstep(-.6, 1.2, vH));
          vec3 col = mix(base, uSignal, vM);
          gl_FragColor = vec4(col, .55 + vM * .45);
        }`,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // pointer → plane intersection
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const target = new THREE.Vector2(99, 99);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) target.set(hit.x, hit.z);
    };
    const onLeave = () => target.set(99, 99);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.fov = w < 768 ? 60 : 42;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const still = reducedMotion();
    const clock = new THREE.Clock();
    let visible = false;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!still) uniforms.uTime.value += dt;
      uniforms.uProgress.value += ((progress.current ?? 0) - uniforms.uProgress.value) * 0.08;
      uniforms.uMouse.value.lerp(target, 0.12);
      points.rotation.y = (uniforms.uProgress.value - 0.5) * 0.5;
      camera.position.y = 3.2 - uniforms.uProgress.value * 1.4;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      clock.getDelta();
    });
    io.observe(el);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={mount} className="absolute inset-0" />;
}
