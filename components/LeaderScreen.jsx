// LeaderScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { StatusBar } from "expo-status-bar";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "./AppComponents/TopBar";
const LeaderScreen = ({ route }) => {
  const { pageId } = route.params;
  const navigation = useNavigation();

  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklySingle, setWeeklySingle] = useState([]);
  const [monthlySingle, setMonthlySignle] = useState([]);
  const [yearlySignle, setYearlySingle] = useState([]);
  const [monthylyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState(null);
  const isFocused = useIsFocused();

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
      const fetchData = async () => {
        try {
          if (!user || !user.id) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }

          setIsLoading(true); // Set isLoading to true before fetching data
          // console.log(challenge)
          const movieResponse = await axios.get(
            `${baseURL}/getDetailsInnerpage.php?id=${pageId}&userId=${user.id}`
          );

          console.log(movieResponse.data);
          // console.log(pageId);
          setSelectedMovie(movieResponse.data);
        } catch (error) {
          console.error("Error while fetching data:", error.message);
        } finally {
          setIsLoading(false); // Set isLoading to false if an error occurs
        }
      };
      fetchData();
      const fetchLeaderWeek = async () => {
        if (user) {
          try {
            const response = await axios.get(
              `${baseURL}/getUserLeader.php?user_id=${user?.id}&timeline=monthly&page_id=${pageId}`
            );

            if (response.status === 200) {
              setWeeklyData(response.data.data);
              setWeeklySingle(response.data.single);
              // console.log("leaderboard",response.data);
            } else {
              console.error("Failed to fetch leader data");
            }
          } catch (error) {
            console.error("Error while fetching leader data:", error.message);
          }
        }
      };

      fetchLeaderWeek();
      const fetchLeaderMonth = async () => {
        if (user) {
          try {
            const response = await axios.get(
              `${baseURL}/getUserLeader.php?user_id=${user?.id}&timeline=monthly&page_id=${pageId}`
            );

            if (response.status === 200) {
              setMonthlyData(response.data.data);
              setMonthlySignle(response.data.single);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch leader data");
            }
          } catch (error) {
            console.error("Error while fetching leader data:", error.message);
          }
        }
      };

      // fetchLeaderMonth();
      const fetchLeaderYear = async () => {
        if (user) {
          try {
            const response = await axios.get(
              `${baseURL}/getUserLeader.php?user_id=${user?.id}&timeline=yearly&page_id=${pageId}`
            );

            if (response.status === 200) {
              setYearlyData(response.data.data);
              setYearlySingle(response.data.single);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch leader data");
            }
          } catch (error) {
            console.error("Error while fetching leader data:", error.message);
          }
        }
      };

      // fetchLeaderYear();
    }, [isFocused, user])
  );

  const FirstRoute = () => (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      {weeklySingle && (
        <>
          <Text
            style={{
              fontSize: hp(2),
              color: "#898989",
              fontFamily: "raleway-bold",
            }}
          >
            Your Ranking
          </Text>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                marginBottom:10

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
                Points
              </Text>
            </View>
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
                    {weeklySingle.ranking}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: weeklySingle.id,
                      })
                    }
                    style={styles.avatarContainer}
                  >
                    <Text style={styles.avatarText}>
                      {weeklySingle.first_character}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: weeklySingle.id,
                      })
                    }
                    style={styles.detailsContainer}
                    className="items-center"
                  >
                    <Text style={styles.name}>{weeklySingle.name}</Text>
                    {/* <Text style={styles.date}> */}
                    {/* Spent {weeklySingle.time_spent} */}
                    {/* </Text> */}
                  </TouchableOpacity>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {weeklySingle.total_points}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
      {
        weeklyData?.length > 0 && (
          <>
           <Text
            style={{
              fontSize: hp(2),
              color: "#898989",
              fontFamily: "raleway-bold",
              marginTop:20
            }}
          >
            Total Ranking
          </Text>
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
          Points
        </Text>
      </View>
          </>
        )
      }
      <View>
        <FlatList
          data={weeklyData}
          keyExtractor={(item) => item.ranking.toString()}
          contentContainerStyle={styles.moviesContainer}
          ListEmptyComponent={() => (
            <View className="flex-1 min-h-[60vh] justify-center items-center">
              <Text
                style={{ fontFamily: "raleway-bold" }}
                className="text-xl text-center"
              >
                No datas exist!!
              </Text>
            </View>
          )}
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
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.id,
                      })
                    }
                    style={styles.avatarContainer}
                  >
                    <Text style={styles.avatarText}>
                      {item.first_character}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.id,
                      })
                    }
                    style={styles.detailsContainer}
                    className="items-center"
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    {/* <Text style={styles.date}> */}
                    {/* Spent {item.time_spent} */}
                    {/* </Text> */}
                  </TouchableOpacity>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {item.total_points}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
  const SecondRoute = () => (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      <View>
        <Text
          style={{
            fontSize: hp(1.4),
            color: "#898989",
            fontFamily: "raleway-bold",
          }}
        >
          Total {monthylyData?.length > 0 ? monthylyData?.length : 0}{" "}
          Partcipants
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
          Points
        </Text>
      </View>
      <View>
        <FlatList
          data={monthylyData}
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
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.id,
                      })
                    }
                    style={styles.avatarContainer}
                  >
                    <Text style={styles.avatarText}>
                      {item.first_character}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.user_id,
                      })
                    }
                    style={styles.detailsContainer}
                    className="items-center"
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    {/* <Text style={styles.date}> */}
                    {/* Spent {item.time_spent} */}
                    {/* </Text> */}
                  </TouchableOpacity>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {item.total_points}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
  const ThirdRoute = () => (
    <View style={{ flex: 1, backgroundColor: "white", padding: 15 }}>
      <View>
        <Text
          style={{
            fontSize: hp(1.4),
            color: "#898989",
            fontFamily: "raleway-bold",
          }}
        >
          Total {yearlyData?.length > 0 ? yearlyData?.length : 0} Partcipants
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
          Points
        </Text>
      </View>
      <View>
        <FlatList
          data={yearlyData}
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
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.id,
                      })
                    }
                    style={styles.avatarContainer}
                  >
                    <Text style={styles.avatarText}>
                      {item.first_character}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("OtherUserScreen", {
                        user_id: item.user_id,
                      })
                    }
                    style={styles.detailsContainer}
                    className="items-center"
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    {/* <Text style={styles.date}> */}
                    {/* Spent {item.time_spent} */}
                    {/* </Text> */}
                  </TouchableOpacity>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {item.total_points}
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
    second: SecondRoute,
    third: ThirdRoute,
  });

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Weekly Leaderboard" },
    // { key: "second", title: "Monthly" },
    // { key: "third", title: "Yearly" },
  ]);
  return (
    <View style={styles.container}>
      {isLoading ? (
        <View className=" flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <>
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
                              width: wp(12),
                              height: wp(12),
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
                  <Text
                    style={{
                      color: "black",
                      margin: 8,
                      fontFamily: "raleway-bold",
                      fontSize: hp(1.8),
                    }}
                  >
                    {route.title}
                  </Text>
                )}
                style={{ backgroundColor: "white" }}
              />
            )} // <-- add this line
          />
        </>
      )}
      <StatusBar style="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  settingsIcon: {
    padding: 1,
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
  titleContainer: {
    backgroundColor: "#E32636",
    width: "100%",
    marginTop: 15,
  },
  title: {
    fontSize: 25,
    fontFamily: "raleway-bold",
    color: "white",
    padding: 10,
    textAlign: "center",
  },
  selectedMoviesContainer: {
    marginTop: 15,
  },
  movieInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedMovieBlock: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    padding: 5,
  },
  moviesContainer: {
    paddingTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  selectedMovieImage: {
    width: 30,
    height: 40,
    borderRadius: 5,
  },
  caption: {
    fontSize: 14,
    color: "black",
  },
  latestMediaContainer: {
    marginTop: 10,
    backgroundColor: "lightgrey",
    height: 150,
    width: "100%",
    borderRadius: 10,
  },
  selectedMovieName: {
    fontSize: 14,
    fontFamily: "raleway-bold",
    color: "black",
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

export default LeaderScreen;
