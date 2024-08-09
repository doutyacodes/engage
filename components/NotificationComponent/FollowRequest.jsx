import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { baseImgURL, baseURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import axios from "axios";
const FollowRequest = ({ item ,index}) => {
  const [toggled, setToggled] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const handleConfirm = async () => {
    try {
        const response = await axios.get(
          `${baseURL}/approveFollow.php?followed_user=${item.followed_user}&user_id=${item.user_id}`
        );
        if (response.status === 200) {
          // console.log(response.data)
          setToggled(true);
        } else {
          console.error("Failed to approve followers");
        }
      } catch (error) {
        console.error("Error while approve followers:", error.message);
      }
    
  };
  const handleDelete = async () => {
    try {
        const response = await axios.get(
          `${baseURL}/deleteFollow.php?followed_user=${item.followed_user}&user_id=${item.user_id}`
        );
        if (response.status === 200) {
          // console.log(response.data)
          setDeleted(true);
        } else {
          console.error("Failed to approve followers");
        }
      } catch (error) {
        console.error("Error while approve followers:", error.message);
      }
    
  };
  const navigation = useNavigation();
  if (deleted) {
    return null; // If deleted, render nothing
  }
  return (
    <View style={{  flexDirection: "row", alignItems: "center",padding:10}}>
      <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OtherUserScreen", {
              user_id: item.user_id,
            });
          }}
          style={styles.avatarContainer}
        >
          {item.user_image?.length > 0 ? (
            <Image
              style={{
                width: wp(15),
                height: wp(15),
                borderRadius: 50,
              }}
              source={{ uri: `${baseImgURL + item.user_image}` }}
            />
          ) : (
            <Text style={styles.avatarText}>{item.first_character}</Text>
          )}
        </TouchableOpacity>
        <Text
          style={{
            fontSize: hp(1.8),
            fontFamily: "raleway-bold",
            flexWrap: "wrap",
          }}
        >
          {toggled
            ? `${item.name} has started following you`
            : item.name.length > 10
            ? `${item.name.slice(0, 10)}...`
            : item.name}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 3,
        }}
      >
        {!toggled && (
          <>
            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderRadius: 8,
                backgroundColor: "black",
              }}
              onPress={handleConfirm}
            >
              <Text style={{ color: "white", fontFamily: "raleway-bold" }}>
                Confirm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderRadius: 8,
                borderWidth: 1,
              }}
              onPress={handleDelete}
            >
              <Text style={{ fontFamily: "raleway-bold" }}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default FollowRequest;

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: wp(15),
    width: wp(15),
    backgroundColor: "#ff8f8e",
    borderRadius: 50,
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
});
