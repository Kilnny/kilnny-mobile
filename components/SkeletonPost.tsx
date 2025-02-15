import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

const SkeletonPost = () => {
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
        flexDirection: "column",
        marginBottom: 20,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#e0e0e0",
        opacity,
      }}
    >
      <View style={{ width: "100%", height: 200, borderRadius: 4, backgroundColor: "#c0c0c0" }} />
      <View style={{ marginTop: 10 }}>
        <View style={{ width: "60%", height: 20, borderRadius: 4, backgroundColor: "#c0c0c0", marginBottom: 6 }} />
        <View style={{ width: "40%", height: 20, borderRadius: 4, backgroundColor: "#c0c0c0" }} />
      </View>
    </Animated.View>
  );
};

export default SkeletonPost;