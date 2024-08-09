import { Image, StyleSheet, Text, View, Linking } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TouchableOpacity } from "react-native-gesture-handler";

const ForceUpdate = () => {
  const openPlayStoreListing = async () => {
    const url = "market://details?id=YOUR_APP_PACKAGE_NAME"; // Replace with your app's package name
    await Linking.openURL(url);
  };
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/update.png")}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Time To Update!
        </Text>
        <Text style={styles.description}>
          We added a lots of features and fix some bugs to make sure your
          experience as smooth as possible
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={openPlayStoreListing} style={styles.button}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "white",
    gap: 10,
  },
  image: {
    width: wp(95),
    height: hp(40),
  },
  textContainer: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    gap: 10,
  },
  title: {
    fontSize: hp(2.1),
    fontFamily: "raleway-bold",
    textAlign: "center",
  },
  description: {
    fontSize: hp(1.7),
    fontFamily: "raleway-bold",
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: "#FF6376",
    borderRadius: 15,
  },
  buttonText: {
    fontSize: hp(2),
    color: "white",
    fontFamily: "raleway-bold",
  },
});

export default ForceUpdate;
