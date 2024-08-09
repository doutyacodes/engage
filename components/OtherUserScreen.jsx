import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";

import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import {
  Divider,
  ProgressBar,
  Provider,
  Tooltip,
  Switch,
} from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import BadgeListCard from "./BadgeListCard";
import CertificateList from "./CertificateList";
import TaskHomeCard from "./TaskHomeCard";
import CompletedChallenges from "./CompletedChallenges";
import SwiperFlatList from "react-native-swiper-flatlist";
import { BlurView } from "expo-blur";
import UserPosts from "./UserPosts";
import { Feather } from "@expo/vector-icons";
import AwesomeAlert from "react-native-awesome-alerts";
const OtherUserScreen = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]);
  const isFocused = useIsFocused();
  const { user_id } = route.params;
  const [reloadData, setReloadData] = useState(false);
  const [followersDetails, setFollowersDetails] = useState([]);
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [postUser, setPostUser] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [completedData, setCompletedData] = useState([]);
  const [completedVisit, setCompletedVisit] = useState([]);
  const [achieveData, setAchieveData] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState("second");
  const [followName, setFollowName] = useState("Follow");
  const [badgeData, setBadgeData] = useState([]);
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const onToggleSwitch = () => {
    setShowAlert(true);
  };

  useEffect(() => {
    // Log the active route index after it's updated
    console.log("Active Route Index updated:", activeRouteIndex);
  }, [activeRouteIndex]);
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const fetchUserAndFollow = async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          if (userString) {
            const userObject = JSON.parse(userString);
            setUser(userObject);
            fetchFollow(userObject);
          }
        } catch (error) {
          console.error(
            "Error fetching user from AsyncStorage:",
            error.message
          );
        }
      };

      fetchUserAndFollow();

      fetchFollow();
    }, [isFocused, reloadData])
  );

  useEffect(() => {
    const fetchCompletedChallenges = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/getCompletedChallenge.php?userId=${user_id}`
        );
        if (response.status === 200) {
          if (response.data.success) {
            setCompletedData(response.data.data.challenge);
            // console.log(response.data.data.challenge);
          } else {
            console.error(
              "Failed to fetch completed challenges: ",
              response.data.error
            );
          }
        } else {
          console.error(
            "Failed to fetch completed challenges: ",
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          "Error while fetching completed challenges: ",
          error.message
        );
      }
    };

    const fetchAchievements = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/getAchievementList.php?userId=${user_id}`
        );
        if (response.status === 200) {
          if (response.data.success) {
            setAchieveData(response.data.data.challenge);
          } else {
            console.error(
              "Failed to fetch achievements: ",
              response.data.error
            );
          }
        } else {
          console.error("Failed to fetch achievements: ", response.statusText);
        }
      } catch (error) {
        console.error("Error while fetching achievements: ", error.message);
      }
    };
    const fetchBadges = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/getAllBadges.php?user_id=${user.id}`
        );
        // console.log(response.data);

        setBadgeData(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error while fetching badges: ", error.message);
      }
    };
    // fetchBadges();
    fetchCompletedChallenges();
    fetchAchievements();
    const fetchTodo = async () => {
      if (user_id) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/getVisitedCompleted.php?user_id=${user_id}`
          );

          if (response.status === 200) {
            setCompletedVisit(response.data.tasks);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch progress");
          }
        } catch (error) {
          console.error("Error while fetching progress:", error.message);
        }
      }
    };

    fetchTodo();
  }, [user_id, reloadData]);
  const fetchFollow = async (user) => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/checkAlreadyFollowed.php?followed_user=${user.id}&user_id=${user_id}`
        );
        if (response.status === 200) {
          if (response.data.followed === "yes") {
            setIsFollowing(true);
          }
          if (response.data.followed === "no") {
            setIsFollowing(false);
          }
        } else {
          console.error("Failed to fetch following");
        }
      } catch (error) {
        console.error("Error while fetching following:", error.message);
      }
    }
  };
  useEffect(() => {
    const fetchPeople = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getOtherUser.php?user_id=${user_id}&other_user=${user.id}`
          );
          // console.log("other user",response.data);
          if (response.status === 200) {
            setUserData(response.data);
            setIsSwitchOn(
              response.data.account_status == "public" ? true : false
            );
            setCount(parseInt(response.data.followers));
            setItems(response.data.peopleCard);
            setPostUser(response.data.UserCard);
            setFollowName(response.data.follow_name);
          } else {
            console.error("Failed to fetch other");
          }
        } catch (error) {
          console.error("Error while fetching other:", error.message);
        } finally {
          setIsLoading(false); // Set isLoading to false after fetching data
        }
      }
    };

    fetchPeople();
    const fetchFollowed = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getFollowers.php?user_id=${user_id}&follow_user=${user.id}`
          );
          if (response.status === 200) {
            setFollowersDetails(response.data);
          } else {
            console.error("Failed to fetch following");
          }
        } catch (error) {
          console.error("Error while fetching following:", error.message);
        }
      }
    };
    fetchFollowed();
  }, [user, user_id]);
  const fetchAchievementData = async (userId, challengeId) => {
    if (user) {
      try {
        const response = await axios.post(
          `${baseURL}/achievementAdded.php`,
          {
            user_id: userId,
            challenge_id: challengeId,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 200) {
          if (response.data.success) {
            alert(response.data.message);
          } else {
            console.error(
              "Failed to process achievement:",
              response.data.error
            );
          }
        } else {
          console.error("Failed to process achievement:", response.statusText);
        }
      } catch (error) {
        console.error("Error processing achievement:", error.message);
      }
    }
    setReloadData((prevState) => !prevState);
  };
  const renderItems = ({ item, index }) => (
    <View style={{ height: hp(14), width: wp(85), marginRight: 10 }}>
      <CompletedChallenges
        item={item}
        index={index}
        currentUser={user.id}
        user_id={user_id}
        fetchAchievementData={fetchAchievementData}
      />
    </View>
  );

  const FirstRoute = () => {
    return (
      <ScrollView style={{ marginTop: 10, gap: 10, padding: 10 }}>
        {badgeData?.length > 0 && (
          <View
            style={{
              padding: 10,
              marginTop: 15,
              borderRadius: 12,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,

              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: hp(2),
                fontFamily: "raleway-bold",
                marginVertical: 10,
              }}
            >
              Badges
            </Text>
            <FlatList
              data={badgeData}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
              renderItem={({ item }) => {
                return <BadgeListCard item={item} />;
              }}
            />
          </View>
        )}
        {achieveData?.length > 0 && (
          <View
            style={{
              padding: 10,
              marginTop: 15,
              borderRadius: 12,
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.62,

              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: hp(2),
                fontFamily: "raleway-bold",
                marginVertical: 10,
              }}
            >
              Achievements
            </Text>
            <SwiperFlatList
              // autoplay
              // autoplayDelay={2}
              // autoplayLoop
              showPagination
              data={achieveData}
              renderItem={renderItems}
              horizontal // Ensure horizontal swiping
              // Pagination appearance customization:
              paginationDefaultColor="gray" // Change inactive dot color
              paginationActiveColor="gray" // Change active dot color
              paginationStyleItem={{
                width: 5, // Adjust individual dot width
                height: 5, // Adjust individual dot height
                borderRadius: 6, // Make dots round
                margin: 5,
                marginTop: 10, // Space between dots
              }}
              paginationStyleItemActive={{
                opacity: 1, // Ensure active dot is fully opaque
              }}
              paginationStyleItemInactive={{
                opacity: 0.5, // Give inactive dots a subtle transparency
              }} // Ensure horizontal swiping
            />
          </View>
        )}
      </ScrollView>
    );
  };
  const SecondRoute = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#e5e5e5" }}>
        {user && (
          <FlatList
            data={items}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.moviesContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={
              <View>
                <View style={{ height: 10 }} />
              </View>
            }
            renderItem={({ index, item }) => (
              <CertificateList
                item={item}
                index={index}
                user_id={user.id}
                arena={null}
              />
            )}
          />
        )}
      </View>
    );
  };
  const SecondRoute2 = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#e5e5e5" }}>
        {user && (
          <FlatList
            data={postUser}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.moviesContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={
              <View>
                <View style={{ height: 10 }} />
              </View>
            }
            renderItem={({ index, item }) => (
              <UserPosts
                item={item}
                index={index}
                user_id={user.id}
                arena={null}
              />
            )}
          />
        )}
      </View>
    );
  };
  const ThirdRoute = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#e5e5e5" }}>
        <FlatList
          data={completedVisit}
          keyExtractor={(item, index) => index}
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 10 }} />
            </View>
          }
          renderItem={({ index, item }) => <TaskHomeCard item={item} />}
        />
      </View>
    );
  };

  const FourthRoute = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#e5e5e5" }}>
        {user && (
          <FlatList
            data={completedData}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.moviesContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View key={index} style={{ padding: 10 }}>
                <CompletedChallenges
                  item={item}
                  index={index}
                  currentUser={user.id}
                  user_id={user_id}
                  fetchAchievementData={fetchAchievementData}
                />
              </View>
            )}
          />
        )}
      </View>
    );
  };

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    // { key: "first", title: "Overview", icon: "info-circle" },
    { key: "second", title: "Posts", icon: "list-alt" },
    { key: "fifth", title: "User Posts", icon: "list-alt" },
    // { key: "third", title: "Places", icon: "location-arrow" },
    { key: "fourth", title: "Challenges", icon: "check-circle-o" },
  ]);
  const renderContent = () => {
    switch (activeRouteIndex) {
      case "first":
        return <FirstRoute />;
      case "second":
        return <SecondRoute />;
      case "fifth":
        return <SecondRoute2 />;
      case "third":
        return <ThirdRoute />;
      case "fourth":
        return <FourthRoute />;
      default:
        return <FirstRoute />;
    }
  };
  const toggleFollow = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/toggle-user-follow.php?followed_user=${user.id}&user_id=${user_id}`
        );
        if (response.status === 200) {
          // console.log(count)
          if (userData.account_status == "public") {
            setCount((prevCount) => {
              if (isFollowing) {
                return prevCount - 1;
              } else {
                return prevCount + 1;
              }
            });
          }
          setIsFollowing(!isFollowing);
          if (followName == "Follow") {
            if (userData.account_status == "public") {
              setFollowName("Following");
            }
            if (userData.account_status == "private") {
              setFollowName("Requested");
            }
          }
          if (followName == "Requested") {
            setFollowName("Follow");
          }
          if (followName == "Following") {
            setFollowName("Follow");
          }
          if (followName == "Follow Back") {
            if (userData.account_status == "public") {
              setFollowName("Friends");
            }
            if (userData.account_status == "private") {
              setFollowName("Requested");
            }
          }
          if (followName == "Friends") {
            setFollowName("Follow Back");
          }
        } else {
          console.error("Failed to toggle followers");
        }
      } catch (error) {
        console.error("Error while toggling followers:", error.message);
      }
    }
  };
  const toggleAccount = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/toggle-account.php?user_id=${user.id}`
        );
        if (response.status === 200) {
          // console.log(response.data)
          setIsSwitchOn((prevIsSwitchOn) => !prevIsSwitchOn);
          setShowAlert(false);
        } else {
          console.error("Failed to toggle account status");
        }
      } catch (error) {
        console.error("Error while toggling account status:", error.message);
      }
    }
  };
  return (
    <Provider style={{ flex: 1 }}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ position: "relative" }}>
            <LinearGradient
              // Background Linear Gradient
              colors={["#37789C", "#8B2C4E"]}
              style={styles.LinearGradient}
              start={[0, 0]}
              end={[1, 0]}
              locations={[0.05, 1]} // Set the locations to define where each color starts and ends
            />

            <View style={{ padding: 15, marginTop: 25 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <View>
                    <View
                      style={{
                        padding: 3,
                        backgroundColor: "orange",
                        borderRadius: 120,
                      }}
                    >
                      <Tooltip
                        backgroundColor
                        title="Login Streak"
                        theme={{
                          colors: { primary: "blue" },
                          backgroundColor: "red",
                        }}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            height: wp(20),
                            width: wp(20),
                            backgroundColor: "#ff8f8e",
                            borderRadius: 50,
                            position: "relative",
                          }}
                        >
                          {userData.user_image?.length > 0 ? (
                            <Image
                              source={{
                                uri: `${baseImgURL + userData.user_image}`,
                              }}
                              style={{
                                width: wp(20),
                                height: wp(20),
                                borderRadius: 50,
                              }}
                            />
                          ) : (
                            <Text
                              style={{
                                fontFamily: "raleway-bold",
                                color: "white",
                                fontSize: wp(7),
                              }}
                            >
                              {userData.first_character}
                            </Text>
                          )}
                          {userData.streak_day == "yes" && (
                            <View
                              style={{
                                position: "absolute",
                                bottom: 8,
                                right: 0,
                              }}
                            >
                              <LottieView
                                source={require("../assets/animation/fire.json")}
                                style={{ width: 20, height: 20 }}
                                autoPlay
                                loop
                              />
                            </View>
                          )}
                        </View>
                      </Tooltip>
                    </View>
                  </View>
                  <View style={{ gap: wp(1.6) }}>
                    <Text
                      style={{
                        fontSize: hp(2.2),
                        fontFamily: "raleway-bold",
                        color: "white",
                      }}
                    >
                      {userData.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: hp(1.7),
                        fontFamily: "raleway",
                        color: "white",
                      }}
                    >
                      {userData.designation}
                    </Text>
                  </View>
                </View>
                <View style={{ gap: wp(8) }}>
                  <Image
                    source={require("../assets/images/vip.png")}
                    style={{
                      minWidth: wp(5),
                      minHeight: wp(3),
                      maxHeight: wp(4),
                      maxWidth: wp(6),
                    }}
                  />
                  {user.id == user_id && (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("EditProfile", {
                          user_id: user.id,
                        })
                      }
                    >
                      <FontAwesome name="edit" size={22} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            {user.id == user_id && (
              <View
                style={{
                  paddingHorizontal: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <Feather name="lock" size={20} color={"white"} />
                  <Text
                    style={{
                      fontSize: hp(1.8),
                      color: "white",
                      fontFamily: "raleway",
                    }}
                  >
                    Anybody can follow
                  </Text>
                </View>
                <Switch
                  value={isSwitchOn}
                  onValueChange={onToggleSwitch}
                  color="green"
                />
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 10,
              }}
            >
              <View style={styles.profile_info}>
                <Text style={styles.profileCount}>
                  {userData.friends_count}
                </Text>
                <Text style={styles.profileText}>Friends</Text>
              </View>
              <Divider
                style={{ height: "auto", width: 1, backgroundColor: "#AFAFAF" }}
              />
              <View style={styles.profile_info}>
                <Text style={styles.profileCount}>{userData.following}</Text>
                <Text style={styles.profileText}>Following</Text>
              </View>
              <Divider
                style={{ height: "auto", width: 1, backgroundColor: "#AFAFAF" }}
              />
              <View style={styles.profile_info}>
                <Text style={styles.profileCount}>{count}</Text>
                <Text style={styles.profileText}>Followers</Text>
              </View>
            </View>
            {/* {(userData.account_status == "public" ||
              (followName != "Follow" && followName != "Requested") ||
              user_id == user?.id) && (
              <View style={{ marginBottom: 15 }}>
                <View
                  style={{
                    paddingHorizontal: 15,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={styles.Xp}>{userData.this_level_xp} Xp</Text>
                  <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      color: "white",
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {userData.total_xp} Xp
                  </Text>
                  <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                  <Text style={styles.Xp}>{userData.next_level_xp} Xp</Text>
                </View>
                <View
                  style={{
                    padding: 15,
                  }}
                >
                  <ProgressBar
                    progress={userData.progress}
                    style={{ height: 10, borderRadius: 10 }}
                    color="#285284"
                  />
                </View>
                <View
                  style={{
                    paddingHorizontal: 15,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={styles.Xp}>Level {userData.level}</Text>
                  <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                  <Text style={styles.Xp}>Level {userData.next_level}</Text>
                </View>
              </View>
            )} */}
            {user && user.id != user_id && (
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 25,
                    backgroundColor: "#0195f7",
                    borderRadius: 12,
                  }}
                  onPress={toggleFollow}
                >
                  <Text
                    style={{
                      fontSize: hp(1.8),
                      color: "white",
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {followName}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <BlurView
              intensity={50}
              tint="dark"
              style={{
                overflow: "hidden",
              }}
            >
              {(userData.account_status == "public" ||
                (followName != "Follow" && followName != "Requested") ||
                user_id == user?.id) && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {routes.map((route, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={{ padding: 20, width: wp(33.33) }}
                      >
                        <Text
                          style={{
                            fontSize: hp(1.6),
                            color: "white",
                            textAlign: "center",
                            fontFamily:
                              activeRouteIndex === route.key
                                ? "raleway-bold"
                                : "raleway",

                            textTransform:
                              activeRouteIndex === route.key
                                ? "uppercase"
                                : "none",
                          }}
                          onPress={() => setActiveRouteIndex(route.key)}
                        >
                          {route.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </BlurView>
          </View>
          {/* Area to render View */}
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title={"Change Account Status"}
            message={"Do you want to change your status?"}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Cancel"
            confirmText={"Yes"}
            confirmButtonColor="#DD6B55"
            onCancelPressed={() => setShowAlert(false)}
            onConfirmPressed={() => {
              toggleAccount();
            }}
          />
          {(userData.account_status == "public" ||
            (followName != "Follow" && followName != "Requested") ||
            user_id == user?.id) &&
            renderContent()}
        </View>
      )}
      <StatusBar style={isLoading ? "dark" : "light"} />
    </Provider>
  );
};

export default OtherUserScreen;

const styles = StyleSheet.create({
  LinearGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // minHeight:hp(35)
  },
  profile_info: {
    gap: wp(4),
    alignItems: "center",
  },
  profileCount: {
    fontSize: hp(2),
    color: "white",
    fontFamily: "raleway-bold",
  },
  profileText: {
    fontSize: hp(1.8),
    color: "white",
    fontFamily: "raleway-semibold",
  },
  Xp: {
    fontSize: hp(1.8),
    color: "white",
    fontFamily: "raleway-bold",
  },
});
