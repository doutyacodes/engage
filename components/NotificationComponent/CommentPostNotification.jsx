import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { baseImgURL, baseURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
const CommentPostNotification = ({ item ,index}) => {
  const navigation = useNavigation();
  return (
<View style={{ 
flexDirection: "row", alignItems: "center",padding:10
}}>
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
            navigation.navigate("CommentPost", {
              user_id: item.user_id,
              item: { post_id: item.post_id,page_id:item.page_id },
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
            {item.info_type == "post_replied" && "has replied to your comment"}
            
            {item.info_type == "post_comment_liked" &&
              "has liked to your comment"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentPostNotification;

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
