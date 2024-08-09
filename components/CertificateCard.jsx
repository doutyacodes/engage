import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL } from "../backend/baseData";
import { useNavigation } from "@react-navigation/native";
const CertificateCard = ({ item }) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        minWidth: wp(90),
        backgroundColor: "white",
        padding: 10,
        borderWidth: 1,
        borderColor: "lightgray",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CertificateViewer", {
              imageLocation: `${baseImgURL + item.image}`,
              item: item,
            })
          }
          style={{ flex: 1 }}
        >
          <Image
            style={styles.image}
            source={{ uri: `${baseImgURL + item.image}` }}
          />
        </TouchableOpacity>
        <Text
          style={{
            // color: "#ee5c5d",
            fontSize: hp(2),
            fontFamily: "raleway-bold",
            textAlign: "center",
            marginTop: 10,
            marginBottom:5
          }}
          className='uppercase underline'
        >
          Certificate
        </Text>

        {/* <Text
          style={{
            color: "#ee5c5d",
            fontSize: hp(1.8),
            fontFamily: "raleway-bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {item.name}
        </Text> */}
        <Text
          style={{
            // color: "white",
            fontSize: hp(1.6),
            fontFamily: "raleway",
            textAlign: "justify",
            marginBottom: 10,
          }}
          className="leading-5"
        >
          This certificate acknowledges that <Text style={{fontFamily:"raleway-bold"}}>{item.name}</Text> has completed the{" "}
          {item.challenge_title} challenge organized by {item.page_title} on{" "}
          {item.end_date}.
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10,
          }}
        >
          <View
            style={{ padding: 2, backgroundColor: "white", borderRadius: 12 }}
          >
            <Image
              source={require("../assets/images/signature.png")}
              style={{ width: wp(17), height: wp(17), resizeMode: "cover" }}
            />
          </View>
          <Image
            source={require("../assets/images/badge.png")}
            style={{ width: wp(17), height: wp(17), resizeMode: "cover" }}
          />
          <View
            style={{ padding: 2, backgroundColor: "white", borderRadius: 12 }}
          >
            <Image
              source={require("../assets/images/signature.png")}
              style={{ width: wp(17), height: wp(17), resizeMode: "cover" }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CertificateCard;

const styles = StyleSheet.create({
  image: {
    height: hp(30),
    width: "100%",
    borderRadius: 10,
  },
});
