import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler } from "three";
import { useStudio } from "../store/useStudio.js";
import { showroomObstacles, walkStep, WALK_START } from "../lib/navigation.js";

export function WalkControls() {
  const { camera, gl } = useThree();
  const active = useStudio((s) => s.ui.walkthrough);
  const mode = useStudio((s) => s.mode);
  const keys = useRef(new Set());
  const angles = useRef({ yaw: 0, pitch: -0.08 });
  const rotation = useRef(new Euler(0, 0, 0, "YXZ"));

  useEffect(() => {
    if (!active) return;
    camera.position.set(...WALK_START);
    angles.current = { yaw: 0.4, pitch: -0.08 };
    camera.fov = 62;
    camera.updateProjectionMatrix();
    const canvas = gl.domElement;
    let drag = null;
    const clear = () => {
      keys.current.clear();
      drag = null;
      useStudio.getState().setUI({ move: {} });
    };
    const down = (e) => {
      if (e.button !== 0 || e.isPrimary === false) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const move = (e) => {
      if (
        useStudio.getState().ui.walkPaused ||
        !drag ||
        drag.id !== e.pointerId
      )
        return;
      angles.current.yaw -= (e.clientX - drag.x) * 0.004;
      angles.current.pitch = Math.max(
        -0.85,
        Math.min(0.8, angles.current.pitch - (e.clientY - drag.y) * 0.004),
      );
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const up = () => {
      drag = null;
    };
    const onKey = (e) => {
      if (useStudio.getState().ui.walkPaused) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable=true]"))
        return;
      const code = e.code;
      if (
        ![
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(code)
      )
        return;
      e.preventDefault();
      keys.current.add(code);
    };
    const offKey = (e) => keys.current.delete(e.code);
    const visibility = () => {
      if (document.hidden) clear();
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", offKey);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clear();
      camera.fov = 42;
      camera.updateProjectionMatrix();
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", offKey);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, mode, camera, gl]);

  useFrame((_, dt) => {
    if (!active) return;
    const s = useStudio.getState();
    if (s.ui.walkPaused) {
      keys.current.clear();
      return;
    }
    const k = keys.current;
    const move = s.ui.move || {};
    const forward =
      Number(k.has("KeyW") || k.has("ArrowUp") || move.forward) -
      Number(k.has("KeyS") || k.has("ArrowDown") || move.back);
    const side =
      Number(k.has("KeyD") || k.has("ArrowRight") || move.right) -
      Number(k.has("KeyA") || k.has("ArrowLeft") || move.left);
    const { yaw, pitch } = angles.current;
    const length = Math.max(1, Math.hypot(forward, side));
    const speed = (Math.min(dt, 0.05) * 1.35) / length;
    const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * speed;
    const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * speed;
    const next = walkStep(
      camera.position,
      dx,
      dz,
      s.room,
      showroomObstacles(s.room, s.units, s.mode),
    );
    camera.position.set(next.x, 1.62, next.z);
    rotation.current.set(pitch, yaw, 0, "YXZ");
    camera.quaternion.setFromEuler(rotation.current);
  });
  return null;
}
