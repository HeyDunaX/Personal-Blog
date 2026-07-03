import { useEffect, useState } from 'react';

export function useDeviceMotionSafe() {
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');

    const update = () => {
      const isCoarse = media.matches;
      const isSmall = window.innerWidth < 768;
      setMotionEnabled(!(isCoarse || isSmall));
    };

    update();
    media.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return motionEnabled;
}
