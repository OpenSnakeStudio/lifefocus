import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SPHERES, 
  getPersonalSpheres, 
  getSocialSpheres,
  getSphereName,
  SphereIndex,
  Sphere,
} from '@/types/sphere';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface BalanceFlowerProps {
  sphereIndices: SphereIndex[];
  lifeIndex: number;
}

export function BalanceFlower({ sphereIndices, lifeIndex }: BalanceFlowerProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const personalSpheres = getPersonalSpheres();
  const socialSpheres = getSocialSpheres();

  // SVG dimensions
  const size = 320;
  const center = size / 2;
  const maxRadius = 120;
  const minRadius = 30;

  const handlePetalClick = (sphere: Sphere) => {
    navigate(`/sphere/${sphere.key}`);
  };

  const createPetalPath = (
    angle: number, 
    radius: number, 
    isLeft: boolean
  ): string => {
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate end point
    const endX = center + (isLeft ? -1 : 1) * radius * Math.cos(angleRad);
    const endY = center - radius * Math.sin(angleRad);
    
    // Control points for the petal curve
    const controlRadius = radius * 0.6;
    const spreadAngle = 15; // degrees
    
    const angle1 = angle + spreadAngle;
    const angle2 = angle - spreadAngle;
    const angle1Rad = (angle1 * Math.PI) / 180;
    const angle2Rad = (angle2 * Math.PI) / 180;
    
    const cp1X = center + (isLeft ? -1 : 1) * controlRadius * Math.cos(angle1Rad);
    const cp1Y = center - controlRadius * Math.sin(angle1Rad);
    const cp2X = center + (isLeft ? -1 : 1) * controlRadius * Math.cos(angle2Rad);
    const cp2Y = center - controlRadius * Math.sin(angle2Rad);
    
    return `
      M ${center} ${center}
      Q ${cp1X} ${cp1Y} ${endX} ${endY}
      Q ${cp2X} ${cp2Y} ${center} ${center}
      Z
    `;
  };

  const petals = useMemo(() => {
    const result: Array<{
      sphere: Sphere;
      path: string;
      index: number;
      angle: number;
      isLeft: boolean;
    }> = [];

    // Left side: Personal spheres (bottom to top: 225°, 270°-45=225°, etc.)
    const leftAngles = [60, 30, -30, -60]; // Angles for left petals
    personalSpheres.forEach((sphere, i) => {
      const sphereIndex = sphereIndices.find(s => s.sphereId === sphere.id);
      const indexValue = sphereIndex?.index || 0;
      const radius = minRadius + ((indexValue / 100) * (maxRadius - minRadius));
      
      result.push({
        sphere,
        path: createPetalPath(leftAngles[i], radius, true),
        index: indexValue,
        angle: leftAngles[i],
        isLeft: true,
      });
    });

    // Right side: Social spheres (bottom to top)
    const rightAngles = [60, 30, -30, -60];
    socialSpheres.forEach((sphere, i) => {
      const sphereIndex = sphereIndices.find(s => s.sphereId === sphere.id);
      const indexValue = sphereIndex?.index || 0;
      const radius = minRadius + ((indexValue / 100) * (maxRadius - minRadius));
      
      result.push({
        sphere,
        path: createPetalPath(rightAngles[i], radius, false),
        index: indexValue,
        angle: rightAngles[i],
        isLeft: false,
      });
    });

    return result;
  }, [sphereIndices, personalSpheres, socialSpheres]);

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius + 10}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.3"
        />

        {/* Petals */}
        {petals.map((petal, i) => (
          <motion.g
            key={petal.sphere.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            onClick={() => handlePetalClick(petal.sphere)}
            className="cursor-pointer"
            style={{ transformOrigin: `${center}px ${center}px` }}
          >
            <path
              d={petal.path}
              fill={petal.sphere.color}
              fillOpacity={0.7 + (petal.index / 100) * 0.3}
              stroke={petal.sphere.color}
              strokeWidth="2"
              className="transition-all duration-300 hover:fill-opacity-100"
            />
            {/* Sphere icon */}
            <text
              x={center + (petal.isLeft ? -1 : 1) * (minRadius + 35)}
              y={center - (minRadius + 15) * Math.sin((petal.angle * Math.PI) / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
              className="pointer-events-none"
            >
              {petal.sphere.icon}
            </text>
          </motion.g>
        ))}

        {/* Center circle with Life Index */}
        <motion.circle
          cx={center}
          cy={center}
          r={45}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        />
        
        <motion.text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-bold"
          fontSize="28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {lifeIndex}
        </motion.text>
        
        <motion.text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          fontSize="10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {language === 'ru' ? 'ИНДЕКС' : language === 'es' ? 'ÍNDICE' : 'INDEX'}
        </motion.text>
      </svg>

      {/* Legend */}
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <div className="text-center">
          <span className="font-medium">
            {language === 'ru' ? 'Личное' : language === 'es' ? 'Personal' : 'Personal'}
          </span>
        </div>
        <div className="text-center">
          <span className="font-medium">
            {language === 'ru' ? 'Социальное' : language === 'es' ? 'Social' : 'Social'}
          </span>
        </div>
      </div>
    </div>
  );
}
