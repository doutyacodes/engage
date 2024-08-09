import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
// import * as Application from "expo-application";

const AuthSelectorScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDeviceInformation = async () => {
      try {
        // const deviceName = await Application.getApplicationName();
        // const deviceKey = await Application.getApplicationKey();
        // const phoneNumber = await Application.applicationName;

        // console.log("deviceName:", deviceName);
        // console.log("deviceKey:", deviceKey);
        // console.log("phoneNumber:", phoneNumber);
      } catch (error) {
        console.error("Error fetching device information:", error);
      }
    };

    fetchDeviceInformation();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#20bb59",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <View style={{ marginBottom: 50, gap: 10 }}>
        <Text
          style={{
            color: "white",
            fontSize: hp(2.8),
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Discover fun, earn, overcome, experience!
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: hp(2.2),
            fontWeight: "400",
            textAlign: "center",
          }}
        >
          Discover fun, earn, overcome, experience!
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
            gap: 20,
          }}
        >
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "lightgray",
              backgroundColor: "#282828",
              paddingVertical: 15,
              flex: 1,
              borderRadius: 12,
            }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: hp(2),
                fontWeight: "bold",
                color: "white",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              paddingVertical: 15,
              flex: 1,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: hp(2),
                fontWeight: "bold",
              }}
              onPress={() => navigation.navigate("OtpVerification")}
            >
              SignUp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ position: "absolute", top: hp(20), left: 0 }}>
        <Image
          source={require("../assets/backgrounds/file.png")}
          style={{ height: hp(40), width: hp(40) }}
        />
      </View>
    </View>
  );
};

export default AuthSelectorScreen;

const styles = StyleSheet.create({});
