import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useState } from "react";
import { Card } from "react-native-paper";
import { baseImgURL, baseURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Octicons } from "@expo/vector-icons";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import axios from "axios";

const PeopleCard = ({ item, user_id }) => {
  const [heartActive, setHeartActive] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [count, setCount] = useState(parseInt(item.like_count));
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [visitingPageId, setVisitingPageId] = useState(null);
  const [challenge, setChallenge] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
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
  // console.log(item.image)

  useFocusEffect(
    useCallback(() => {
      const fetchLike = async () => {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/checkAlreadyLiked.php?challenge_id=${item.challenge_id}&people_id=${item.id}&user_id=${user_id}`
          );
          // console.log(response.data)
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

      fetchLike();
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
            console.error("Failed to fetch getOneChallenge");
          }
        } catch (error) {
          console.error("Error while fetching getOneChallenge:", error.message);
        }
      };

      fetchMovie();
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
            console.error("Failed to fetch getChallengeOne");
          }
        } catch (error) {
          console.error("Error while fetching getChallengeOne:", error.message);
        }
      };

      fetchChallenge();
    }, [isFocused])
  );

  const showAlertFunction = () => {
    setShowAlert(true);
  };

  const hideAlertFunction = () => {
    setShowAlert(false);
  };
  const handleReport = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/report-media.php?challenge_id=${item.challenge_id}&people_id=${item.id}&user_id=${user_id}`
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
        `${baseURL}/toggle-like.php?challenge_id=${item.challenge_id}&people_id=${item.id}&user_id=${user_id}`
      );

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
  // console.log(item);
  handleNavigation = () => {
    if (item.complete == "yes") {
      navigation.navigate("Moviehome", {
        movieId: item.page_id,
      });
    }
    if (item.complete == "no") {
      navigation.navigate("ChallengeDetails", {
        pageId: item.page_id,
        challenge: challenge,
        selectedMovie: selectedMovie,
      });
    }
  };
  return (
    <View>
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
                style={{ width: wp(15), height: wp(15), borderRadius: 50 }}
                source={{ uri: `${baseImgURL + item.user_image}` }}
              />
            ) : (
              <Text style={styles.avatarText}>{item.first_character}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (item.page_id == visitingPageId) {
                navigation.navigate("OtherUserScreen", {
                  user_id: item.user_id,
                });
              }
            }}
            style={styles.detailsContainer}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportIcon}
            onPress={showAlertFunction}
          >
            <Octicons name="report" size={24} color="red" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ImageViewingScreen", {
              imageLocation: `${baseImgURL + item.image}`,
              aspectRatio: aspectRatio ? aspectRatio : null,
            })
          }
        >
          <Image
            style={styles.image}
            source={{ uri: `${baseImgURL + item.image}` }}
          />
        </TouchableOpacity>
        <View style={styles.captionContainer}>
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
            <Text>{count >= 1 ? count : ""}</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              marginLeft: 10,
              marginTop: 10,
            }}
            // onPress={handleNavigation}
          >
            <Image
              source={{ uri: `${baseImgURL + item.icon}` }}
              style={{ height: wp(9), width: wp(9), borderRadius: 7 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: hp(1.7), fontFamily: "raleway-semibold" }}>
              {item.page_title} - {item.challenge_title}
            </Text>
          </TouchableOpacity>
          <Text style={{ ...styles.caption, marginLeft: 10, marginTop: 10 }}>
            has completed {item.challenge_title} challenge
          </Text>
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
  );
};

export default PeopleCard;

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
  },
  reportIcon: {
    marginLeft: "auto",
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
