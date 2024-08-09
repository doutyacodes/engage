import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { baseImgURL } from "../backend/baseData";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import Animated from "react-native-reanimated";
import { FadeInDown } from "react-native-reanimated";
import { AntDesign, Octicons, Entypo } from "@expo/vector-icons";

// import { usePreventScreenCapture } from "expo-screen-capture";

const CertificateViewer = ({ route }) => {
  // usePreventScreenCapture();
  const [status, setStatus] = useState("");

  const { imageLocation, item } = route.params;
  const viewShotRef = useRef();

  //   console.log(imageLocation);
  const navigation = useNavigation();
  const onSaveImageAsync = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      if (uri) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.log("error", error.message);
    }
  };
  return (
    <View className="flex-1 justify-center items-center bg-[#e5e5e5]">
      <View className=" p-5  justify-center items-center">
        <View
          style={styles.container}
          className="bg-white shadow rounded-lg px-3"
        >
          {/* <View style={styles.cardHeader}>
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
                    borderWidth: 1,
                    borderColor: "gray",
                  }}
                  source={{ uri: `${baseImgURL + item.user_image}` }}
                />
              ) : (
                <Text style={styles.avatarText}>{item.first_character}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("OtherUserScreen", {
                  user_id: item.user_id,
                });
              }}
              style={styles.detailsContainer}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </TouchableOpacity>
          </View> */}
          <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 1 }}
        className="bg-white"
      >
          <Image
            source={{ uri: `${imageLocation}` }}
            style={styles.imageContainer}
            resizeMode="contain"
            className="rounded-md"
          />
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
              style={{
                padding: 2,
                backgroundColor: "white",
                borderRadius: 12,
              }}
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
              style={{
                padding: 2,
                backgroundColor: "white",
                borderRadius: 12,
              }}
            >
              <Image
                source={require("../assets/images/signature.png")}
                style={{ width: wp(17), height: wp(17), resizeMode: "cover" }}
              />
            </View>
          </View>
          </ViewShot>

          <StatusBar style="dark" />
        </View>
      </View>
      <View className="flex-row mt-5 items-center space-x-14">
        <Animated.View
          entering={FadeInDown.springify()}
          className="h-[6vh] w-[6vh] justify-center items-center bg-black/20 rounded-md"
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Octicons name="x" size={24} color={"white"} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.springify().delay(100)}
          className="h-[6vh] w-[6vh] justify-center items-center bg-black/20 rounded-md"
        >
          <TouchableOpacity onPress={onSaveImageAsync}>
            <Entypo name="share" size={24} color={"white"} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default CertificateViewer;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingTop: 30,
  },
  imageContainer: {
    minHeight: hp(30),
    minWidth: wp(90),
    width: "100%",
    // resizeMode: "contain",
  },
  closeBtn: {
    position: "absolute",
    padding: 30,
    top: 10,
    right: 10,
  },
  card: {
    backgroundColor: "white",
    padding: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
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
  detailsContainer: {
    gap: 5,
  },
  name: {
    fontSize: hp(1.9),
    fontFamily: "raleway-bold",
  },
  date: {
    fontSize: hp(1.6),
    color: "#898989",
    fontFamily: "raleway",
  },
  reportIcon: {
    marginLeft: "auto",
    position: "relative",
  },
  image: {
    height: wp(80),
    height: wp(80),
    borderRadius: 10,
  },
  captionContainer: {
    paddingTop: 10,
  },
  caption: {
    fontSize: hp(1.9),
    fontFamily: "raleway-bold",
  },
});
