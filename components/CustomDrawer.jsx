import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  TextInput,
  Share,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { useDrawerStatus } from "@react-navigation/drawer";
import {
  MaterialIcons,
  Ionicons,
  AntDesign,
  FontAwesome6,
  Entypo,
} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Divider } from "react-native-paper";
const CustomDrawer = () => {
  const [userData, setUserData] = useState([]);
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchData, setSearchData] = useState([]);
  const isFocused = useIsFocused();
  const [openedDrawer, setOpenedDrawer] = useState(
    useDrawerStatus() === "open"
  );
  const navigation = useNavigation();
  const isDrawerOpen = useDrawerStatus() === "open";

  // console.log(isDrawerOpen);
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
    }, [isDrawerOpen])
  );

  useEffect(() => {
    const fetchPeople = async () => {
      if (user) {
        // console.log(user)
        try {
          const response = await axios.get(
            `${baseURL}/getOtherUser.php?user_id=${user.id}`
          );
          if (response.status === 200) {
            setUserData(response.data);
            setCount(response.data.followers);
            // console.log(response.data)
          } else {
            console.error("Failed to fetch other user");
          }
        } catch (error) {
          console.error("Error while fetching other user:", error.message);
        }
      }
    };

    fetchPeople();

    const interval = setInterval(fetchPeople, 1000); // Fetch data every 10 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [user]);
  useEffect(() => {
    const fetchSearch = async () => {
      if (user && searchText.length > 0) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/searchUser.php?user_id=${user.id}&text=${searchText}`
          );

          if (response.status === 200) {
            setSearchData(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch users");
          }
        } catch (error) {
          console.error("Error while fetching users:", error.message);
        }
      }
      if (searchText.length <= 0) {
        setSearchData([]);
      }
    };

    fetchSearch();
  }, [searchText]);
  // console.log(userData?.user_image)

  const handleLogout = async () => {
    try {
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem("user");

      navigation.navigate("OtpVerification");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/bgLog.png")}
        resizeMode="cover"
        style={{ width: "100%", minHeight: hp(30) }}
      >
        <View style={{ padding: 25 }}>
          <View
            style={{ justifyContent: "center", alignItems: "center", gap: 30 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: wp(25),
                width: wp(25),
                backgroundColor:
                  userData.user_image?.length > 0 ? "transparent" : "#ff8f8e",
                borderRadius: 50,
                marginTop: 30,
              }}
            >
              {userData.user_image?.length > 0 ? (
                <Image
                  source={{ uri: `${baseImgURL + userData.user_image}` }}
                  style={{
                    width: wp(25),
                    height: wp(25),
                    borderRadius: 70,
                    alignSelf: "center",
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontFamily: "raleway-bold",
                    color: "white",
                    fontSize: wp(5),
                  }}
                >
                  {userData.first_character}
                </Text>
              )}
            </View>
            <Text
              style={{
                fontFamily: "raleway-bold",
                color: "black",
                fontSize: wp(5),
              }}
            >
              {userData.name}
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                gap: 3,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={{ gap: 10 }}
                onPress={() =>
                  navigation.navigate("FriendsScreen", {
                    user: user,
                  })
                }
              >
                <Text style={styles.statsNumber}>{count}</Text>
                <Text style={styles.statsText}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ gap: 10 }}
                onPress={() =>
                  navigation.navigate("FriendsScreen", {
                    user: user,
                  })
                }
              >
                <Text style={styles.statsNumber}>{userData.following}</Text>
                <Text style={styles.statsText}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ gap: 10 }}
                onPress={() =>
                  navigation.navigate("FriendsScreen", {
                    user: user,
                  })
                }
              >
                <Text style={styles.statsNumber}>{userData.friends_count}</Text>
                <Text style={styles.statsText}>Friends</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OtherUserScreen", {
              user_id: user?.id,
            });
          }}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <FontAwesome name="user-circle-o" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            My Profile
          </Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("ReferralPage")}
        >
          <FontAwesome name="user-plus" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            Referral Challenges
          </Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
          onPress={() =>
            navigation.navigate("UserPost", {
              user_id: user?.id,
            })
          }
        >
          <MaterialIcons name="perm-media" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            Add posts
          </Text>
        </TouchableOpacity>
        <Divider />
        {/* <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <FontAwesome6 name="circle-info" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            About Us
          </Text>
        </TouchableOpacity>
        <Divider />

        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Entypo name="phone" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            Contact Us
          </Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("FaqScreen")}
        >
          <AntDesign name="questioncircle" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            FAQ
          </Text>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Ionicons name="settings" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            Settings
          </Text>
        </TouchableOpacity>
        <Divider /> */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 15,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <MaterialIcons name="logout" size={hp(2.2)} color="black" />
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-bold" }}>
            Logout
          </Text>
        </TouchableOpacity>
        <Divider />
      </View>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  statsNumber: {
    fontFamily: "raleway-bold",
    fontSize: hp(1.7),
    textAlign: "center",
  },
  statsText: {
    fontSize: hp(1.7),
    fontFamily: "raleway-semibold",
    textAlign: "center",
  },
});
