import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        marginTop: 16,
        marginHorizontal: 8,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#d3d3d3",
        justifyContent: "space-between",
        opacity,
      }}
    >
      <View style={{ flexDirection: "row" }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#c0c0c0" }} />
      <View style={{ marginLeft: 16, justifyContent: "center" }}>
        <View style={{ width: 96, height: 12, backgroundColor: "#c0c0c0", marginBottom: 8 }} />
        <View style={{ width: 96, height: 12, backgroundColor: "#c0c0c0" }} />
      </View>
      </View>
      <View style={{ width: 80, height: 30, borderRadius: 4, backgroundColor: "#c0c0c0", alignSelf: "center" }} />
    </Animated.View>
  );
};

export default SkeletonCard;