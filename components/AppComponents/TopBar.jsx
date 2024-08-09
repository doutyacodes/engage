import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import wowfy_black from "../../assets/logos/wowfy_black.png";
import wowfy_white from "../../assets/logos/wowfy_white.png";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import axios from "axios";
import { baseURL } from "../../backend/baseData";
import { useGlobalContext } from "../../context/GlobalProvider";
const TopBar = ({ marginTop, color, user }) => {
  const [count, setCount] = useState(0);
  const navigation = useNavigation();
  const { user: userDetails } = useGlobalContext();
  // console.log(userDetails)

  const fetchUser = async () => {
    if (userDetails) {
      try {
        // Only fetch rewards if user data is available
        const response = await axios.get(
          `${baseURL}/getUserDetails.php?id=${userDetails.id}`
        );
        if (response.data.success) {
          if (response.data.user.data.verified == "no") {
            navigation.replace("VerificationScreen");
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
    const fetchNotification = async () => {
      if (user) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/getNotificationseen.php?userId=${user.id}`
          );

          if (response.status === 200) {
            setCount(response.data?.length || 0);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch notification");
          }
        } catch (error) {
          console.error("Error while fetching notification:", error.message);
        }
      }
    };
    fetchNotification();
  }, [user]);

  return (
    <View
      style={{
        marginTop: marginTop || 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 15,
        width: "100%",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <TouchableOpacity
          onPress={() => navigation.getParent("LeftDrawer").openDrawer()}
        >
          <Feather name="menu" size={24} color={color ? color : "black"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("SearchScreen")}>
          <Feather name="search" size={24} color={color ? color : "black"} />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: "center" }}>
        <Image
          source={color ? wowfy_white : wowfy_black}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationScreen")}
          style={{ position: "relative" }}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={color ? color : "black"}
          />
          {count > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 2,
                height: 5,
                width: 5,
                backgroundColor: "red",
                borderRadius: 10,
              }}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 1 }}
          onPress={() => navigation.getParent("RightDrawer").openDrawer()}
        >
          <FontAwesome name="gear" size={26} color={color ? color : "black"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopBar;

const styles = StyleSheet.create({
  topLogo: {
    height: 40,
    width: 40,
    // marginTop: 50,
    backgroundColor:"transparent"
  },
  settingsIcon: {
    padding: 1,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
});
