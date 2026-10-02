import { useEffect, useRef, useState } from 'react';

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useCountUp(target: number, duration = 1400, delay = 0): number {
    const [value, setValue] = useState(0);
    const shown = useRef(0);

    useEffect(() => {
        const from = shown.current;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const begin = performance.now() + delay;
        let frame = 0;

        const tick = (now: number) => {
            const t = reduced ? 1 : Math.min(Math.max((now - begin) / duration, 0), 1);
            shown.current = from + (target - from) * easeOutExpo(t);
            setValue(shown.current);
            if (t < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration, delay]);

    return value;
}
