import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { baseImgURL } from "../../backend/baseData";
import MarqueeText from "react-native-marquee";
import { useNavigation } from "@react-navigation/native";

const GreetingsComponent = ({ item }) => {
  const formattedDate = moment(item.date, "DD-MM-YYYY HH:mm:ss").fromNow();
  const navigation = useNavigation();
  const [aspectRatio, setAspectRatio] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const toggleDescription = () => {
    setShowFullDescription((prevDescription) => !prevDescription);
  };
  useEffect(() => {
    if (item.image && item.image.length > 0) {
      Image.getSize(
        `${baseImgURL + item.image}`,
        (width, height) => {
          setAspectRatio(width / height);
        },
        (error) => {
          console.error("Failed to get image size", error);
        }
      );
    }
    if (item.type == "stars") {
      Image.getSize(
        `${baseImgURL + item.stars}`,
        (width, height) => {
          setAspectRatio(width / height);
        },
        (error) => {
          console.error("Failed to get image size", error);
        }
      );
    }
    if (item.type == "applause") {
      Image.getSize(
        `${baseImgURL + item.applause}`,
        (width, height) => {
          setAspectRatio(width / height);
        },
        (error) => {
          console.error("Failed to get image size", error);
        }
      );
    }
  }, [item.image]);
  useEffect(() => {
    if (item.description?.length > 140) {
      setShowFullDescription(true);
    }
  }, [item.description]);
  return (
    <View style={styles.mainCard}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginBottom: 10,
        }}
      >
        {item.sender_image?.length > 0 ? (
          <Image
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: 50,
            }}
            source={{ uri: `${baseImgURL + item.sender_image}` }}
          />
        ) : (
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: wp(10),
              width: wp(10),
              backgroundColor: "#ff8f8e",
              borderRadius: 50,
            }}
          >
            <Text style={styles.avatarText}>{item.first_character}</Text>
          </TouchableOpacity>
        )}
        <View style={{ gap: 3 }}>
          <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.5) }}>
              {item.sender_name}
            </Text>

            <Text style={{ fontFamily: "raleway" }}>
              has given{item.type == "applause" ? " an applause " : " a star "}
              to{" "}
              <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.5) }}>
                {item.receiver_name}
              </Text>
            </Text>
          </View>
          <Text
            style={{ color: "gray", fontSize: hp(1.3), fontFamily: "raleway" }}
            className="text-slate-500"
          >
            {formattedDate}
          </Text>
        </View>
      </View>
      {item.image && item.image.length > 0 ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.image}`,
              aspectRatio: aspectRatio ? aspectRatio : null,
            })
          }
        >
          <Image
            source={{ uri: `${baseImgURL + item.image}` }}
            style={styles.image}
          />
        </TouchableOpacity>
      ) : item.type == "stars" ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.stars}`,
              aspectRatio: aspectRatio ? aspectRatio : null,
            })
          }
        >
          <Image
            source={{ uri: `${baseImgURL + item.stars}` }}
            style={styles.image}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.applause}`,
              aspectRatio: aspectRatio ? aspectRatio : null,
            })
          }
        >
          <Image
            source={{ uri: `${baseImgURL + item.applause}` }}
            style={styles.image}
          />
        </TouchableOpacity>
      )}
      {item.description && item.description.length > 0 && (
        <TouchableOpacity style={{ marginTop: 10 }} onPress={toggleDescription}>
          <View>
            <Text
              style={{
                fontSize: hp(1.5),
                fontFamily: "raleway",
              }}
            >
              {showFullDescription ? (
                item.description
              ) : (
                <>
                  {`${item.description.slice(0, 140)}.. `}
                  <Text style={{ fontFamily: "raleway-bold" }}>
                    Read more...
                  </Text>
                </>
              )}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GreetingsComponent;
const styles = StyleSheet.create({
  mainCard: {
    flex: 1,
    maxHeight: hp(40),
    padding: 15,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    // marginTop: 12,
  },
  image: {
    height: hp(20), // Adjust the height of the image as needed
    width: "100%",
    borderRadius: 13,
  },
  icon: {
    height: wp(10),
    width: wp(10),
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "gray",
  },
  imgContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
    borderRadius: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
