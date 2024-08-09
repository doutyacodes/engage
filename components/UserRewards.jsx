import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import wowfy_white from "../assets/logos/wowfy_white.png";
import { AntDesign } from "@expo/vector-icons";
import RewardCard from "./RewardCard";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { Entypo } from "@expo/vector-icons";
import {
  Divider,
  Modal,
  PaperProvider,
  Portal,
  ProgressBar,
} from "react-native-paper";
import MyRewardCard from "./AppComponents/MyRewardCard";
import { BlurView } from "expo-blur";
import { DataTable } from "react-native-paper";
import TopBar from "./AppComponents/TopBar";

const UserRewards = ({ route }) => {
  const navigation = useNavigation();
  const { movieId } = route.params;
  const isFocused = useIsFocused();
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [quarterly, setQuarterly] = useState([]);
  const [user, setUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [InfoDetails, setInfoDetails] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {
    backgroundColor: "white",
    padding: 20,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 20,
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser);
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
      const fetchRewards = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user) {
              const response = await axios.get(
                `${baseURL}/getUserRewards.php?page_id=${movieId}&user_id=${user.id}`
              );

              if (response.status === 200) {
                setSelectedRewards(response.data);
                // console.log(response.data);
              } else {
                console.error("Failed to fetch rewards");
              }
            }
          } catch (error) {
            console.error("Error while fetching rewards:", error.message);
          }
        }
      };

      fetchRewards();
      const fetchTotalpoints = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user) {
              const response = await axios.get(
                `${baseURL}/totalPoints.php?page_id=${movieId}&user_id=${user.id}`
              );

              if (response.status === 200) {
                setTotalPoints(response.data.total_points);
                // console.log(response.data.total_points);
              } else {
                console.error("Failed to fetch total points");
              }
            }
          } catch (error) {
            console.error("Error while fetching total points:", error.message);
          }
        }
      };

      fetchTotalpoints();
      const fetchRewardMine = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user && movieId) {
              const response = await axios.get(
                `${baseURL}/getPageRewards.php?page_id=${movieId}&userId=${user.id}`
              );

              if (response.data.my_rewards) {
                setMyRewards(response.data.my_rewards);
                // console.log(response.data.my_rewards);
              } else {
                console.error("Failed to my rewards");
              }
            }
          } catch (error) {
            console.error("Error while my rewards:", error.message);
          }
        }
      };

      fetchRewardMine();
      const weeklyReward = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user && movieId) {
              const response = await axios.get(
                `${baseURL}/getUserRank.php?page_id=${movieId}&user_id=${user.id}&timeline=weekly`
              );

              if (response.data.success) {
                setWeekly(response.data?.data);
                // console.log(response.data.data);
              } else {
                console.error("Failed to my weekly rewards");
              }
            }
          } catch (error) {
            console.error("Error while my weekly rewards:", error.message);
          }
        }
      };

      weeklyReward();
      const monthlyReward = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user && movieId) {
              const response = await axios.get(
                `${baseURL}/getUserRank.php?page_id=${movieId}&user_id=${user.id}&timeline=monthly`
              );

              if (response.data.success) {
                setMonthly(response.data.data);
                // console.log(response.data.data[0]);
              } else {
                console.error("Failed to my monthly rewards");
              }
            }
          } catch (error) {
            console.error("Error while my monthly rewards:", error.message);
          }
        }
      };

      monthlyReward();
      const seasonlyReward = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            if (user && movieId) {
              const response = await axios.get(
                `${baseURL}/getUserRank.php?page_id=${movieId}&user_id=${user.id}&timeline=season`
              );

              if (response.data.success) {
                setQuarterly(response.data?.data);
                console.log(response.data.data);
              } else {
                console.error("Failed to my season rewards");
              }
            }
          } catch (error) {
            console.error("Error while my season rewards:", error.message);
          }
        }
      };

      seasonlyReward();
      const fetchData = async () => {
        try {
          if (!user || !user.id) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }
          setIsLoading(true); // Set isLoading to true before fetching data

          const movieResponse = await axios.get(
            `${baseURL}/getDetailsInnerpage.php?id=${movieId}&userId=${user.id}`
          );

          // console.log(movieResponse.data);
          setSelectedMovie(movieResponse.data);
        } catch (error) {
          console.error("Error while fetching data:", error.message);
        }finally{
          setIsLoading(false); // Set isLoading to true before fetching data

        }
      };
      fetchData();
    }, [isFocused, user, movieId])
  );

  const SecondRoute = () => (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={myRewards}
        keyExtractor={(item, index) => index}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 2.5 }} />
          </View>
        }
        renderItem={({ index, item }) => {
          // console.log(item)
          return <MyRewardCard item={item} index={index} user={user} />;
        }}
      />
    </View>
  );

  const FirstRoute = () => (
    // <BlurView
    //   intensity={100}
    //   tint="l"
    //   style={{
    //     flex: 1,
    //   }}
    // >
    <View style={{ flex: 1 }}>
      {/* <ImageBackground style={{flex:1,opacity:0.4}} source={require("../assets/images/doodle.jpg")}> */}
      <View style={{ padding: 15 }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            paddingVertical: 30,
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
          <DataTable>
            <DataTable.Header>
              <DataTable.Title></DataTable.Title>
              <DataTable.Title>
                <Text style={{ color: "black" }}>Rank</Text>
              </DataTable.Title>
              <DataTable.Title>
                <Text style={{ color: "black" }}>Points</Text>
              </DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>Weekly</Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {weekly?.rank ? weekly.rank : 0}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {weekly?.total_points ? weekly.total_points : 0}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>Monthly</Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {monthly?.rank ? monthly.rank : 0}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {monthly?.total_points ? monthly.total_points : 0}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>Season</Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {quarterly?.rank ? quarterly.rank : 0}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Text style={{ color: "black" }}>
                  {quarterly?.total_points ? quarterly.total_points : 0}
                </Text>
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </View>
      </View>
      <View
        style={{
          marginBottom: 10,
          padding: 15,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            paddingVertical: 30,
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
          <View
            style={{
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={styles.Xp}>{selectedMovie?.this_level_xp} Xp</Text>
            <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
            <Text
              style={{
                fontSize: hp(1.8),
                // color: "white",
                fontFamily: "raleway-bold",
              }}
            >
              {selectedMovie?.total_xp} Xp
            </Text>
            <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
            <Text style={styles.Xp}>{selectedMovie?.next_level_xp} Xp</Text>
          </View>
          <View
            style={{
              padding: 15,
            }}
          >
            <ProgressBar
              progress={
                selectedMovie?.percent_to_next_level
                  ? selectedMovie?.percent_to_next_level / 100
                  : 0
              }
              style={{ height: 5, borderRadius: 5 }}
              color="blue"
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
            <Text style={styles.Xp}>Level {selectedMovie?.level}</Text>
            <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
            <Text style={styles.Xp}>Level {selectedMovie?.next_level}</Text>
          </View>
        </View>
      </View>
      {/* </ImageBackground> */}
    </View>
    // </BlurView>
  );
  const HistoryRoute = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", marginHorizontal: "auto" }}
    >
      <View style={{ alignItems: "center", gap: 8, paddingTop: 15 }}>
        {selectedRewards?.length > 0 ? (
          selectedRewards.map((item, index) => (
            <RewardCard
              item={item}
              index={index}
              key={index}
              showModal={showModal}
              setInfoDetails={setInfoDetails}
            />
          ))
        ) : (
          <View className="w-[100vw] justify-center items-center">
            <Text>No rewards available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: HistoryRoute,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Points" },
    { key: "second", title: "Rewards" },
    { key: "third", title: "History" },
  ]);

  return (
    <PaperProvider style={{ flex: 1 }}>
      {isLoading ? (
        <View className=" flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={containerStyle}
            >
              <Text
                style={{
                  color: "red",
                  fontSize: hp(2.2),
                  fontFamily: "raleway-bold",
                }}
              >
                Reason
              </Text>
              <View
                style={{
                  height: 0,
                  width: 75,
                  borderTopColor: "red",
                  borderTopWidth: 2,
                  marginVertical: 5,
                }}
              />

              <Text>{InfoDetails}</Text>
            </Modal>
          </Portal>
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
              <TopBar color={"white"} user={user} />

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
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            indicatorStyle={{ backgroundColor: "white" }}
            style={{ backgroundColor: "#e5e5e5" }}
            renderTabBar={(props) => (
              <TabBar
                indicatorStyle={{ backgroundColor: "black" }}
                {...props}
                renderLabel={({ route, color }) => (
                  <Text style={{ color: "black", margin: 8 }}>
                    {route.title}
                  </Text>
                )}
                style={{ backgroundColor: "white" }}
              />
            )}
          />
        </>
      )}
    </PaperProvider>
  );
};

export default UserRewards;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsContainer: {
    marginTop: 10,
    padding: 10,
    flex: 1,
    width: wp(100),
  },

  selectedOption: {
    backgroundColor: "lightblue",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  settingsIcon: {
    padding: 1,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  movieDetailsContainer: {
    width: "90%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
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
    marginTop: 15,
    // marginRight: 80,
  },
  titleIcon: {
    marginTop: 10,
    // marginLeft: 85,
    left: 10,
  },
  followButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#078bd6",
    borderRadius: 18,
  },
  movieImage: {
    width: 50,
    height: 60,
    borderRadius: 5,
    marginLeft: 20,
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
  leaderBtn: {
    backgroundColor: "#db3022",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  Navbtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  NavText: {
    fontSize: hp(1.9),
    fontFamily: "raleway-bold",
  },
  LinearGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // minHeight:hp(35)
  },
  profile_info: {
    gap: 2,
    alignItems: "center",
  },
  profileCount: {
    fontSize: hp(2.3),
    color: "white",
    fontFamily: "raleway-bold",
  },
  profileText: {
    fontSize: hp(1.5),
    color: "white",
    fontFamily: "raleway-semibold",
  },
  Xp: {
    fontSize: hp(1.4),
    // color: "white",
    fontFamily: "raleway-bold",
  },
  LinearGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // minHeight:hp(35)
  },
  topLogo: {
    height: 50,
    width: 50,
  },
  settingsIcon: {
    padding: 1,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },

  container: {
    flex: 1,
    alignItems: "center",
  },
  CardTitle: {
    marginVertical: 5,
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
});
