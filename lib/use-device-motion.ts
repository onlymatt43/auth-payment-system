'use client';

import { useEffect, useState } from 'react';

interface DeviceMotion {
  x: number;
  y: number;
  z: number;
}

/**
 * Hook for device motion detection (accelerometer)
 * Used for tilt-based animations on mobile
 */
export function useDeviceMotion() {
  const [motion, setMotion] = useState<DeviceMotion>({ x: 0, y: 0, z: 0 });
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check if device supports motion events
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      return;
    }

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (accel) {
        setMotion({
          x: accel.x || 0,
          y: accel.y || 0,
          z: accel.z || 0,
        });
      }
    };

    // Request permission on iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as any).requestPermission) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((status: string) => {
          if (status === 'granted') {
            setHasPermission(true);
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(() => {
          // Permission denied or error
        });
    } else if (typeof window !== 'undefined') {
      // Non-iOS or older iOS
      setHasPermission(true);
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  // Normalize motion values to -1 to 1 range for use in transforms
  const normalizedX = Math.max(-1, Math.min(1, motion.y / 20)); // Y axis for horizontal tilt
  const normalizedY = Math.max(-1, Math.min(1, motion.x / 20)); // X axis for vertical tilt

  return {
    motion,
    normalizedX,
    normalizedY,
    hasPermission,
  };
}

/**
 * Helper to calculate transform based on device motion
 * Returns CSS transform string for tilt effects
 */
export function getMotionTransform(normalizedX: number, normalizedY: number, intensity = 1) {
  const rotateX = normalizedY * intensity * 5; // Degrees
  const rotateY = normalizedX * intensity * 5; // Degrees

  return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}
