import Colors from "@/constants/Colors";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  G,
  Line,
  Polygon,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export const HexGrid = React.memo(() => {
  const hexSize = 60; // Increased size to reduce count
  const cols = Math.ceil(screenWidth / (hexSize * 0.75));
  const rows = Math.ceil(screenHeight / (hexSize * 0.866));

  // Limit total hexagons for performance
  const maxHexagons = 40;

  const hexagonPoints = React.useCallback(
    (cx: number, cy: number, size: number) => {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      return points.join(" ");
    },
    []
  );

  const hexagons = React.useMemo(() => {
    const result = [];
    let count = 0;

    for (let row = 0; row < rows && count < maxHexagons; row++) {
      for (let col = 0; col < cols && count < maxHexagons; col++) {
        // Skip more hexagons for better performance
        if (Math.random() > 0.25) continue;

        const x = col * hexSize * 0.75;
        const y = row * hexSize * 0.866 + (col % 2) * (hexSize * 0.433);
        const opacity = Math.random() * 0.5 + 0.1;

        result.push({
          key: `hex-${row}-${col}`,
          points: hexagonPoints(x, y, hexSize * 0.4),
          opacity,
        });
        count++;
      }
    }
    return result;
  }, [hexagonPoints]);

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <SvgLinearGradient id="hexGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop
            offset="0%"
            stopColor={Colors.dark.primary}
            stopOpacity="0.15"
          />
          <Stop
            offset="50%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.08"
          />
          <Stop
            offset="100%"
            stopColor={Colors.dark.secondary}
            stopOpacity="0.12"
          />
        </SvgLinearGradient>
        <SvgLinearGradient id="hexBorder" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.3" />
          <Stop
            offset="100%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.2"
          />
        </SvgLinearGradient>
      </Defs>

      {hexagons.map((hex) => (
        <G key={hex.key} opacity={hex.opacity}>
          <Polygon
            points={hex.points}
            fill="url(#hexGradient)"
            stroke="url(#hexBorder)"
            strokeWidth="0.5"
          />
        </G>
      ))}
    </Svg>
  );
});

export const HolographicGrid = () => {
  const gridSize = 40;
  const rows = Math.ceil(screenHeight / gridSize);
  const cols = Math.ceil(screenWidth / gridSize);

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${screenWidth} ${screenHeight}`}
    >
      <Defs>
        <SvgLinearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={Colors.dark.primary} stopOpacity="0.3" />
          <Stop
            offset="50%"
            stopColor={Colors.dark.neonGreen}
            stopOpacity="0.1"
          />
          <Stop
            offset="100%"
            stopColor={Colors.dark.secondary}
            stopOpacity="0.2"
          />
        </SvgLinearGradient>
      </Defs>

      {/* Vertical Lines */}
      {Array.from({ length: cols }).map((_, i) => (
        <Line
          key={`v-${i}`}
          x1={i * gridSize}
          y1={0}
          x2={i * gridSize}
          y2={screenHeight}
          stroke="url(#gridGradient)"
          strokeWidth="0.8"
          opacity={0.4}
        />
      ))}

      {/* Horizontal Lines */}
      {Array.from({ length: rows }).map((_, i) => (
        <Line
          key={`h-${i}`}
          x1={0}
          y1={i * gridSize}
          x2={screenWidth}
          y2={i * gridSize}
          stroke="url(#gridGradient)"
          strokeWidth="0.8"
          opacity={0.4}
        />
      ))}
    </Svg>
  );
};

// Animated Particles System
export const ParticleSystem = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      })),
    []
  );

  const animatedValues = useRef(
    particles.map(() => ({
      translateX: new Animated.Value(Math.random() * screenWidth),
      translateY: new Animated.Value(Math.random() * screenHeight),
      opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
    }))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, i) => {
      const particle = particles[i];
      return Animated.loop(
        Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue: Math.random() * screenWidth,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: Math.random() * screenHeight,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0.2,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    });

    animations.forEach((anim) => anim.start());
    return () => animations.forEach((anim) => anim.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {animatedValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            {
              transform: [
                { translateX: anim.translateX },
                { translateY: anim.translateY },
              ],
              opacity: anim.opacity,
              width: particles[i].size,
              height: particles[i].size,
              position: "absolute",
              borderRadius: 50,
              backgroundColor: Colors.dark.primary,
              shadowColor: Colors.dark.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 3,
            },
          ]}
        />
      ))}
    </View>
  );
};

const HolographicBackground = () => {
  return (
    <>
      <HolographicGrid />
      <ParticleSystem />
    </>
  );
};

export default HolographicBackground;
