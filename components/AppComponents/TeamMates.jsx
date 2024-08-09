import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { baseImgURL, baseURL } from "../../backend/baseData";
import axios from "axios";
import Toast from "react-native-root-toast";
import { useGlobalContext } from "../../context/GlobalProvider";
const TeamMates = ({ item }) => {
  const [following, setFollowing] = useState(
    item.following == "yes" ? true : false
  );
  // console.log("following",item.following)
  // console.log(following)
  const { user } = useGlobalContext();
  useEffect(() => {
    setFollowing(item.following === "yes" ? true : false);
  }, [item.following]);
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);
  const handleFollow = async () => {
    if (user) {
      try {
        let baSeNav = `${baseURL}/event-Follow.php?page_id=${item.id}&userId=${user.id}`;

        if (item.type == "user") {
          baSeNav = `${baseURL}/toggle-user-follow.php?followed_user=${user.id}&user_id=${item.id}`;
        }
        const response = await axios.get(`${baSeNav}`);
        if (response.status === 200) {
          setFollowing((prevFollowing) => !prevFollowing);
          if (following == false) {
            if (item.type == "user" && item.account_status) {
              if (item.account_status == "private") {
                let toast = Toast.show(
                  `You succesfully requested to follow ${item.name}`,
                  {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                    backgroundColor: "white", // Set background color to transparent
                    textColor: "black",
                    containerStyle: {
                      backgroundColor: "white",
                      borderRadius: 50,
                      padding: 15,
                    },
                    onShow: () => {
                      // Calls on toast's appear animation start
                    },
                    onShown: () => {
                      // Calls on toast's appear animation end.
                    },
                    onHide: () => {
                      // Calls on toast's hide animation start.
                    },
                    onHidden: () => {
                      // Calls on toast's hide animation end.
                    },
                  }
                );
                return;
              }
            }
            let toast = Toast.show(`You started following ${item.name}`, {
              duration: Toast.durations.SHORT,
              position: Toast.positions.BOTTOM,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
              backgroundColor: "white", // Set background color to transparent
              textColor: "black",
              containerStyle: {
                backgroundColor: "white",
                borderRadius: 50,
                padding: 15,
              },
              onShow: () => {
                // Calls on toast's appear animation start
              },
              onShown: () => {
                // Calls on toast's appear animation end.
              },
              onHide: () => {
                // Calls on toast's hide animation start.
              },
              onHidden: () => {
                // Calls on toast's hide animation end.
              },
            });
          } else {
            let toast = Toast.show(`You unfollowed ${item.name}`, {
              duration: Toast.durations.SHORT,
              position: Toast.positions.BOTTOM,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
              backgroundColor: "white", // Set background color to transparent
              textColor: "black",
              containerStyle: {
                backgroundColor: "white",
                borderRadius: 50,
                padding: 15,
              },
              onShow: () => {
                // Calls on toast's appear animation start
              },
              onShown: () => {
                // Calls on toast's appear animation end.
              },
              onHide: () => {
                // Calls on toast's hide animation start.
              },
              onHidden: () => {
                // Calls on toast's hide animation end.
              },
            });
          }
        } else {
          console.error("Failed to toggle followers");
        }
      } catch (error) {
        console.error("Error while toggling followers:", error.message);
      }
    }
  };

  return (
    <View className="flex-row items-center justify-between my-[1px]">
      <TouchableOpacity
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          // paddingBottom: 10,
        }}
        onPress={() => {
          navigation.navigate("OtherUserScreen", {
            user_id: item?.id,
          });
        }}
      >
        {item.image?.length > 0 ? (
          <Image
            source={{ uri: `${baseImgURL + item.image}` }}
            style={{
              width: wp(6),
              height: wp(6),
            }}
            className="rounded-full"
          />
        ) : (
          <View className="p-1 bg-[#ff8f8e] rounded-full w-[3vh] h-[3vh] justify-center items-center">
            <Text
              style={{
                fontSize: hp(1.4),
                fontFamily: "raleway-bold",
                color: "white",
              }}
            >
              {item.first_character}
            </Text>
          </View>
        )}
        <Text
          style={{
            fontSize: hp(1.5),
            color: "white",
            fontFamily: "raleway",
            width: 100, // Adjust the width as needed to fit your layout
          }}
          numberOfLines={2}
          ellipsizeMode="end"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (following) {
            setShowAlert(true);
          } else {
            handleFollow();
          }
        }}
        style={{
          shadowColor: "#000",
          backgroundColor: following ? "black" : "#0195f7",
          paddingVertical: 4,
          paddingHorizontal: 15,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
          borderRadius: 5,
          width: 80,
        }}
      >
        <Text
          style={{
            color: "white",
            fontFamily: "raleway",
            textAlign: "center",
            fontSize: hp(1),
          }}
        >
          {following ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TeamMates;
