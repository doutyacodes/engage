import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import pending from "../assets/images/pending.png";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import { useNavigation } from "@react-navigation/native";
const VerificationScreen = () => {
  const { user: userDetails } = useGlobalContext();
  const navigation = useNavigation();

  const fetchUser = async () => {
    if (userDetails) {
      try {
        // Only fetch rewards if user data is available
        const response = await axios.get(
          `${baseURL}/getUserDetails.php?id=${userDetails.id}`
        );
        if (response.data.success) {
          if (response.data.user.data.verified == "yes") {
            navigation.replace("InnerPage");
          }
        }
        // console.log(response.data)
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <View className="flex-1 justify-center items-center">
      <View className="justify-center items-center space-y-4">
        <Image
          source={pending}
          className="w-[100vh] h-[40vh]"
          resizeMode="contain"
        />
        <View className="space-y-4 px-3">
          <Text
            className=" text-xl text-center"
            style={{ fontFamily: "raleway-bold" }}
          >
            Account is under verification.
          </Text>
          <Text
            className="text-sm text-center"
            style={{ fontFamily: "raleway" }}
          >
            Your account is currently under verification and will be verified
            shortly.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default VerificationScreen;
