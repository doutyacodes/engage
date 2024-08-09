import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { baseImgURL, baseURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
const StoreDetails = ({ item, user_id }) => {
  const handlePress = () => {
    // Replace 37.78825 and -122.4324 with actual latitude and longitude values

    // Construct Google Maps URL with destination coordinates
    // const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

    // // Open Google Maps directions in browser or app
    // Linking.openURL(url);

    navigation.navigate("FoodMap",{
      item:item,
      user_id:user_id
    })
  };
  const navigation = useNavigation();
  const continueToNextScreen = async () => {
    if (parseInt(item.distance)  > 50) {
      Toast.show({
        type: "info",
        text1: "Sorry",
        text2: `You have to be in this location start the challenge.`,
      });
    } else {
      try {
        const response = await axios.post(
          `${baseURL}/createUserChallenge.php`,
          {
            user_id: user_id,
            challenge_id: item.challenge_id,
            page_id: item.page_id,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        console.log(response.data);
        if (response.data.success) {
          navigation.navigate("FoodApprovalScreen", {
            item: item,
            completed_id: response.data.completed_id,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };
  return (
    <View
      style={{
        padding: 10,
        marginTop: 10,
        borderRadius: 12,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
          padding: 5,
        }}
      >
        <Image
          source={{ uri: `${baseImgURL + item.image}` }}
          style={{ height: hp(10), width: hp(10), borderRadius: 10 }}
        />
        <Text
          style={{
            fontSize: hp(1.8),
            fontFamily: "raleway-bold",
            flex: 1,
            textAlign: "center",
          }}
        >
          {item.name}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          height: 0.5,
          width: wp(80),
          backgroundColor: "#e5e5e5",
        }}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 5 }}>
          <Text style={{ color: "gray" }}>Distance</Text>
          <Text style={{ fontFamily: "raleway-bold" }}>
            {parseInt(item.distance) / 1000} km
          </Text>
        </View>
        <View style={{ gap: 5 }}>
          <Text style={{ color: "gray" }}>Availability</Text>
          <Text style={{ fontFamily: "raleway-bold" }}>
            {item.opened == "yes" ? "Opened" : "Closed"}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ gap: 5 }}>
          <Text style={{ color: "gray" }}>Google Map</Text>
          <TouchableOpacity
            style={{
              width: 45,
              height: 45,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
              borderRadius: 56,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handlePress}
          >
            <Entypo name="location-pin" size={18} color="blue" />
          </TouchableOpacity>
        </View>
        <View style={{ gap: 5 }}>
          <Text style={{ color: "gray" }}>Challenge</Text>
          <TouchableOpacity
            onPress={continueToNextScreen}
            style={{
              backgroundColor: "green",
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={{ color: "white", fontFamily: "raleway-bold" }}>
              Start
            </Text>
            <Entypo name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StoreDetails;

const styles = StyleSheet.create({});
