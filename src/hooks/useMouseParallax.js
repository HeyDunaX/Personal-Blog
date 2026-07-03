import { useEffect, useRef, useState } from 'react';

const lerp = (start, end, alpha) => start + (end - start) * alpha;

export function useMouseParallax(enabled = true) {
  const [state, setState] = useState({ x: 0, y: 0, nx: 0, ny: 0 });
  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const lastCommit = useRef(0);
  const prevCommitted = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setState({ x: 0, y: 0, nx: 0, ny: 0 });
      return undefined;
    }

    let rafId;

    const onMove = (event) => {
      target.current.x = event.clientX - window.innerWidth / 2;
      target.current.y = event.clientY - window.innerHeight / 2;
    };

    const tick = () => {
      smooth.current.x = lerp(smooth.current.x, target.current.x, 0.1);
      smooth.current.y = lerp(smooth.current.y, target.current.y, 0.1);

      const now = performance.now();
      const dx = Math.abs(smooth.current.x - prevCommitted.current.x);
      const dy = Math.abs(smooth.current.y - prevCommitted.current.y);
      const shouldCommit = now - lastCommit.current > 1000 / 45 || dx > 0.6 || dy > 0.6;

      if (shouldCommit) {
        prevCommitted.current.x = smooth.current.x;
        prevCommitted.current.y = smooth.current.y;
        lastCommit.current = now;

        setState({
          x: smooth.current.x,
          y: smooth.current.y,
          nx: smooth.current.x / (window.innerWidth / 2),
          ny: smooth.current.y / (window.innerHeight / 2)
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, [enabled]);

  return state;
}
