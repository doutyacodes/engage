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

const Posts = ({ item, user_id }) => {
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

  // console.log(user_id)
  const handleHeart = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/toggle-post-likes.php?page_id=${item.page_id}&post_id=${item.post_id}&user_id=${user_id}`
      );

      // console.log(response)
      if (response.status === 200) {
        if (heartActive) {
          setCount(count - 1);
        } else {
          setCount(count + 1);
        }
        setHeartActive(!heartActive);
        // console.log(response.data)
      } else {
        console.error("Failed to toggle likes");
      }
    } catch (error) {
      console.error("Error while toggling likes:", error.message);
    }
  };

  // console.log(item.created_at)
  return (
    <View style={styles.mainCard}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Moviehome", {
              movieId: item.page_id,
            })
          }
          style={styles.imgContainer}
        >
          
          <View className="rounded-full border border-slate-300 p-1">
            <Image
              source={{ uri: baseImgURL + item.page_icon }}
              className="w-[6vw] h-[6vw] "
              resizeMode="contain"
            />
          </View>
          <View style={{ gap: 3 }}>
            <View
              style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
            >
              <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.5) }}>
                {item.page_title}
              </Text>

              <Text
                style={{ fontSize: hp(1.5),fontFamily: "raleway"}}
                speed={50}
                marqueeOnStart={true}
                loop={true}
                delay={300}
                className="text-slate-500"
              >
                has added a post
              </Text>
            </View>
            <Text style={{ color: "gray", fontSize: hp(1.3),fontFamily:"raleway" }}>
              {formattedDate}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {item.image && item.image.length > 0 && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.image}`,
              aspectRatio: aspectRatio ? aspectRatio : null,
            })
          }
          className="border border-slate-200 my-2 rounded-md"
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
          />
        </View>
      )}
      {item.textData && item.textData.length > 0 && (
        <TouchableOpacity
          style={{ minHeight: hp(20) }}
          onPress={toggleDescription}
        >
          <View>
            <Text
              style={{
                fontSize: item.textData.length > 140 ? 15 : 17,
                fontFamily: "raleway",
              }}
            >
              {showFullDescription ? (
                item.textData
              ) : (
                <>
                  {`${item.textData.slice(0, 140)}.. `}
                  <Text style={{ fontFamily: "raleway-bold" }}>
                    Read more...
                  </Text>
                </>
              )}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {item.caption && (
        <View style={{ marginTop: 15, marginBottom: 10 }}>
          <Text style={{ fontSize: hp(1.8), fontFamily: "raleway-semibold" }}>
            {item.caption}
          </Text>
        </View>
      )}
      <View>
        <View style={{ flexDirection: "row", gap: 15,justifyContent:"space-between" }}>
          <View style={{ flexDirection: "row", gap: 5,flex:1 }}>
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
              <Text style={{ color: "gray" ,fontFamily: "raleway"}}>
                {count == 1 || count == 0 ? " Like" : " Likes"}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CommentPost", {
                user_id: user_id,
                item: item,
              })
            }
            style={{ flexDirection: "row", gap: 5 ,flex:1}}
          >
            <FontAwesome5 name="comment" size={20} color="black" />
            <Text style={{fontFamily: "raleway"}}>{item.comment_count} Comments</Text>
          </TouchableOpacity>
          <View style={{ flex:1}} />

        </View>
      </View>
    </View>
  );
};

export default Posts;

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
