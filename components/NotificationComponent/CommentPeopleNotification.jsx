import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { baseImgURL, baseURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
const CommentPeopleNotification = ({ item, index }) => {
  const navigation = useNavigation();
  let navUrl = "CommentPeople";
  if (item.info_type == "people_liked") {
    navUrl = "SinglePeople";
  }
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("OtherUserScreen", {
              user_id: item.other_user,
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
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(navUrl, {
              user_id: item.user_id,
              item: {
                post_id: item.post_id,
                people_id: item.people_id,
                people_data_id: item.people_id,
                id: item.people_id,
              },
            })
          }
          style={{ flex: 1 }}
        >
          <Text
            style={{
              fontSize: hp(1.6),
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{
                fontSize: hp(1.8),
                fontFamily: "raleway-bold",
                flexWrap: "wrap",
              }}
            >
              {item.name}
            </Text>{" "}
            {item.info_type == "people_replied" &&
              "has replied to your comment"}
            {item.info_type == "people_comment_liked" &&
              "has liked to your comment"}
            {item.info_type == "people_liked" && "has liked to your media"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentPeopleNotification;

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
