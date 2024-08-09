import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AntDesign, Octicons, Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { FadeInDown } from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-root-toast";
import * as Sharing from "expo-sharing";
// import { usePreventScreenCapture } from "expo-screen-capture";
const ImageViewingScreen = ({ route }) => {
  // usePreventScreenCapture();

  const { imageLocation } = route.params;
  const aspectRatio = route.params.aspectRatio
    ? route.params.aspectRatio
    : null;
  //   console.log(imageLocation);
  const [status, setStatus] = useState("loading");

  const fileName = imageLocation.split("/").pop();
  const imageUrl = imageLocation;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  const navigation = useNavigation();
  const getSize = () => {
    const maxWidth = wp(92);
    let calculatedHeight = maxWidth / aspectRatio;
    let calculatedWidth = maxWidth;
    if (aspectRatio) {
      calculatedWidth = calculatedHeight * aspectRatio;
    }
    return {
      width: calculatedWidth,
      height: calculatedHeight,
    };
  };
  const onLoad = () => {
    setStatus("");
  };

  const downloadFile = async () => {
    try {
      const { uri } = await FileSystem.downloadAsync(imageUrl, filePath);
      setStatus("");
      console.log("downloaded at:", uri);

      return uri;
    } catch (error) {
      console.log("got error", error.message);
      setStatus("");
      Alert.alert("Image", error.message);

      return null;
    } finally {
      setStatus("");
    }
  };
  const handleDownloadImage = async () => {
    setStatus("downloading");
    let uri = await downloadFile();
    if (uri) {
      setStatus("");

      const successMessage = `Image downloaded successfully`;
      let toast = Toast.show(successMessage, {
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
  };
  const handleShareImage = async () => {
    setStatus("sharing");
    let uri = await downloadFile();
    if (uri) {
      await Sharing.shareAsync(uri);
    }
  };
  return (
    <BlurView intensity={100} tint="dark" style={styles.container}>
      {status == "loading" && (
        <ActivityIndicator
          size={"large"}
          color={"white"}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      )}
      <Image
        source={imageLocation}
        contentFit="contain"
        transition={100}
        style={[styles.imageContainer, getSize()]}
        onLoad={onLoad}
      />
      <View className="flex-row mt-5 items-center space-x-14">
        <Animated.View
          entering={FadeInDown.springify()}
          className="h-[6vh] w-[6vh] justify-center items-center bg-white/20 rounded-md"
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Octicons name="x" size={24} color={"white"} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.springify().delay(100)}
          className="h-[6vh] w-[6vh] justify-center items-center bg-white/20 rounded-md"
        >
          {status == "downloading" ? (
            <ActivityIndicator size={"large"} color={"white"} />
          ) : (
            <TouchableOpacity onPress={handleDownloadImage}>
              <Octicons name="download" size={24} color={"white"} />
            </TouchableOpacity>
          )}
        </Animated.View>
        <Animated.View
          entering={FadeInDown.springify().delay(200)}
          className="h-[6vh] w-[6vh] justify-center items-center bg-white/20 rounded-md"
        >
          {status == "sharing" ? (
            <ActivityIndicator size={"large"} color={"white"} />
          ) : (
            <TouchableOpacity onPress={handleShareImage}>
              <Entypo name="share" size={24} color={"white"} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
      <StatusBar style="light" />
    </BlurView>
  );
};

export default ImageViewingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.1)",
  },
});
