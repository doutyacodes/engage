import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
const QuizCountPage = ({ route }) => {
  const navigation = useNavigation();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("QuizPageScreen", {
        currentIndex: route.params.currentIndex,
        dataQuiz: route.params.dataQuiz,
        user: route.params.user,
        live: route.params.live,
      });
    }, 1000);

    // Clear the timer on component unmount
    return () => clearTimeout(timer);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#648e8c",
      }}
    >
      <View
        style={{
          height: wp(50),
          width: wp(50),
          borderRadius: wp(40),
          backgroundColor: "rgba(255 255 255 / 0.2)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: wp(35), marginBottom: wp(3) }}>
          {route.params.currentIndex + 1}
        </Text>
      </View>
      <Image
        source={require("../assets/images/doodle.jpg")}
        style={{
          resizeMode: "cover",
          height: hp(100),
          width: wp(100),
          opacity: 0.1,
          zIndex: -5,
          position: "absolute",
        }}
      />
    </View>
  );
};

export default QuizCountPage;

const styles = StyleSheet.create({});
