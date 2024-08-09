import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "react-native-paper";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import CertificateCard from "./CertificateCard";
import { Video, ResizeMode } from "expo-av";
import Toast from "react-native-toast-message";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
const CertificateList = ({ item, user_id, singleData = null }) => {
  const [heartActive, setHeartActive] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [count, setCount] = useState(parseInt(item.like_count));
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [visitingPageId, setVisitingPageId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [challenge, setChallenge] = useState([]);
  const navigation = useNavigation();

  // console.log(item)
  // console.log(item.challenge_id);
  // console.log("people_data_id",item.people_data_id);
  // console.log(user_id);
  useEffect(() => {
    const fetchLike = async () => {
      try {
        // Only fetch rewards if user data is available
        if (!user_id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }
        const response = await axios.get(
          `${baseURL}/checkAlreadyLiked.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}`
        );
        // console.log(response.data);
        if (response.status === 200) {
          if (response.data.liked == "yes") {
            setHeartActive(true);
          }
          if (response.data.liked == "no") {
            setHeartActive(false);
          }
          setVisitingPageId(response.data.user_pageId);
        } else {
          console.error("Failed to fetch likes");
        }
      } catch (error) {
        console.error("Error while fetching likes:", error.message);
      }
    };

    const fetchMovie = async () => {
      try {
        if (!user_id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }

        const response = await axios.get(
          `${baseURL}/getOneChallenge.php?id=${item.page_id}&userId=${user_id}`
        );

        if (response.status === 200) {
          setSelectedMovie(response.data);
          // console.log(response.data);
        } else {
          console.error("Failed to fetch challenge");
        }
      } catch (error) {
        console.error("Error while fetching challenge:", error.message);
      }
    };
    // console.log(item.user_id)
    const fetchChallenge = async () => {
      try {
        if (!user_id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }

        const response = await axios.get(
          `${baseURL}/getChallengeOne.php?challenge_id=${item.challenge_id}&user_id=${user_id}`
        );

        if (response.status === 200) {
          setChallenge(response.data);
          // console.log(response.data);
        } else {
          console.error("Failed to fetch one challenge");
        }
      } catch (error) {
        console.error("Error while fetching one challenge:", error.message);
      }
    };

    if (item.page_id) {
      // fetchChallenge();
      // fetchMovie();
      // fetchLike();
    }
  }, [user_id]);

  const showAlertFunction = () => {
    setShowAlert(true);
  };

  const hideAlertFunction = () => {
    setShowAlert(false);
  };
  const handleReport = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/report-media.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}`
      );

      if (response.status === 200) {
        // console.log(response.data);
      } else {
        console.error("Failed to report media");
      }
    } catch (error) {
      console.error("Error while report media:", error.message);
    }
    setShowAlert(false);
  };
  const handleHeart = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/toggle-like.php?challenge_id=${item.challenge_id}&people_data_id=${item.people_data_id}&user_id=${user_id}&task_id=${item.task_id}&owner=${item.user_id}`
      );

      if (response.status === 200) {
        if (heartActive) {
          setCount(count - 1);
        } else {
          setCount(count + 1);
        }
        setHeartActive(!heartActive);
        // console.log(response.data);
      } else {
        console.error("Failed to toggle likes");
      }
    } catch (error) {
      console.error("Error while toggling likes:", error.message);
    }
  };
  // console.log(item);
  handleNavigation = () => {
    if (item.complete == "yes") {
      Toast.show({
        type: "info",
        text1: "Sorry",
        text2: `This challenge has expired.`,
      });
    }
    if (item.complete == "no") {
      navigation.navigate("Moviehome", {
        movieId: item.page_id,
        // challenge: challenge,
        // selectedMovie: selectedMovie,
      });
    }
  };
  // console.log(item)
  const MAX_TITLE_LENGTH = 30;
  const viewShotRef = useRef();

  //   console.log(imageLocation);
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
    <View
      style={{
        flex: 1,
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
      <View style={{ flexDirection: "row" }}>
        {item.page_id && (
          <View style={{ flex: 1, width: wp(90) }}>
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
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
                        width: wp(10),
                        height: wp(10),
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: "gray",
                      }}
                      source={{ uri: `${baseImgURL + item.user_image}` }}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {item.first_character}
                    </Text>
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
                <View style={styles.reportIcon}>
                  <TouchableOpacity onPress={() => setVisible(!visible)}>
                    <Entypo
                      name="dots-three-vertical"
                      size={22}
                      color="black"
                    />
                  </TouchableOpacity>
                  <View
                    className="absolute bg-white top-2 right-6 rounded-md shadow shadow-black/40 duration-200 transition-all"
                    style={{
                      width: wp(50),
                      display: visible ? "flex" : "none",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setVisible(false);
                        setShowAlert(true);
                      }}
                      className="p-3"
                    >
                      <Text className="font-[raleway-bold]">Report</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Text
                style={{ ...styles.caption, marginLeft: 10, marginBottom: 10 }}
              >
                {item.name} has completed {item.challenge_title} challenge
              </Text>
              <ScrollView
                style={[{ height: singleData ? hp(40) : null }]}
                horizontal
              >
                {/* {item.image && item.image?.length > 0 && (
                  <View style={{ minWidth: wp(84), marginRight: 10 }}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ImageViewingScreen", {
                          imageLocation: `${baseImgURL + item.image}`,
                        })
                      }
                      style={{ flex: 1 }}
                    >
                      <Image
                        style={styles.image}
                        source={{ uri: `${baseImgURL + item.image}` }}
                      />
                    </TouchableOpacity>
                  </View>
                )} */}
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    maxWidth: wp(90),
                  }}
                >
                  <ViewShot
                    ref={viewShotRef}
                    options={{ format: "png", quality: 1 }}
                    className="bg-white"
                  >
                    <CertificateCard item={item} />
                  </ViewShot>
                </View>
                {item.image2?.length > 0 &&
                  (item.mediaType == "video" ? (
                    <Video
                      source={{ uri: `${baseVidUrl + item.image2}` }}
                      style={{ width: wp(84), height: wp(84), marginLeft: 5 }}
                      resizeMode={ResizeMode.COVER}
                      useNativeControls
                      // isLooping
                    />
                  ) : (
                    <Image
                      style={styles.image}
                      source={{ uri: `${baseImgURL + item.image2}` }}
                    />
                  ))}
              </ScrollView>
              <View style={styles.captionContainer}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    marginLeft: 10,
                    marginBottom: 16,
                    marginTop: 10,
                  }}
                  onPress={handleNavigation}
                  className="rounded-full"
                >
                  <Image
                    source={{ uri: `${baseImgURL + item.icon}` }}
                    style={{
                      height: wp(9),
                      width: wp(9),
                      borderRadius: 7,
                      borderWidth: 1,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontSize: hp(1.7),
                      fontFamily: "raleway-semibold",
                    }}
                  >
                    {item.page_title} -{" "}
                    {item.challenge_title.length > 15
                      ? `${item.challenge_title.substring(0, 15)}...`
                      : item.challenge_title}
                  </Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", justifyContent:"space-between",padding:10 }}>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <TouchableOpacity
                      onPress={handleHeart}
                      style={{ ...styles.caption, marginLeft: 10 }}
                    >
                      {heartActive ? (
                        <FontAwesome name="heart" size={20} color="red" />
                      ) : (
                        <FontAwesome5 name="heart" size={20} color="black" />
                      )}
                    </TouchableOpacity>
                    <Text>{count} likes</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("CommentPeople", {
                        user_id: user_id,
                        item: item,
                      })
                    }
                    style={{ flexDirection: "row", gap: 5 }}
                  >
                    <FontAwesome5 name="comment" size={20} color="black" />
                    <Text>{item.comment_count} comments</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: "row", gap: 5 }}
                    onPress={onSaveImageAsync}
                  >
                    <Entypo name="share" size={20} color={"black"} />
                    <Text> share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
            <AwesomeAlert
              show={showAlert}
              showProgress={false}
              title="Report Image"
              message="Are you sure you want to report this image?"
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={true}
              showConfirmButton={true}
              cancelText="Cancel"
              confirmText="Report"
              confirmButtonColor="#DD6B55"
              onCancelPressed={() => hideAlertFunction()}
              onConfirmPressed={() => {
                handleReport();
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default CertificateList;

const styles = StyleSheet.create({
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
    height: wp(10),
    width: wp(10),
    backgroundColor: "#ff8f8e",
    borderRadius: 50,
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
  detailsContainer: {
    gap: 2,
  },
  name: {
    fontSize: hp(1.5),
    fontFamily: "raleway-bold",
  },
  date: {
    fontSize: hp(1.3),
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
    fontSize: hp(1.5),
    fontFamily: "raleway",
  },
});
