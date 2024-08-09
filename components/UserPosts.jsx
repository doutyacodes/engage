import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import { Video, ResizeMode } from "expo-av";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import moment from "moment";
import MarqueeText from "react-native-marquee";

const UserPosts = ({ item, user_id }) => {
  const [heartActive, setHeartActive] = useState(item.already_liked);
  const [count, setCount] = useState(parseInt(item.like_count));
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);

  useEffect(() => {
    if (item.image) {
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
  }, [item.image]);
  const toggleDescription = () => {
    setShowFullDescription((prevDescription) => !prevDescription);
  };

  const formattedDate = moment(
    item.created_at,
    "DD-MM-YYYY HH:mm:ss"
  ).fromNow();

  const navigation = useNavigation();
  console.log(user_id);

  const handleHeart = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/toggle-post-likes.php?page_id=${item.page_id}&post_id=${item.post_id}&user_id=${user_id}`
      );

      if (response.status === 200) {
        if (heartActive) {
          setCount(count - 1);
        } else {
          setCount(count + 1);
        }
        setHeartActive(!heartActive);
      } else {
        console.error("Failed to toggle likes");
      }
    } catch (error) {
      console.error("Error while toggling likes:", error.message);
    }
  };

  return (
    <View style={styles.mainCard}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity disabled style={styles.imgContainer}>
          {item.user_image?.length > 0 ? (
            <Image
              style={{
                width: wp(10),
                height: wp(10),
                borderRadius: 50,
              }}
              source={{ uri: `${baseImgURL + item.user_image}` }}
            />
          ) : (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: wp(12),
                width: wp(12),
                backgroundColor: "#ff8f8e",
                borderRadius: 50,
              }}
            >
              <Text style={styles.avatarText}>{item.first_character}</Text>
            </TouchableOpacity>
          )}
          <View style={{ gap: 3 }}>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.5) }}>
                {item.name}
              </Text>

              <Text
                style={{ fontSize: hp(1.5),fontFamily: "raleway",width:150 }}
                speed={10}
                marqueeOnStart={true}
                
                loop={true}
                delay={500}
                className="text-slate-500"

              >
                has added a post
              </Text>
            </View>
            <Text style={{ color: "gray", fontSize: hp(1.3),fontFamily:"raleway" }}>
              {item.date}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="space-x-3"
      >
        {item.image && item.image.length > 0 && (
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
        )}
        {item.video && item.video.length > 0 && (
          <View style={{ height: hp(20) }}>
            <Video
              source={{ uri: `${baseVidUrl + item.video}` }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              useNativeControls
              isLooping
              onError={(error) => console.error("Video Error:", error)}
              onLoad={(status) => console.log("Video Loaded:", status)}
              onPlaybackStatusUpdate={(status) =>
                console.log("Playback Status:", status)
              }
            />
          </View>
        )}
        {item.textData &&
          item.textData.length > 0 &&
          !item.video &&
          !item.image && (
            <TouchableOpacity
              style={{ minHeight: hp(20), width: wp(88) }}
              onPress={toggleDescription}
            >
              <View>
                <Text
                  style={{
                    fontSize: hp(1.5),
                    fontFamily: "raleway",
                  }}
                  className=""
                >
                  {showFullDescription
                    ? item.textData
                    : `${item.textData.slice(0, 100)}...`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
      </ScrollView>
      {item.textData &&
        item.textData.length > 0 &&
        (item.video || item.image) && (
          <TouchableOpacity
            style={{ width: wp(88) }}
            onPress={toggleDescription}
          >
            <View>
              <Text
                style={{
                  fontSize: hp(1.5),
                  fontFamily: "raleway",
                }}
                className="mt-1"
              >
                {showFullDescription
                  ? item.textData
                  : `${item.textData.slice(0, 100)}...`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      <View>
        <View style={{ flexDirection: "row", gap: 15, marginTop: 13,justifyContent:"space-between" }}>
          <View style={{ flexDirection: "row", gap: 5, flex:1 }}>
            <TouchableOpacity
              onPress={handleHeart}
              style={{ ...styles.caption }}
            >
              {heartActive ? (
                <FontAwesome name="heart" size={20} color="red" />
              ) : (
                <FontAwesome5 name="heart" size={20} color="black" />
              )}
            </TouchableOpacity>
            <Text>
              {count >= 1 ? count : ""}
              <Text style={{ color: "gray",fontFamily: "raleway" }}>
                {count == 1 || count == 0 ? " Like" : " Likes"}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CommentUser", {
                user_id: user_id,
                item: item,
              })
            }
            style={{ flexDirection: "row", flex:1,gap: 5 ,fontFamily: "raleway"}}
          >
            <FontAwesome5 name="comment" size={20} color="black" />
            <Text  style={{fontFamily: "raleway"}}>{item.comment_count} Comments</Text>
          </TouchableOpacity>
          <View style={{ flex:1}} />
        </View>
      </View>
    </View>
  );
};

export default UserPosts;

const styles = StyleSheet.create({
  mainCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  image: {
    height: hp(20), // Adjust the height of the image as needed
    width: wp(88),
    borderRadius: 13,
  },
  icon: {
    height: wp(10),
    width: wp(10),
    borderRadius: 50,
  },
  imgContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flex: 1,
  },
  video: {
    height: hp(20), // Adjust the height of the image as needed
    width: wp(88),
    borderRadius: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
