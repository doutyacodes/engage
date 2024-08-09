import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
const QuizComplete = ({ route }) => {
  const navigation = useNavigation();
  const { user_id, challenge_id } = route.params;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#648e8c",
      }}
    >
      <View style={{ justifyContent: "center", flex: 1 }}>
        <Text style={{ fontSize: hp(2.5), color: "white" }}>
          Congratulations !
        </Text>
      </View>
      <View style={{ flex: 1 }}>
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
          <AntDesign name="checkcircleo" size={wp(35)} color="white" />
        </View>
      </View>
      <View style={{ flex: 1, padding: 19, gap: 15 }}>
        <TouchableOpacity
          style={{
            marginTop: 2,
            padding: 10,
            backgroundColor: "red",
            minWidth: wp(80),
            borderRadius: 12,
          }}
          onPress={() => navigation.replace("InnerPage")}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: hp(2),
              fontFamily: "raleway-bold",
              color: "white",
            }}
          >
            Go Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            marginTop: 2,
            padding: 10,
            backgroundColor: "#FF9800",
            borderRadius: 12,
            minWidth: wp(80),
          }}
          onPress={() =>
            navigation.replace("CameraScreen", {
              user_id: user_id,
              challenge_id: challenge_id,
            })
          }
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: hp(2),
              fontFamily: "raleway-bold",
              color: "white",
            }}
          >
           Share your moment  with Us
          </Text>
        </TouchableOpacity>
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

export default QuizComplete;

const styles = StyleSheet.create({});
