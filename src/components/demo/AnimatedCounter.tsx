import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 1500
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      const progress = Math.min(elapsed / duration, 1);
      
      setCount(Math.floor(value * progress));
      
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    
    ref.current = requestAnimationFrame(animate);
    
    return () => {
      if (ref.current) {
        cancelAnimationFrame(ref.current);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
