// TaskDetails.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome,Feather,Ionicons } from "@expo/vector-icons";

import wowfy_black from "../assets/logos/wowfy_black.png";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import TopBar from "./AppComponents/TopBar";

const TaskDetails = ({ route }) => {
  const navigation = useNavigation();
  const { challenge } = route.params;
// console.log(challenge.challenge_id);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const isFocused = useIsFocused();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          navigation.navigate("OtpVerification")
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // console.log(isFocused);  // Add this line to check the value
      const fetchTask = async () => {
        try {
          setLoading(true); // Set loading to true before making the request

          const response = await axios.get(
            `${baseURL}/getOneTasks.php?challenge_id=${challenge.challenge_id}&task_id=${challenge.task_id}`
          );

          if (response.status === 200) {
            // console.log(response.data);
            setTasks(response.data);
          } else {
            console.error("Failed to fetch getOneTasks");
          }
        } catch (error) {
          console.error("Error while fetching getOneTasks:", error.message);
        } finally {
          setLoading(false); // Set loading to false after the request, whether it succeeded or failed
        }
      };

      fetchTask();
    }, [isFocused])
  );

  // console.log(tasks);
  return (
    <View style={styles.container}>
                 <TopBar  user={user}   />

      

      <View style={styles.movieInfoContainer}>
        {/* Section with image, title, and icons */}
        <View style={styles.movieDetailsContainer}>
          <Image
            source={{ uri: `${baseImgURL + tasks?.image}` }}
            style={styles.movieImage}
          />
          <View style={styles.titleInfo}>
            <Text style={styles.title}>{tasks?.challenge_title?.length > 15
                  ? `${tasks?.challenge_title.substring(0, 15)}...`
                  : tasks?.challenge_title}</Text>
          </View>
          <TouchableOpacity style={styles.titleIcon}>
            <FontAwesome name="bars" size={25} color="black" />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{textAlign:"center",fontSize:hp(1.9),fontStyle:"italic",fontWeight:"500"}}>{tasks?.task_name}</Text>
        </View>
        {/* Section with followers, follow button, and points */}
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Card style={styles.CardContainer}>
          <ScrollView>
            <View style={styles.ContainerDetails}>
              <Text style={styles.CardTitle}>{tasks?.task_name}</Text>
              <Text style={styles.descriptionHead}>Disclaimer</Text>
              <Text style={styles.description}>{tasks?.description}</Text>
            </View>
          </ScrollView>
        </Card>
      )}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("VideoScreen", {
            pageId: challenge.id,
            challenge: challenge,
            tasks: tasks,
            userSId: user?.id,
          })
        }
        style={styles.acceptBtn}
      >
        <Text style={styles.acceptText}>ACCEPT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
  CardTitle: {
    marginVertical: 40,
    fontSize: hp(4),
    fontFamily: "raleway-bold",
    fontStyle: "italic",
  },
  entry_points: {
    marginBottom: 20,
    fontSize: hp(2),
    fontFamily: "raleway-bold",
  },

  acceptText: {
    fontSize: hp(2.2),
    color: "white",
    fontFamily: "raleway-bold",
  },
  reward_points: {
    marginBottom: 40,
    fontSize: hp(2.5),
    fontFamily: "raleway-bold",
  },

  ContainerDetails: {
    flex: 1,
    padding: 10,
  },
  acceptBtn: {
    backgroundColor: "#E32636",
    padding: 10,
    borderRadius: 10,
    width: wp(90),
    alignItems: "center",
    marginTop: "auto",
    position: "absolute",
    bottom: 25,
  },
  CardContainer: {
    flex: 1,
    width: wp(95),
    marginTop: 10,
  },
  descriptionHead: {
    fontSize: hp(2),
    lineHeight: 18,
    fontFamily: "raleway-bold",
  },
  description: {
    fontSize: hp(1.7),
    lineHeight: 21,
    color: "gray",
    marginTop: 10,
    fontFamily: "raleway"
  },
  optionsContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    marginHorizontal: 5,
    paddingHorizontal: 15,
  },
  selectedOption: {
    backgroundColor: "lightblue",
  },
  topLogo: {
    height: 50,
    width: 50,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "lightgrey",
    borderRadius: 20,
    padding: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
  },
  settingsIcon: {
    padding: 0,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  movieDetailsContainer: {
    width: "90%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10,
  },
  FollowPoints: {
    gap: 5,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "raleway-bold",
    marginLeft: 10,
  },
  titleInfo: {
    flexDirection: "row",
    // alignItems: 'center',
    marginTop: 15,
  },
  titleIcon: {
    marginTop: 15,
    // marginLeft: 85,
    left: 10,
  },
  followButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#E32636",
    borderRadius: 18,
  },
  movieImage: {
    width: 50,
    height: 60,
    borderRadius: 5,
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  backIcon: {
    paddingRight: 10,
  },
  movieInfoContainer: {
    borderColor: "lightgrey",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    paddingTop: 5,
    paddingBottom: 10,
    width: "95%",
    marginTop: 7,
  },
  followersText: {
    fontSize: 14,
  },
  boldCount: {
    fontFamily: "raleway-bold",
  },
  pointsText: {
    fontSize: 14,
  },
});

export default TaskDetails;
