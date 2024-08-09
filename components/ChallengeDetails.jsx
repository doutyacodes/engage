// ChallengeDetails.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Video, ResizeMode } from "expo-av";

import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import wowfy_white from "../assets/logos/wowfy_white.png";
import axios from "axios";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Entypo, Feather } from "@expo/vector-icons";
import {
  Modal,
  PaperProvider,
  Portal,
  RadioButton,
} from "react-native-paper";

import CertificateList from "./CertificateList";
import TopBar from "./AppComponents/TopBar";

const ChallengeDetails = ({ route }) => {
  const navigation = useNavigation();
  const { challenge, completeOne = null } = route.params;
  // console.log(challenge)
  // alert(completeOne)
  // console.log(challenge);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [peopleData, setPeopleData] = useState([]);
  const [checked, setChecked] = useState("latest");
  const [checked2, setChecked2] = useState("latest");
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [leaderData, setLeaderData] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [tasks, setTasks] = useState();
  const [rewards, setRewards] = useState([]);
  const [singleTaskId, setSingleTaskId] = useState(null);
  const [DATA, setDATA] = useState([]);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const showModal2 = () => setVisible2(true);
  const hideModal2 = () => setVisible2(false);

  const changeModal = (value) => {
    setChecked(value);
    hideModal();
  };
  const changeModal2 = (value) => {
    setChecked2(value);
    hideModal2();
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser)
        } else {
          navigation.navigate("OtpVerification");
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchLeader = async () => {
        let urlData = "getLeaderData";
        if (challenge.frequency == "contest") {
          urlData = "getLeaderContest";
        }
        try {
          const response = await axios.get(
            `${baseURL}/${urlData}.php?challenge_id=${challenge.challenge_id}`
          );

          if (response.status === 200) {
            setLeaderData(response.data.challenges);
            // console.log(response.data.challenges);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch getLeaderContest");
          }
        } catch (error) {
          console.error("Error while fetching getLeaderContest:", error.message);
        }
      };

      fetchLeader();
      // console.log(challenge.task_id)
      const fetchSingleTask = async () => {
        try {
          const response = await axios.get(
            `${baseURL}/getOneTaskId.php?challenge_id=${challenge.challenge_id}`
          );
          // console.log(response.data.task_id);
          if (response.status === 200) {
            // console.log(response.data);
            setSingleTaskId(response.data);
          } else {
            console.error("Failed to fetch singleTask");
          }
        } catch (error) {
          console.error("Error while fetching singleTask:", error.message);
        }
      };
      fetchSingleTask();
      const fetchTask = async () => {
        if (singleTaskId?.task_id) {
          try {
            const response = await axios.get(
              `${baseURL}/getOneTasks.php?challenge_id=${challenge.challenge_id}&task_id=${singleTaskId.task_id}`
            );
            // console.log(response.data.task_id);

            if (response.status === 200) {
              // console.log(response.data);
              setTasks(response.data);
            } else {
              console.error("Failed to fetch getOneTasks");
            }
          } catch (error) {
            console.error("Error while fetching getOneTasks:", error.message);
          }
        }
      };
      if (challenge.visit == "yes" && singleTaskId?.task_id) {
        fetchTask();
      }
      const fetchData = async () => {
        try {
          if (!user || !user.id) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }

          setIsLoading(true); // Set isLoading to true before fetching data
// console.log(challenge)
          const movieResponse = await axios.get(
            `${baseURL}/getDetailsInnerpage.php?challenge_id=${challenge.challenge_id}&userId=${user.id}`
          );

          // console.log(movieResponse.data);
          setSelectedMovie(movieResponse.data);
        } catch (error) {
          console.error("Error while fetching data:", error.message);
        } finally {
          setIsLoading(false); // Set isLoading to false if an error occurs
        }
      };
      fetchData();
      const fetchRewards = async () => {
        try {
          if (challenge.rewards == "no" || !challenge) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }
          // console.log(challenge_id)
          // console.log(challenge.page_id)
          const response = await axios.get(
            `${baseURL}/getRewards.php?challenge_id=${challenge.challenge_id}`
          );
          // console.log(response.data);

          if (response.status === 200) {
            setRewards(response.data);

            // console.log(response.data);
          } else {
            console.error("Failed to fetch rewards");
          }
        } catch (error) {
          console.error("Error while fetching rewards:", error.message);
        }
      };

      fetchRewards();
    }, [isFocused, user])
  );
  // const leaderData = [
  //   {
  //     ranking: 1,
  //     first_character: "A",
  //     name: "John Doe",
  //     time_spent: "2 hours",
  //     points: 100,
  //   },
  //   {
  //     ranking: 2,
  //     first_character: "B",
  //     name: "Jane Smith",
  //     time_spent: "3 hours",
  //     points: 90,
  //   },
  //   {
  //     ranking: 3,
  //     first_character: "C",
  //     name: "Alice Johnson",
  //     time_spent: "1.5 hours",
  //     points: 80,
  //   },
  //   {
  //     ranking: 4,
  //     first_character: "D",
  //     name: "Bob Brown",
  //     time_spent: "4 hours",
  //     points: 70,
  //   },
  //   {
  //     ranking: 5,
  //     first_character: "E",
  //     name: "Emily Davis",
  //     time_spent: "2.5 hours",
  //     points: 60,
  //   },
  //   // Add more dummy data as needed
  // ];

  // console.log(challenge.visit);
  // console.log(singleTaskId.task_id);
  const handleNext = () => {
    if (
      (challenge.visit == "yes" || challenge.single_task == "yes") &&
      singleTaskId?.task_id
    ) {
      navigation.navigate("VideoScreen", {
        tasks: singleTaskId,
        pageId: challenge.page_id,
        challenge: challenge,
        userSId: user.id,
      });
    } else {
      navigation.navigate("ChallengesList", {
        pageId: challenge.challenge_id,
        selectedMovie: selectedMovie,
        challenge: challenge,
      });
    }
  };
  // console.log(tasks)
  const FirstRoute = () => (
    <ScrollView>
      <View style={styles.ContainerDetails}>
        <Text style={styles.CardTitle}>{challenge.title}</Text>
        <Text style={styles.descriptionHead}>Description</Text>
        <Text style={styles.description}>{challenge.description}</Text>
        <View
          style={{
            backgroundColor: "#e5e5e5",
            padding: 10,
            marginTop: 40,
            borderRadius: 12,
            minHeight: hp(8),
          }}
        >
          <Text style={styles.entry_points}>ENTRY FEE : </Text>
          <Text style={styles.entry_points2}>
            {challenge.entry_points == 0
              ? "Nill"
              : challenge.entry_points + "Points"}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#e5e5e5",
            padding: 10,
            marginTop: 40,
            borderRadius: 12,
            minHeight: hp(8),
          }}
        >
          <Text style={styles.reward_points}>PRIZE :</Text>
          <Text style={styles.reward_points2}>{challenge.reward_points}</Text>
        </View>
      </View>
      <View style={{ padding: 15 }}>
        <Text style={styles.CardTitle}>{rewards?.title}</Text>

        <Text style={[styles.descriptionHead, { marginTop: 15 }]}>
          Description
        </Text>
        <Text style={[styles.description]}>{rewards?.description}</Text>
      </View>
    </ScrollView>
  );

  const SecondRoute = () => (
    <PaperProvider style={{ flex: 1, backgroundColor: "white" }}>
      {peopleData.length > 0 && (
        <View style={{ minHeight: hp(2), padding: 10, position: "relative" }}>
          <TouchableOpacity style={{ marginLeft: "auto" }} onPress={showModal}>
            <Entypo name="dots-three-vertical" size={19} color="black" />
          </TouchableOpacity>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={styles.containerStyle}
            >
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <RadioButton
                  value="latest"
                  status={checked === "latest" ? "checked" : "unchecked"}
                  onPress={() => changeModal("latest")}
                />
                <Text style={{ fontSize: hp(1.8) }}>Sort by Latest</Text>
              </View>
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                <RadioButton
                  value="likes"
                  status={checked === "likes" ? "checked" : "unchecked"}
                  onPress={() => changeModal("likes")}
                />
                <Text style={{ fontSize: hp(1.8) }}>Sort by Most Likes</Text>
              </View>
            </Modal>
          </Portal>
        </View>
      )}
      <FlatList
        data={peopleData}
        keyExtractor={(item, index) => index}
        contentContainerStyle={styles.moviesContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 10 }} />
          </View>
        }
        renderItem={({ index, item }) => (
          <CertificateList
            key={index}
            item={item}
            index={index}
            user_id={user.id}
            arena={null}
          />
        )}
      />
    </PaperProvider>
  );

  const ThirdRoute = () => {
    return (
      <PaperProvider style={{ flex: 1, backgroundColor: "white" }}>
        {DATA.length > 0 && (
          <View style={{ minHeight: hp(2), padding: 10, position: "relative" }}>
            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              onPress={showModal2}
            >
              <Entypo name="dots-three-vertical" size={19} color="black" />
            </TouchableOpacity>
            <Portal>
              <Modal
                visible={visible2}
                onDismiss={hideModal2}
                contentContainerStyle={styles.containerStyle}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <RadioButton
                    value="latest"
                    status={checked2 === "latest" ? "checked" : "unchecked"}
                    onPress={() => changeModal2("latest")}
                  />
                  <Text style={{ fontSize: hp(1.8) }}>Sort by Latest</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <RadioButton
                    value="likes"
                    status={checked2 === "likes" ? "checked" : "unchecked"}
                    onPress={() => changeModal2("likes")}
                  />
                  <Text style={{ fontSize: hp(1.8) }}>Sort by Most Likes</Text>
                </View>
              </Modal>
            </Portal>
          </View>
        )}
        <FlatList
          data={DATA}
          numColumns={3}
          keyExtractor={(item, index) => index}
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 1 }} />
            </View>
          }
          renderItem={({ index, item }) => (
            <View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ImageList", {
                    indexNumber: index,
                    challenge_id: challenge.challenge_id,
                    sort: checked2,
                  })
                }
                style={{
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: "white",
                }}
              >
                {item.type == "video" ? (
                  <View style={{ height: hp(20) }}>
                    <Video
                      source={{ uri: `${baseVidUrl + item.media_path}` }}
                      style={{ width: wp(30), height: wp(30) }}
                      resizeMode={ResizeMode.COVER}
                      // useNativeControls
                      // isLooping
                    />
                  </View>
                ) : (
                  <View>
                    <Image
                      source={{ uri: `${baseImgURL + item.media_path}` }}
                      style={{ width: wp(30), height: wp(30) }}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </PaperProvider>
    );
  };

  const Leaderboard = () => (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      <View>
        <Text
          style={{
            fontSize: hp(1.4),
            color: "#898989",
            fontFamily: "raleway-bold",
          }}
        >
          Total {leaderData?.length > 0 ? leaderData?.length : 0} Partcipants
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: hp(1.8),
            color: "#898989",
            fontFamily: "raleway-bold",
          }}
        >
          Ranking
        </Text>
        <Text
          style={{
            fontSize: hp(1.8),
            color: "#898989",
            fontFamily: "raleway-bold",
          }}
        >
          {challenge.frequency == "contest" ? `Likes` : "Points"}
        </Text>
      </View>
      <View>
        <FlatList
          data={leaderData}
          keyExtractor={(item) => item.ranking.toString()}
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 10 }} />
            </View>
          }
          renderItem={({ index, item }) => (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: hp(1.9),
                      fontFamily: "raleway-bold",
                      width: wp(8),
                    }}
                  >
                    {item.ranking}
                  </Text>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {item.first_character}
                    </Text>
                  </View>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>
                      {challenge.frequency != "contest" &&
                        `Spent ${item.time_spent}`}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {item.points}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    ...(challenge.frequency === "contest" && { entries: ThirdRoute }),
    people: SecondRoute,
    leaderboard: Leaderboard,
  });
  const isFocused = useIsFocused();
  // console.log(challenge.visit)
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Rules" },
    ...(challenge.frequency === "contest"
      ? [{ key: "entries", title: "Entries" }]
      : []),
    { key: "people", title: "People" },
    // { key: "leaderboard", title: "Leaderboard" },
    ...(typeof challenge.visit === "undefined" || challenge.visit === "no"
      ? [{ key: "leaderboard", title: "Leaderboard" }]
      : []),
  ]);

  useFocusEffect(
    useCallback(() => {
      const fetchPeople = async () => {
        // console.log("challenge_id", challenge.challenge_id);
        // console.log("userId", user.id);
        if (challenge && checked && user) {
          try {
            // Only fetch rewards if user data is available
            const response = await axios.get(
              `${baseURL}/getPeople.php?challenge_id=${challenge.challenge_id}&sort=${checked}&userId=${user.id}`
            );
            console.log(response.data);

            if (response.status === 200) {
              setPeopleData(response.data);
              console.log(response.data);
            } else {
              console.error("Failed to fetch people");
            }
          } catch (error) {
            console.error(
              "Error while fetching people details:",
              error.message
            );
          }
        }
      };

      fetchPeople();
    }, [isFocused, checked, navigation, selectedMovie, challenge])
  );
  useFocusEffect(
    useCallback(() => {
      const fetchContestPost = async () => {
        try {
          setIsLoading(true);
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/getContestPost.php?challenge_id=${challenge.challenge_id}&sort=${checked2}`
          );

          if (response.status === 200) {
            setDATA(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch contest");
          }
        } catch (error) {
          console.error("Error while fetching contest:", error.message);
        } finally {
          setIsLoading(false);
        }
      };

      if (challenge.frequency === "contest") {
        fetchContestPost();
      }
    }, [isFocused, navigation, checked2, challenge])
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // navigation.navigate("OtpVerification")
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
        <View style={{ position: "relative" }}>
          <View style={[styles.LinearGradient, { zIndex: -10 }]}>
            <Image
              source={{ uri: `${baseImgURL + selectedMovie.banner}` }}
              style={{ height: "100%", width: "100%", resizeMode: "cover" }}
            />
          </View>
          <View
            style={[
              styles.LinearGradient,
              {
                zIndex: -5,
                backgroundColor: "black",
                opacity: Platform.OS == "ios" ? 0.6 : 0.8,
              },
            ]}
          />

          <View style={{ padding: 15, marginTop: 20 }}>
            
          <TopBar color={"white"}  user={user}  />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                <View>
                  <View
                    style={[
                      {
                        padding: 3,
                        backgroundColor: "orange",
                        borderRadius: 120,
                      },
                    ]}
                  >
                   
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: wp(20),
                          width: wp(20),
                          backgroundColor: "white",
                          borderRadius: 50,
                          position: "relative",
                        }}
                      >
                        {selectedMovie.image?.length > 0 && (
                          <Image
                            source={{
                              uri: `${baseImgURL + selectedMovie.image}`,
                            }}
                            style={{
                              width: wp(20),
                              height: wp(20),
                              borderRadius: 50,
                              resizeMode: "contain",
                              backgroundColor: "white",
                            }}
                          />
                        )}
                      </View>
                  </View>
                </View>
                <View style={{ gap: 7 }}>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                      color: "white",
                    }}
                  >
                    {selectedMovie.title}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      <View style={styles.container}>

        <View style={styles.CardContainer}>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            indicatorStyle={{ backgroundColor: "white" }}
            style={{ backgroundColor: "white" }}
            swipeEnabled={true}
            renderTabBar={(props) => (
              <TabBar
                indicatorStyle={{ backgroundColor: "black" }}
                scrollEnabled={challenge.visit =="yes" || challenge.frequency!="contest" ? false : true}
                {...props}
                renderLabel={({ route, color }) => (
                  <Text
                    style={{
                      color: "black",
                      marginVertical: 8,
                      fontFamily: "raleway-bold",
                      fontSize: hp(1.5),
                    }}
                  >
                    {route.title}
                  </Text>
                )}
                style={{ backgroundColor: "white" }}
              />
            )} // <-- add this line
          />
        </View>
      </View>
      {!completeOne && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            marginHorizontal: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            style={styles.acceptBtn}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.acceptText}>NEXT</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  CardTitle: {
    marginVertical: 40,
    fontSize: hp(4),
    // fontFamily: "raleway-bold",
    fontFamily: "raleway-boldItalic",
  },
  entry_points: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
  },
  entry_points2: {
    fontSize: hp(4),
    fontFamily: "raleway-bold",
  },
  moviesContainer: {
    paddingTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  acceptBtn: {
    backgroundColor: "#E32636",
    padding: 10,
    borderRadius: 10,
    width: wp(90),
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "center",
  },
  acceptText: {
    fontSize: hp(2.2),
    color: "white",
    fontFamily: "raleway-bold",
  },
  reward_points: {
    fontSize: hp(2),
    fontFamily: "raleway-bold",
  },
  reward_points2: {
    fontSize: hp(4),
    fontFamily: "raleway-bold",
  },
  descriptionHead: {
    fontSize: hp(2),
    lineHeight: 18,
    fontFamily: "raleway-bold",
    fontFamily: "raleway",
  },
  description: {
    fontSize: hp(1.7),
    lineHeight: 21,
    color: "gray",
    marginTop: 10,
    fontFamily: "raleway",
  },
  ContainerDetails: {
    // alignItems: "center",
    padding: 10,
  },
  CardContainer: {
    flex: 1,
    width: wp(95),
    marginTop: 10,
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
  },
  titleInfo: {
    flexDirection: "row",
    marginTop: 15,
  },
  titleIcon: {
    marginTop: 15,
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
    // marginLeft: 20,
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
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: wp(15),
    width: wp(15),
    backgroundColor: "#ff8f8e",
    borderRadius: 50,
  },
  detailsContainer: {
    gap: 5,
  },
  name: {
    fontSize: hp(1.9),
    fontFamily: "raleway-bold",
  },
  date: {
    fontSize: hp(1.8),
    color: "#898989",
  },
  containerStyle: {
    margin: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
  },
  gridItem: {
    flex: 1,
    margin: 1,
  },
  gridItemImage: {
    width: wp(30), // Adjust according to the grid layout
    height: wp(30),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  modalCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    // Add styling for the close button/icon as needed
  },
  video: {
    flex: 1,
    width: "100%",
    borderRadius: 15,
  },
  LinearGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // minHeight:hp(35)
  },
});

export default ChallengeDetails;
