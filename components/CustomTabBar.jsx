// CustomTabBar.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, Image } from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  MaterialCommunityIcons,
  AntDesign,
  Entypo,
  FontAwesome6,
  FontAwesome5,
} from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
} from "react-native-reanimated";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/Colors";
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [displayView, setDisplayView] = useState("none");
  const [user, setUser] = useState(null);
  useFocusEffect(
    useCallback(() => {
      const fetchUserAndFollow = async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          if (userString) {
            const userObject = JSON.parse(userString);
            setUser(userObject);
          }
        } catch (error) {
          console.error(
            "Error fetching user from AsyncStorage:",
            error.message
          );
        }
      };

      fetchUserAndFollow();
    }, [])
  );
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const { navigate } = useNavigation();
  const routeName = useRoute();

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  // console.log(state);
  const LeftbottomValue = useSharedValue(0);
  const LeftpositionValue = useSharedValue(0);
  const RightbottomValue = useSharedValue(0);
  const RightpositionValue = useSharedValue(0);
  const topIconBottomValue = useSharedValue(0);
  const topIconPositionValue = useSharedValue(0);
  const handleAnimatedButton = () => {
    setDisplayView(displayView == "flex" ? "none" : "flex");

    LeftbottomValue.value = withSpring(LeftbottomValue.value === 0 ? 75 : 0);
    RightbottomValue.value = withSpring(RightbottomValue.value === 0 ? 75 : 0);
    topIconBottomValue.value = withSpring(
      topIconBottomValue.value === 0 ? 140 : 0
    );
    LeftpositionValue.value = withSpring(
      LeftpositionValue.value === 0 ? 85 : 0
    );
    RightpositionValue.value = withSpring(
      RightpositionValue.value === 0 ? 85 : 0
    );
    topIconPositionValue.value = withSpring(
      topIconPositionValue.value === 0 ? 0 : 0
    );
  };

  const animatedStyles = useAnimatedStyle(() => ({
    display: LeftbottomValue.value == 0 ? "none" : "flex",
    position: "absolute",
    transform: [
      { translateY: -LeftbottomValue.value }, // Translate vertically
      { translateX: -LeftpositionValue.value }, // Translate horizontally
    ],
  }));
  const animatedStyles4 = useAnimatedStyle(() => ({
    display: RightbottomValue.value == 0 ? "none" : "flex",
  }));
  const animatedStyles2 = useAnimatedStyle(() => ({
    display: RightbottomValue.value == 0 ? "none" : "flex",
    position: "absolute",
    transform: [
      { translateY: -RightbottomValue.value }, // Translate vertically
      { translateX: RightpositionValue.value }, // Translate horizontally
    ],
  }));
  const animatedStyles3 = useAnimatedStyle(() => ({
    display: topIconBottomValue.value == 0 ? "none" : "flex",
    position: "absolute",
    alignItems: "center",
    transform: [
      { translateY: -topIconBottomValue.value }, // Translate vertically
      { translateX: topIconPositionValue.value }, // Translate horizontally
    ],
  }));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Start the breathing animation
  useEffect(() => {
    scale.value = withRepeat(
      withSpring(
        1.2, // Target scale
        {
          duration: 2000, // Duration in milliseconds for the spring animation
          damping: 3, // Decrease damping for a smoother animation
          stiffness: 100,
        }
      ), // Scale up to 1.1
      -1, // Repeat indefinitely
      true // Reverse animation on completion
    );

    // Clean up function to stop the animation when component unmounts
    return () => {
      scale.value = 1; // Reset scale when component unmounts
    };
  }, []);

  return (
    <>
      <BlurView
        intensity={60}
        tint="light"
        className="bg-black/90 "
        style={{
          position: "absolute",
          display: displayView,
          top: 0,
          left: 0,
          height: hp(100),
          width: wp(100),
        }}
      />
      <View
        style={{
          position: "relative",
        }}
      >
        <LinearGradient
      colors={["rgba(253, 185, 38,1)", "rgba(253, 185, 38, 0.8)"]}
      start={{ x: 0.5, y: 0 }}  // Start from the top center
      end={{ x: 0.5, y: 1 }}
        // className="bg-[#fdb926]/90"
          style={{
            flexDirection: "row",
            padding: 5,
            position: "absolute",
            bottom: 20,
            left: 0,
            marginHorizontal: 10,
            borderRadius: 30,
            zIndex: 15,
            opacity:40
          }}
        >
          {/* Render the last view first */}

          {/* Render other components */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigate(route.name, { user_id: user.id });
              }
            };
            const onPress2 = (key, name) => {
              const event = navigation.emit({
                type: "tabPress",
                target: key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigate(name);
              }
              handleAnimatedButton();
            };
            const onPress3 = (name) => {
              navigate(name);

              handleAnimatedButton();
            };

            if (
              label == "Moviehome" ||
              label == "Barcode" ||
              label == "Arena" ||
              label == "TodoScreen"
            ) {
              return;
            }
            let TextDisplay = "Home";
            if (label == "BuzzwallScreen") {
              TextDisplay = "BuzzWall";
            }
            if (label == "TodoScreen") {
              TextDisplay = "In Progress";
            }
            if (label == "Home") {
              TextDisplay = "";
            }
            if (label == "Arena") {
              TextDisplay = "Arena";
            }
            if (label == "OtherUserScreen") {
              TextDisplay = "Profile";
            }
            if (label == "Peoples") {
              TextDisplay = "Social";
            }
            if (label == "Employee") {
              TextDisplay = "Employee";
            }
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={
                  label === "Home" ? () => console.log("hello") : onPress
                }
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 240,
                }}
                key={route.name}
              >
                {label === "Home" && (
                  <Animated.View style={{}}>
                    {/* <Animated.View style={[animatedStyles]}>
                    <TouchableOpacity
                      onPress={() => onPress2(route.key, route.name)}
                      style={{
                        padding: 12,
                        backgroundColor: "orange",
                        borderRadius: 50,
                        width: 50,
                        height: 50,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Entypo name="location-pin" size={25} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: "black" }}>Location</Text>
                  </Animated.View> */}
                    {/* <Animated.View style={[animatedStyles2]}>
                    <TouchableOpacity
                      onPress={() => onPress3("Barcode")}
                      style={{
                        padding: 12,
                        backgroundColor: "blue",
                        borderRadius: 50,
                        width: 50,
                        height: 50,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={25}
                        color="white"
                      />
                    </TouchableOpacity>
                    <Text style={{ color: "black" }}>Scan Qr</Text>
                  </Animated.View> */}
                    <Animated.View style={[animatedStyles3]}>
                      <TouchableOpacity
                        onPress={() =>
                          navigate("UserPost", {
                            user_id: user?.id,
                          })
                        }
                        style={{
                          padding: 12,
                          backgroundColor: "red",
                          borderRadius: 50,
                          width: 50,
                          height: 50,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <FontAwesome5 name="pen-nib" size={25} color="white" />
                      </TouchableOpacity>
                      <Text style={{ color: "black" }}>Create Post</Text>
                    </Animated.View>

                    <TouchableOpacity onPress={handleAnimatedButton}>
                      <Animated.View style={[animatedStyle]}>
                        <Text className="text-green-700">
                          <AntDesign name="pluscircle" size={40} />
                        </Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </Animated.View>
                )}
                {label === "TodoScreen" && (
                  <>
                    <FontAwesome6
                      name="person-running"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
                {label === "BuzzwallScreen" && (
                  <>
                    <Entypo
                      name="home"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
                {label === "Arena" && (
                  <>
                    <MaterialCommunityIcons
                      name="sword-cross"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
                {label === "Peoples" && (
                  <>
                    <FontAwesome6
                      name="users"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
                {label === "OtherUserScreen" && (
                  <>
                    <FontAwesome5
                      name="user-alt"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
                {label === "Employee" && (
                  <>
                    <MaterialCommunityIcons
                      name="office-building"
                      size={wp(5)}
                      color={isFocused ? "#542582" : "black"}
                    />
                    <Text
                      style={{
                        color: isFocused ? "#542582" : "black",
                        fontFamily: "raleway",
                        fontSize: wp(2.5),
                      }}
                    >
                      {TextDisplay}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
      {/* <View
        style={[
          {
            position: "absolute",
            bottom: -30,
            zIndex: 10,
            left: "25%",
            height: wp(50),
            borderRadius: 400,
            backgroundColor: "gray",

            width: wp(50),
            justifyContent: "center",
            alignItems: "center",
            display: displayView,
            opacity: 0.5,
            borderWidth: 0.3,
            borderColor: "gray",
          },
        ]}
      ></View> */}
    </>
  );
};

export default CustomTabBar;
