import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { baseImgURL, baseURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import RedIcon  from "../../assets/images/red-alert.png"
import GreenIcon  from "../../assets/images/green-tick.png"
const MediaNotification = ({ item }) => {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: "row", alignItems: "center",padding:10 }}>
      <View style={{ flexDirection: "row", gap: 7, alignItems: "center" }}>
        <TouchableOpacity
         
          style={styles.avatarContainer}
        >
          { (
            <Image
              style={{
                width: wp(15),
                height: wp(15),
                borderRadius: 50,
              }}
              source={item.info_type == "media_approved" ?  GreenIcon : RedIcon}
            />
          ) }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ChallengeDetails", {
              challenge:item.challenge,
              completeOne: true,
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
                color:item.info_type == "media_rejected" ? "red" : "green"
              }}
            >
              {item.info_type == "media_approved" && " the media is approved"}
            {item.info_type == "media_rejected" &&
              " the media is rejected"}
            </Text>{" "}
            
           
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MediaNotification;

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: wp(15),
    width: wp(15),
    backgroundColor: "white",
    borderRadius: 50,
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
});
