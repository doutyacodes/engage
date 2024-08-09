import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Feather, AntDesign, Ionicons, FontAwesome } from "@expo/vector-icons";
import { baseImgURL, baseURL } from "../backend/baseData";
import DescriptionComponent from "./AppComponents/DescriptionComponent";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import StoreDetails from "./AppComponents/StoreDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { GOOGLE_MAPS_APIKEY } from "../constants";
import wowfy_white from "../assets/logos/wowfy_white.png";
import { BlurView } from "expo-blur";
import { Modal, PaperProvider, Portal, RadioButton } from "react-native-paper";
import CertificateList from "./CertificateList";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import TopBar from "./AppComponents/TopBar";

const FoodLocation = ({ route }) => {
  const { challenge, type = "food" } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [prevStore, setPrevStore] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState("Rules");
  const [peopleData, setPeopleData] = useState([]);
  const [checked, setChecked] = useState("latest");
  const [checked2, setChecked2] = useState("latest");
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

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
    (async () => {
      setIsLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },(newLocation) => {
        setLocation(newLocation);
        
      });
      // console.log(location.coords.latitude);
      setLocation(location);
      setIsLoading(false);
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  const calculateDistance = async (origin, destination) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const distance = response.data.rows[0].elements[0].distance.value;
      console.log(response.data.rows[0].elements[0].distance);
      return distance;
    } catch (error) {
      console.error("Error calculating distance:", error);
      return null;
    }
  };
  const fetchSingle = async () => {
    try {
      // Only fetch rewards if user data is available
      const response = await axios.get(
        `${baseURL}/getSinglestore.php?challenge_id=${challenge.challenge_id}&user_id=${user.id}&page_id=${challenge.page_id}`
      );
      // console.log("resps",response.data);
      if (response.data) {
        // Calculate distances and sort stores here
        const store = response.data;
        if (store && Object.keys(store).length > 0) {
          const distance = await calculateDistance(location.coords, {
            latitude: parseFloat(store.latitude),
            longitude: parseFloat(store.longitude),
          });

          // console.log(`Distance to the store: ${distance}`);

          // Optionally, if you need to set this distance in your state or perform other actions
          setPrevStore([{ ...store, distance }]);
        } else {
          console.log("Store data not found.");
        }
      }
    } catch (error) {
      console.error("Error while fetching stores:", error);
    }
  };
  // console.log("prev store",prevStore[0])
  useEffect(() => {
    const fetchStores = async () => {
      if (location) {
        try {
          setIsLoading(true);
          await fetchSingle();
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/getStoreDetails.php?challenge_id=${challenge.challenge_id}&page_id=${challenge.page_id}`
          );
          //   console.log(response.data);
          if (response.data) {
            // Calculate distances and sort stores here
            const stores = response.data;
            const storesWithDistances = await Promise.all(
              stores.map(async (store) => {
                const distance = await calculateDistance(location.coords, {
                  latitude: parseFloat(store.latitude),
                  longitude: parseFloat(store.longitude),
                });
                return { ...store, distance };
              })
            );
            const sortedStores = storesWithDistances.sort(
              (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
            );
            // console.log(sortedStores);
            setStoreData(sortedStores);
          }
        } catch (error) {
          console.error("Error while fetching stores:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStores(); // Call the function inside the useEffect hook
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
  }, [location, route]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }

        const movieResponse = await axios.get(
          `${baseURL}/getDetailsInnerpage.php?id=${challenge.page_id}&userId=${user.id}`
        );

        // console.log(movieResponse.data);
        setSelectedMovie(movieResponse.data);
      } catch (error) {
        console.error("Error while fetching data:", error.message);
      } finally {
      }
    };
    fetchData();
  }, [user]);
  useEffect(() => {
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
          console.error("Error while fetching people details:", error.message);
        }
      }
    };

    fetchPeople();
  }, [challenge, user]);
  const [routes] = useState([
    { key: "rules", title: "Rules" },
    { key: "available", title: "Available Places" },
    { key: "people", title: "People" },
  ]);

  const RulesRoute = () => (
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
    </ScrollView>
  );
  const PlaceRoute = () => (
    <ScrollView style={{ padding: 15 }}>
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="red" size="large" />
        </View>
      ) : (
        <View style={{ flex: 1, padding: 10 }}>
          {prevStore && prevStore[0] && (
            <View>
              <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
                Previous Visit
              </Text>
              <View className="my-2">
                <StoreDetails user_id={user.id} item={prevStore[0]} />
              </View>
            </View>
          )}
          <View>
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
              Available {type == "food" ? "Restaurants" : "Places"}
            </Text>
            <View style={{ marginBottom: 23 }}>
              {user &&
                storeData?.length > 0 &&
                storeData.map((item, index) => {
                  return (
                    <StoreDetails user_id={user.id} key={index} item={item} />
                  );
                })}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
  const PeopleRoute = () => (
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

  const renderScene = SceneMap({
    rules: RulesRoute,
    available: PlaceRoute,
    people: PeopleRoute,
  });
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        gap: 15,
      }}
    >
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
        style={{ backgroundColor: "white" }}
        swipeEnabled={true}
        renderTabBar={(props) => (
          <TabBar
            indicatorStyle={{ backgroundColor: "black" }}
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

      {/* <View
        style={{
          //   minHeight: hp(40),
          borderRadius: 11,
          width: "100%",
          backgroundColor: "white",
          shadowColor: "gray",
          borderColor: "#e5e5e5",
          paddingVertical: 10,
          borderWidth: 1,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,

          elevation: 10,
          alignItems: "center",
          gap: 12,
        }}
      >
        <View>
          <Image
            source={{ uri: `${baseImgURL + challenge.image}` }}
            style={{
              height: hp(20), // Adjust the height of the image as needed
              width: hp(20),
              borderRadius: 15,
            }}
            resizeMode="cover"
          />
        </View>
        <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
          {challenge.title}
        </Text>
        <DescriptionComponent description={challenge.description} />
      </View>
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 20,
          flex: 1,
          borderRadius: 11,
          width: "100%",
          backgroundColor: "white",
          borderColor: "#e5e5e5",
          paddingVertical: 10,
          borderWidth: 1,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.34,
          shadowRadius: 6.27,

          elevation: 10,
          gap: 12,
          marginTop: 10,
          minHeight: hp(58),
        }}
      >
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator color="red" size="large" />
          </View>
        ) : (
          <View style={{ flex: 1, padding: 10 }}>
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
              Available {type == "food" ? "Restaurants" : "Places"}
            </Text>
            <View style={{ marginBottom: 23 }}>
              {user &&
                storeData?.length > 0 &&
                storeData.map((item, index) => {
                  return (
                    <StoreDetails user_id={user.id} key={index} item={item} />
                  );
                })}
            </View>
          </View>
        )}
      </View> */}
      <StatusBar style="dark" />
    </View>
  );
};

export default FoodLocation;

const styles = StyleSheet.create({
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
