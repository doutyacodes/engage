// Moviehome.js
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { FontAwesome, Ionicons, Entypo } from "@expo/vector-icons";
import wowfy_white from "../assets/logos/wowfy_white.png";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { BlurView } from "expo-blur";
import Posts from "./Posts";
import NewVisitCard from "./NewVisitCard";
import ChallengeHomeCardVisit from "./ChallengeHomeCardVisit";
import { GOOGLE_MAPS_APIKEY } from "../constants";
import * as Location from "expo-location";
import { Feather, AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import Toast2 from "react-native-root-toast";

import CertificateList from "./CertificateList";
import {
  Button,
  Dialog,
  Modal,
  PaperProvider,
  Portal,
  Divider,
  ProgressBar,
  Tooltip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import FoodDisplay from "./FoodDisplay";
import SwiperFlatList from "react-native-swiper-flatlist";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { withRepeat } from "react-native-reanimated";
import TopBar from "./AppComponents/TopBar";
import AwesomeAlert from "react-native-awesome-alerts";
import { airportData } from "../constants/dummyData";

const Moviehome = ({ route }) => {
  const navigation = useNavigation();
  const [see, setSee] = useState(false);
  const { width, height } = Dimensions.get("window");
  const swiperRef = useRef(null); // Ref for SwiperFlatList component

  const { movieId } = route.params;
  const now = route.params?.now ? route.params.now : null;
  // const now = "yes";
  // console.log(now);
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState(null);
  const [peopleData, setPeopleData] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [postData, setPostData] = useState([]);
  const [textDataBottom, setTextDataBottom] = useState("");
  const [allStates, setAllStates] = useState([]);
  const [filterChallenges, setFilterChallenges] = useState([]);
  const [bootcamp, setBootcamp] = useState([]);
  const [challengeState, setChallengeState] = useState([]);
  const [streakState, setstreakState] = useState([]);
  const [quizState, setQuizState] = useState([]);
  const [biriyaniData, setBiriyaniData] = useState([]);
  const [quizStateLive, setQuizStateLive] = useState([]);
  const [treasureState, settreasureState] = useState([]);
  const [challengesNormal, setChallengesNormal] = useState([]);
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState(null);
  const [contestData, setContestData] = useState([]);
  const [items, setItems] = useState([]);
  const [states, setStates] = useState(1);
  const [constituentsList, setConstituentsList] = useState([]);
  const [completeOne, setCompleteOne] = useState([]);
  const [constituency, setConstituency] = useState("");
  const [alreadySelected, setAlreadySelected] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [visible, setVisible] = useState(false);
  const [activeRouteIndex, setActiveRouteIndex] = useState("first");
  const [mainRouteIndex, setMainRouteIndex] = useState("Challenges");
  const [foodChallenge, setFoodChallenge] = useState([]);
  const [entertainment, setEntertainment] = useState([]);
  const [experienceChallenge, setExperienceChallenge] = useState([]);
  const [trendingFood, setTrendingFood] = useState([]);
  const [trendingExperience, setTrendingExperience] = useState([]);
  const [justLoading, setJustLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handlePressWithDelay = (routeKey) => {
    setJustLoading(true);
    setTimeout(() => {
      setActiveRouteIndex(routeKey);
      setJustLoading(false);
    }, 200); // Adjust the delay time as needed (200 milliseconds in this example)
  };
  const showDialog = () => setVisible(true);
  const [instructionData, setInstructionData] = useState([]);
  const goToNextPage = (index) => {
    if (index <= instructionData?.length) {
      if (swiperRef.current) {
        swiperRef.current.scrollToIndex({ index: index + 1, animated: true }); // Navigate to the next page
      }
    }
  };
  const hideDialog = () => setVisible(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("pages");
        if (storedUser) {
          setSee(false);
        } else {
          setSee(true);
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchData();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      // console.log(location)

      // Reverse geocoding to get the district
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
        );
        const addressComponents = response.data.results[0].address_components;
        const districtComponent = addressComponents.find((component) =>
          component.types.includes("administrative_area_level_3")
        );
        setDistrict(districtComponent.long_name);
      } catch (error) {
        console.error("Error fetching district:", error);
      }
    })();
  }, []);
  useEffect(() => {
    const checkAlreadySelected = async () => {
      if (user) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/checkAlreadyConstituency.php?user_id=${user.id}&page_id=${movieId}`
          );

          if (response.status === 200) {
            if (response?.data?.already_exist == "yes") {
              setAlreadySelected(true);
            }
          } else {
            console.error("Failed to fetch already constituency");
          }
        } catch (error) {
          console.error(
            "Error while fetching already constituency:",
            error.message
          );
        }
      }
    };
    checkAlreadySelected();
  }, [user]);
  useEffect(() => {
    const fetchInstruction = async () => {
      try {
        // Only fetch rewards if user data is available
        const response = await axios.get(
          `${baseURL}/getInstructions.php?type=page`
        );

        if (response.status === 200) {
          setInstructionData(response.data.data);
          // console.log(response.data.data);
        } else {
          console.error("Failed to fetch instruction data");
        }
      } catch (error) {
        console.error("Error while fetching instruction data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstruction();
  }, [movieId]);
  useEffect(() => {
    // handleChange("country", values);
    const fetchState = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/constituents.php?StateCode=${states}`
        );

        if (response.status === 200) {
          setConstituentsList(response.data);
          // console.log(response.data);
        } else {
          console.error("Failed to fetch constituency");
        }
      } catch (error) {
        console.error("Error while fetching constituency:", error.message);
      }
    };

    fetchState();
  }, [states]);
  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
    if (district) {
      text += `\nDistrict: ${district}`;
    }
  }
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  useEffect(() => {
    scale.value = withRepeat(
      withSpring(
        1.1, // Target scale
        {
          duration: 2000, // Duration in milliseconds for the spring animation
          damping: 3, // Decrease damping for a smoother animation
          stiffness: 100,
        }
      ), // Scale up to 1.1
      -1, // Repeat indefinitely
      true // Reverse animation on completion
    );

    // Clean up function to stop the animation when component unmounts
    return () => {
      scale.value = 1; // Reset scale when component unmounts
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/state-constituents.php`);

        if (response.status === 200) {
          setItems(response.data);
          setConstituency("");
          // console.log(response.data);
        } else {
          console.error("Failed to fetch countries");
        }
      } catch (error) {
        console.error("Error while fetching countries:", error.message);
      }
    };

    fetchData();
  }, []);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }

        setIsLoading(true); // Set isLoading to true before fetching data

        const movieResponse = await axios.get(
          `${baseURL}/getDetailsInnerpage.php?id=${movieId}&userId=${user.id}${
            now ? "&now=yes" : ""
          }`
        );

        // console.log("movieResponse",movieResponse.data);
        setSelectedMovie(movieResponse.data);
        setIsFollowing(movieResponse.data.following == "true" ? true : false);
      } catch (error) {
        console.error("Error while fetching data:", error.message);
      } finally {
        setIsLoading(false); // Set isLoading to false if an error occurs
      }
    };
    fetchData(); // Call fetchData function
  }, [user, movieId, isFocused]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          // If user or user.id doesn't exist, skip the fetch
          return;
        }
    
        const urls = [
          `${baseURL}/getPeoplePage.php?page_id=${movieId}&userId=${user.id}`,
          `${baseURL}/getEachCompleted.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getPagePosts.php?page_id=${movieId}&userId=${user.id}`,
          `${baseURL}/getEachPageVisit.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getTrendingPageVisit.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachTrendingState.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachStreakState.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachQuiz.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachLiveQuiz.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachTreasureState.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachBootcampVisit.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEachContestState.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getFoodChallenge.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getBiriyani.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getTrendingFood.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getTrendingActivity.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getEntertainment.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/getExperienceChallenge.php?userId=${user.id}&page_id=${movieId}`,
          `${baseURL}/totalPoints.php?page_id=${movieId}&user_id=${user.id}`
        ];
    
        const responses = await Promise.allSettled(urls.map(url => axios.get(url)));
    
        const [
          peopleResponse,
          completedResponse,
          postsResponse,
          fullResponse,
          challengeResponse,
          challengesResponse,
          streakResponse,
          quizResponse,
          quizResponseLive,
          treasureResponse,
          bootcampResponse,
          contestResponse,
          foodResponse,
          biriyaniResponse,
          foodTrendingResponse,
          expTrendingResponse,
          entertainmentResponse,
          experienceResponse,
          totalPointsResponse,
        ] = responses;
    
        if (peopleResponse.status === "fulfilled") {
          console.log("peopleResponse",peopleResponse.value.data)
          setPeopleData(peopleResponse.value.data);
        } else {
          console.error("Error fetching people data:", peopleResponse.reason.message);
        }
    
        if (completedResponse.status === "fulfilled") {
          setCompleteOne(completedResponse.value.data);
        } else {
          console.error("Error fetching completed data:", completedResponse.reason.message);
        }
    
        if (postsResponse.status === "fulfilled") {
          setPostData(postsResponse.value.data);
        } else {
          console.error("Error fetching posts data:", postsResponse.reason.message);
        }
    
        if (fullResponse.status === "fulfilled") {
          // setAllStates(fullResponse.value.data);
        } else {
          console.error("Error fetching full data:", fullResponse.reason.message);
        }
    
        if (challengeResponse.status === "fulfilled") {
          // setFilterChallenges(challengeResponse.value.data.data);
        } else {
          console.error("Error fetching challenge data:", challengeResponse.reason.message);
        }
    
        if (challengesResponse.status === "fulfilled") {
          // console.log(challengesResponse.value.data)
          // setChallengesNormal(filterData(challengesResponse.value.data));
        } else {
          console.error("Error fetching challenges data:", challengesResponse.reason.message);
        }
    
        if (streakResponse.status === "fulfilled") {
          setstreakState(filterData(streakResponse.value.data));
        } else {
          console.error("Error fetching streak data:", streakResponse.reason.message);
        }
    
        if (quizResponse.status === "fulfilled") {
          setQuizState(quizResponse.value.data);
        } else {
          console.error("Error fetching quiz data:", quizResponse.reason.message);
        }
    
        if (quizResponseLive.status === "fulfilled") {
          setQuizStateLive(quizResponseLive.value.data);
        } else {
          console.error("Error fetching live quiz data:", quizResponseLive.reason.message);
        }
    
        if (treasureResponse.status === "fulfilled") {
          settreasureState(filterData(treasureResponse.value.data));
        } else {
          console.error("Error fetching treasure data:", treasureResponse.reason.message);
        }
    
        if (bootcampResponse.status === "fulfilled") {
          setBootcamp(filterData(bootcampResponse.value.data));
        } else {
          console.error("Error fetching bootcamp data:", bootcampResponse.reason.message);
        }
    
        if (contestResponse.status === "fulfilled") {
          setContestData(filterData(contestResponse.value.data));
        } else {
          console.error("Error fetching contest data:", contestResponse.reason.message);
        }
    
        if (foodResponse.status === "fulfilled") {
          setFoodChallenge(foodResponse.value.data);
        } else {
          console.error("Error fetching food challenge data:", foodResponse.reason.message);
        }
    
        if (biriyaniResponse.status === "fulfilled") {
          setBiriyaniData(biriyaniResponse.value.data);
        } else {
          console.error("Error fetching biriyani data:", biriyaniResponse.reason.message);
        }
    
        if (foodTrendingResponse.status === "fulfilled") {
          setTrendingFood(foodTrendingResponse.value.data);
        } else {
          console.error("Error fetching trending food data:", foodTrendingResponse.reason.message);
        }
    
        if (expTrendingResponse.status === "fulfilled") {
          setTrendingExperience(expTrendingResponse.value.data);
        } else {
          console.error("Error fetching trending experience data:", expTrendingResponse.reason.message);
        }
    
        if (entertainmentResponse.status === "fulfilled") {
          setEntertainment(entertainmentResponse.value.data);
        } else {
          console.error("Error fetching entertainment data:", entertainmentResponse.reason.message);
        }
    
        if (experienceResponse.status === "fulfilled") {
          setExperienceChallenge(experienceResponse.value.data);
        } else {
          console.error("Error fetching experience challenge data:", experienceResponse.reason.message);
        }
    
        if (totalPointsResponse.status === "fulfilled") {
          setTotalPoints(totalPointsResponse.value.data.total_points);
        } else {
          console.error("Error fetching total points data:", totalPointsResponse.reason.message);
        }
    
      } catch (error) {
        console.error("Error while fetching data:", error.message);
      }
    };
    

    fetchData();
  }, [isFocused, user, movieId]);
  const filterData = (data) => {
    if (data.length > 1) {
      if (now != "yes") {
        return data.filter(
          (item) =>
            !(item.oper_for == "location" || item.oper_for == "specific")
        );
      }
    }
    return data;
  };

  // console.log(selectedMovie);
  const displayTuts = async () => {
    await AsyncStorage.setItem("pages", "true");

    setSee(false);
  };
  const renderItems = ({ item, index }) => (
    <View
      style={{
        flex: 1,
        minWidth: wp(70),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={item.image}
        style={{ width: wp(80), height: hp(40), resizeMode: "contain" }}
      />
      <Text style={{ marginVertical: 10, color: "gray" }}>
        {item.description}
      </Text>
      {index == 3 && (
        <TouchableOpacity
          style={{
            backgroundColor: "red",
            paddingVertical: 15,
            paddingHorizontal: 20,
            borderRadius: 12,
          }}
          onPress={displayTuts}
        >
          <Text
            style={{ color: "white", fontSize: hp(1.8), fontWeight: "bold" }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
  const toggleFollow = async () => {
    if (user) {
      // Toggle the follow status optimistically

      try {
        // Make the API request to follow/unfollow
        const response = await axios.get(
          `${baseURL}/event-Follow.php?page_id=${movieId}&userId=${user.id}`
        );
        setShowAlert(false);
        if (isFollowing == false) {
          let toast = Toast2.show(
            `You started following ${selectedMovie.title}`,
            {
              duration: Toast2.durations.SHORT,
              position: Toast2.positions.BOTTOM,
              shadow: true,
              animation: true,
              hideOnPress: true,
              delay: 0,
              backgroundColor: "white", // Set background color to transparent
              textColor: "black",
              containerStyle: {
                backgroundColor: "white",
                borderRadius: 50,
                padding: 15,
              },
              onShow: () => {
                // Calls on toast's appear animation start
              },
              onShown: () => {
                // Calls on toast's appear animation end.
              },
              onHide: () => {
                // Calls on toast's hide animation start.
              },
              onHidden: () => {
                // Calls on toast's hide animation end.
              },
            }
          );
        } else {
          let toast = Toast2.show(`You unfollowed ${selectedMovie.title}`, {
            duration: Toast2.durations.SHORT,
            position: Toast2.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
            backgroundColor: "white", // Set background color to transparent
            textColor: "black",
            containerStyle: {
              backgroundColor: "white",
              borderRadius: 50,
              padding: 15,
            },
            onShow: () => {
              // Calls on toast's appear animation start
            },
            onShown: () => {
              // Calls on toast's appear animation end.
            },
            onHide: () => {
              // Calls on toast's hide animation start.
            },
            onHidden: () => {
              // Calls on toast's hide animation end.
            },
          });
        }
        setShowAlert(false);

        setIsFollowing((prevIsFollowing) => !prevIsFollowing);
        setShowAlert(false);

        // Handle the response data
        // console.log("Data:", response.data);
      } catch (error) {
        // Revert the follow status if an error occurs

        // Handle errors
        console.error("Error while following:", error);
        throw error; // Throw the error to handle it outside this function if needed
      } finally {
        setShowAlert(false);
      }
    }
  };
  const showToast = (errorData) => {
    Toast.show({
      type: "error",
      text1: "Oops",
      text2: errorData,
    });
  };
  const handleSubmit = async () => {
    // console.log("states", states);
    // console.log("constituency", constituency);

    if (!states) {
      showToast("You must select a state.");
      return;
    }
    if (!constituency) {
      showToast("You must select a constituency.");
      return;
    }
    if (!user) {
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/user-constituency.php`,
        {
          stateCode: states,
          user_id: user.id,
          page_id: movieId,
          constituency: constituency,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      // console.log(response.data);
      if (response.data.success) {
        setAlreadySelected(true);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  // console.log(selectedMovie)
  const FourthRoute = () => (
    <View style={{ flex: 1 }}>
      {Array.isArray(peopleData)&& peopleData?.length > 0 &&
        peopleData.map((item, index) => {
          // console.log(peopleData?.length);
          return (
            <View style={{ marginTop: 10, paddingHorizontal: 10 }} key={index}>
              <CertificateList
                item={item}
                index={index}
                user_id={user.id}
                arena={null}
              />
            </View>
          );
        })}
    </View>
  );
  const FifthRoute = () => (
    <View style={{ flex: 1, padding: 10 }}>
      {postData?.length > 0 &&
        postData.map((item, index) => {
          // console.log(item);
          return (
            <View style={{ marginTop: 10, paddingHorizontal: 10 }} key={index}>
              <Posts item={item} index={index} user_id={user?.id} />
            </View>
          );
        })}

      {/* Bottom Sheet */}
    </View>
  );
  const AirportRoute = () => (
    <View style={{ flex: 1, padding: 10 }}>
      <View className="p-3 bg-white shadow-lg rounded-md border border-black/5">
        <View className="bg-gray-200 rounded-md p-3">
          <TextInput placeholder="Search Flights" className="w-full" />
        </View>
      </View>
      <View className="pt-3 space-y-3">
        {airportData?.length > 0 &&
          airportData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={()=>navigation.navigate("FlightDetail")}
              className="bg-white p-3 shadow-lg rounded-md border border-black/5 w-full"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center" style={{ gap: 6 }}>
                  <Image
                    source={{ uri: item.airline_logo }}
                    style={{ width: wp(10), height: wp(10) }}
                    resizeMode="contain"
                  />
                  <View>
                    <Text className=" font-semibold">
                      {item.airline}{" "}
                      <Text className="text-black/20">
                        {item.flight_number}
                      </Text>
                    </Text>
                    <Text className=" font-light text-xs">{item.class}</Text>
                  </View>
                </View>
                <View />
              </View>
              <View
                className="flex-row justify-between w-full mt-2"
                style={{ gap: 5 }}
              >
                <View style={{ gap: 10 }}>
                  <Text className=" font-semibold">{item.departure_city}</Text>
                  <Text className=" font-medium text-xs">
                    {item.departure_time}
                  </Text>
                </View>
                <View className="flex-1 justify-center items-center px-4"  style={{ gap: 5 }}>
                  <Text className="text-black/40 text-xs">{item.duration}</Text>
                  <View className="border-black/20 border w-full " />
                  <Text className="text-black/40 text-xs">{item.stops}</Text>
                </View>
                <View style={{ gap: 10 }}>
                  <Text className=" font-semibold">{item.arrival_city}</Text>
                  <Text className=" font-medium text-xs">
                    {item.arrival_time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  const ChallengesRoute = () => (
    // <View style={{ marginTop: 10, gap: 10, padding: 10 }}>
    //   {challengesNormal?.challenges &&
    //     challengesNormal?.challenges?.length > 0 && (
    //       <View style={{ backgroundColor: "white", marginVertical: 10 }}>
    //         <Text
    //           style={{
    //             padding: 15,
    //             fontFamily: "raleway-bold",
    //             fontSize: hp(1.9),
    //           }}
    //         >
    //           Trending in {challengesNormal.state}
    //         </Text>
    //         <FlatList
    //           data={challengesNormal?.challenges}
    //           keyExtractor={(item, index) => index}
    //           showsHorizontalScrollIndicator={false}
    //           horizontal
    //           ItemSeparatorComponent={
    //             <View>
    //               <View style={{ height: 5 }} />
    //             </View>
    //           }
    //           renderItem={({ index, item }) => {
    //             // console.log(item)
    //             return (
    //               <ChallengeHomeCardVisit
    //                 now={now}
    //                 challenge={item}
    //                 user={user}
    //                 key={index}
    //                 index={index}
    //                 arena={null}
    //                 district={district}
    //               />
    //             );
    //           }}
    //         />
    //       </View>
    //     )}
    //   {bootcamp?.challenges && bootcamp?.challenges?.length > 0 && (
    //     <View style={{ backgroundColor: "white", marginBottom: 10 }}>
    //       <Text
    //         style={{
    //           padding: 15,
    //           fontFamily: "raleway-bold",
    //           fontSize: hp(1.9),
    //         }}
    //       >
    //         Bootcamp
    //       </Text>
    //       <FlatList
    //         data={bootcamp?.challenges}
    //         keyExtractor={(item, index) => index}
    //         showsHorizontalScrollIndicator={false}
    //         horizontal
    //         ItemSeparatorComponent={
    //           <View>
    //             <View style={{ height: 5 }} />
    //           </View>
    //         }
    //         renderItem={({ index, item }) => (
    //           <ChallengeHomeCardVisit
    //             now={now}
    //             challenge={item}
    //             user={user}
    //             key={index}
    //             index={index}
    //             arena={null}
    //             district={district}
    //           />
    //         )}
    //       />
    //     </View>
    //   )}
    //   {challengeState?.challenges && challengeState?.challenges?.length > 0 && (
    //     <View style={{ backgroundColor: "white", marginBottom: 10 }}>
    //       <Text
    //         style={{
    //           padding: 15,
    //           fontFamily: "raleway-bold",
    //           fontSize: hp(1.9),
    //         }}
    //       >
    //         Challenges
    //       </Text>
    //       <FlatList
    //         data={challengeState?.challenges}
    //         keyExtractor={(item, index) => index}
    //         showsHorizontalScrollIndicator={false}
    //         horizontal
    //         ItemSeparatorComponent={
    //           <View>
    //             <View style={{ height: 5 }} />
    //           </View>
    //         }
    //         renderItem={({ index, item }) => (
    //           <ChallengeHomeCardVisit
    //             now={now}
    //             challenge={item}
    //             user={user}
    //             key={index}
    //             index={index}
    //             arena={null}
    //             district={district}
    //           />
    //         )}
    //       />
    //     </View>
    //   )}
    //   {streakState?.challenges && streakState?.challenges?.length > 0 && (
    //     <View style={{ backgroundColor: "white", marginBottom: 10 }}>
    //       <Text
    //         style={{
    //           padding: 15,
    //           fontFamily: "raleway-bold",
    //           fontSize: hp(1.9),
    //         }}
    //       >
    //         Streaks
    //       </Text>
    //       <FlatList
    //         data={streakState?.challenges}
    //         keyExtractor={(item, index) => index}
    //         showsHorizontalScrollIndicator={false}
    //         horizontal
    //         ItemSeparatorComponent={
    //           <View>
    //             <View style={{ height: 5 }} />
    //           </View>
    //         }
    //         renderItem={({ index, item }) => (
    //           <ChallengeHomeCardVisit
    //             now={now}
    //             challenge={item}
    //             user={user}
    //             key={index}
    //             index={index}
    //             arena={null}
    //             district={district}
    //           />
    //         )}
    //       />
    //     </View>
    //   )}

    //   {treasureState?.challenges && treasureState?.challenges?.length > 0 && (
    //     <View style={{ backgroundColor: "white", marginBottom: 10 }}>
    //       <Text
    //         style={{
    //           padding: 15,
    //           fontFamily: "raleway-bold",
    //           fontSize: hp(1.9),
    //         }}
    //       >
    //         Treasure Hunt
    //       </Text>
    //       <FlatList
    //         data={treasureState?.challenges}
    //         keyExtractor={(item, index) => index}
    //         showsHorizontalScrollIndicator={false}
    //         horizontal
    //         ItemSeparatorComponent={
    //           <View>
    //             <View style={{ height: 5 }} />
    //           </View>
    //         }
    //         renderItem={({ index, item }) => (
    //           <ChallengeHomeCardVisit
    //             now={now}
    //             challenge={item}
    //             user={user}
    //             key={index}
    //             index={index}
    //             arena={null}
    //             district={district}
    //           />
    //         )}
    //       />
    //     </View>
    //   )}
    // </View>
    <>
    </>
  );
  const FoodRoute = () => {
    return (
      <View
        style={{ backgroundColor: "#e5e5e5", flex: 1, padding: 10, gap: 10 }}
      >
        {trendingFood?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Trending Foods
            </Text>
            <FlatList
              data={trendingFood?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="food" />
              )}
            />
          </View>
        )}
        {foodChallenge?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Breakfast
            </Text>
            <FlatList
              data={foodChallenge?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="food" />
              )}
            />
          </View>
        )}
        {biriyaniData?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Biryani
            </Text>
            <FlatList
              data={biriyaniData?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="food" />
              )}
            />
          </View>
        )}
      </View>
    );
  };
  const ExperienceRoute = () => {
    return (
      <View
        style={{ backgroundColor: "#e5e5e5", flex: 1, padding: 10, gap: 10 }}
      >
        {trendingExperience?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Trending Activity
            </Text>
            <FlatList
              data={trendingExperience?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="experience" />
              )}
            />
          </View>
        )}
        {experienceChallenge?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Arts
            </Text>
            <FlatList
              data={experienceChallenge?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="experience" />
              )}
            />
          </View>
        )}
        {entertainment?.challenges?.length > 0 && (
          <View style={{ backgroundColor: "white", padding: 10 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              Entertainment
            </Text>
            <FlatList
              data={entertainment?.challenges}
              keyExtractor={(item, index) => index}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 5 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <FoodDisplay item={item} key={index} type="experience" />
              )}
            />
          </View>
        )}
      </View>
    );
  };
  const SixthRoute = () => (
    <View>
      {filterChallenges?.length > 0 && (
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            backgroundColor: "white",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            style={{
              paddingHorizontal: 5,
              paddingTop: 10,
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              opacity: 1,
              paddingLeft: 10,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 2, alignItems: "center" }}
            >
              <Text
                style={{
                  fontFamily: "raleway-bold",
                  fontSize: hp(1.8),
                  textAlign: "center",
                }}
              >
                Trending In {selectedMovie.title}
              </Text>
            </View>
          </TouchableOpacity>
          {filterChallenges?.length > 0 && (
            <FlatList
              data={filterChallenges}
              keyExtractor={(item, index) => index.toString()}
              // contentContainerStyle={styles.moviesContainer}
              showsHorizontalScrollIndicator={false}
              horizontal
              ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
              renderItem={({ item }) => (
                <NewVisitCard
                  challenge={item}
                  selectedMovie={item.selectedTitle}
                />
              )}
            />
          )}
        </View>
      )}
      {allStates &&
        allStates?.districtsData?.length > 0 &&
        allStates?.districtsData.map((item, index) => {
          return (
            item.challenges?.length > 0 && (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: "100%",
                  width: "100%",
                  backgroundColor: "white",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 5,
                    paddingTop: 10,
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    opacity: 1,
                    paddingLeft: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "raleway-bold",
                        fontSize: hp(1.8),
                        textAlign: "center",
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
                {item.challenges?.length > 0 && (
                  <FlatList
                    data={item.challenges}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    ItemSeparatorComponent={() => (
                      <View style={{ height: 5 }} />
                    )}
                    renderItem={({ item }) => (
                      <NewVisitCard
                        challenge={item}
                        selectedMovie={item.selectedTitle}
                      />
                    )}
                  />
                )}
              </View>
            )
          );
        })}
    </View>
  );

  const SeventhRoute = () => (
    <View>
      {quizStateLive?.challenges && quizStateLive?.challenges?.length > 0 && (
        <View style={{ backgroundColor: "white", marginBottom: 10 }}>
          <Text
            style={{
              padding: 15,
              fontFamily: "raleway-bold",
              fontSize: hp(1.9),
            }}
          >
            Live Quiz
          </Text>
          <FlatList
            data={quizStateLive?.challenges}
            keyExtractor={(item, index) => index}
            showsHorizontalScrollIndicator={false}
            horizontal
            ItemSeparatorComponent={
              <View>
                <View style={{ height: 5 }} />
              </View>
            }
            renderItem={({ index, item }) => (
              <ChallengeHomeCardVisit
                now={now}
                challenge={item}
                user={user}
                key={index}
                index={index}
                arena={null}
                district={district}
              />
            )}
          />
        </View>
      )}
      {contestData?.challenges && contestData?.challenges?.length > 0 && (
        <View style={{ backgroundColor: "white", marginBottom: 10 }}>
          <Text
            style={{
              padding: 15,
              fontFamily: "raleway-bold",
              fontSize: hp(1.9),
            }}
          >
            Contest
          </Text>
          <FlatList
            data={contestData?.challenges}
            keyExtractor={(item, index) => index}
            showsHorizontalScrollIndicator={false}
            horizontal
            ItemSeparatorComponent={
              <View>
                <View style={{ height: 5 }} />
              </View>
            }
            renderItem={({ index, item }) => (
              <ChallengeHomeCardVisit
                now={now}
                challenge={item}
                user={user}
                key={index}
                index={index}
                arena={null}
                district={district}
              />
            )}
          />
        </View>
      )}
      {quizState?.challenges && quizState?.challenges?.length > 0 && (
        <View style={{ backgroundColor: "white", marginBottom: 10 }}>
          <Text
            style={{
              padding: 15,
              fontFamily: "raleway-bold",
              fontSize: hp(1.9),
            }}
          >
            Quiz
          </Text>
          <FlatList
            data={quizState?.challenges}
            keyExtractor={(item, index) => index}
            showsHorizontalScrollIndicator={false}
            horizontal
            ItemSeparatorComponent={
              <View>
                <View style={{ height: 5 }} />
              </View>
            }
            renderItem={({ index, item }) => (
              <ChallengeHomeCardVisit
                now={now}
                challenge={item}
                user={user}
                key={index}
                index={index}
                arena={null}
                district={district}
              />
            )}
          />
        </View>
      )}
    </View>
  );

  const NowRoute = () => (
    <View>
      {!alreadySelected &&
        (selectedMovie.type == "election" ||
          selectedMovie.type == "political-party") && (
          <View
            style={{
              backgroundColor: "white",
              marginTop: 15,
              paddingHorizontal: 10,
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,

              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: hp(2.2),
                textAlign: "center",
                fontFamily: "raleway-bold",
                marginVertical: 10,
              }}
            >
              Select your constituency
            </Text>
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 10,
                paddingVertical: 16,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,

                elevation: 2,
              }}
            >
              <Dropdown
                labelField="label"
                dropdownPosition="top"
                valueField="value"
                placeholderStyle={{ color: "black" }}
                placeholder="Select you State"
                data={items}
                value={states}
                onChange={(item) => {
                  setStates(item.value);
                }}
                search
                searchPlaceholder="Search your State.."
              />
            </View>
            <View
              style={{
                backgroundColor: "white",
                marginTop: 15,
                paddingHorizontal: 10,
                paddingVertical: 16,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,

                elevation: 2,
              }}
            >
              <Dropdown
                dropdownPosition="top"
                searchPlaceholder="Search your constituency.."
                labelField="label"
                valueField="value"
                search
                placeholderStyle={{ color: "black" }}
                placeholder="Select you constituency"
                data={constituentsList}
                value={constituency}
                onChange={(item) => {
                  setConstituency(item.value);
                }}
              />
            </View>
            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                marginTop: 10,
                padding: 15,
                backgroundColor: "#1e429f",
                borderRadius: 12,
              }}
              onPress={handleSubmit}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: hp(1.8),
                  fontFamily: "raleway",
                }}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );

  const renderScene = SceneMap({
    sixth: NowRoute,
    first: ChallengesRoute,
    fourth: SixthRoute,
    fifth: SeventhRoute,
    second: FourthRoute,
    third: FifthRoute,
    food: FoodRoute,
    experience: ExperienceRoute,
  });

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [Mainroutes] = useState([
    // { key: "Experience", title: "Experience" },
    { key: "Challenges", title: "Challenges" },
    { key: "Community", title: "Community" },
  ]);
  const [routes] = useState([
    // { key: "sixth", title: "NOW" },
    // { key: "fourth", title: "Places", parent: "Experience" },
    { key: "first", title: "Challenges", parent: "Challenges" },
    { key: "fifth", title: "Contest", parent: "Challenges" },
    // { key: "food", title: "Food", parent: "Experience" },
    // { key: "itinerary", title: "Itinerary", parent: "Experience" },
    { key: "experience", title: "Activity", parent: "Experience" },
    { key: "second", title: "People", parent: "Community" },
    { key: "third", title: "Posts", parent: "Community" },
    { key: "seventh", title: "Previous Challenges", parent: "Challenges" },
  ]);

  const renderContent = () => {
    switch (activeRouteIndex) {
      case "first":
        return <ChallengesRoute />;
      case "second":
        return <FourthRoute />;
      case "third":
        return <FifthRoute />;
      case "fourth":
        return <SixthRoute />;
      case "fifth":
        return <SeventhRoute />;
      case "sixth":
        return <NowRoute />;
      case "seventh":
        return <PrevRoute />;
      case "food":
        return <FoodRoute />;
      case "experience":
        return <ExperienceRoute />;
      case "itinerary":
        return <AirportRoute />;
      default:
        return <SixthRoute />;
    }
  };
  const PrevRoute = () => {
    return (
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        {completeOne?.challenges?.length > 0 &&
          completeOne?.challenges?.map((item, index) => {
            return (
              <ChallengeHomeCardVisit
                now={now}
                challenge={item}
                user={user}
                key={index}
                index={index}
                arena={null}
                district={district}
                completeOne={true}
              />
            );
          })}
      </View>
    );
  };
  return (
    <PaperProvider>
      {see && instructionData?.length > 0 && (
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            width: width,
            height: hp(92),
            zIndex: 250,
          }}
        >
          <SwiperFlatList
            // autoplay
            // autoplayDelay={2}
            // autoplayLoop
            ref={swiperRef}
            horizontal
            showPagination
            data={instructionData}
            renderItem={({ item, index }) => (
              <View
                style={[
                  {
                    flex: 1,
                    width: width,
                    justifyContent: "center",
                    alignItems: "center",

                    padding: 15,
                  },
                ]}
              >
                <View
                  style={{
                    flex: 1,
                    gap: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {item.image && (
                    <Image
                      source={{ uri: `${baseImgURL + item.image}` }}
                      style={{ width: wp(80), height: hp(60) }}
                      resizeMode="contain"
                    />
                  )}
                  {item.title && (
                    <Text
                      style={{
                        fontSize: hp(3),
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {item.title}
                    </Text>
                  )}
                  {item.description && (
                    <Text
                      style={{
                        fontSize: hp(2),
                        color: "white",
                        fontWeight: "500",
                        textAlign: "center",
                        lineHeight: 28,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>

                <View style={{ marginBottom: 10 }}>
                  {index + 1 == instructionData?.length ? (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        borderRadius: 12,
                        minWidth: wp(70),
                        backgroundColor: "blue",
                      }}
                      onPress={displayTuts}
                    >
                      <Text
                        style={{
                          fontSize: hp(1.9),
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Continue
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 15,
                        borderRadius: 12,
                        minWidth: wp(70),
                        backgroundColor: "blue",
                      }}
                      onPress={() => goToNextPage(index)}
                    >
                      <Text
                        style={{
                          fontSize: hp(1.9),
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Next
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )} // Ensure horizontal swiping
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
            }}
          />
          {/* </View> */}
        </BlurView>
      )}
      {isLoading || !selectedMovie ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={"red"} size={"small"} />
        </View>
      ) : (
        <ScrollView>
          <View style={styles.container}>
            <View style={{ position: "relative" }}>
              {/* <LinearGradient
                // Background Linear Gradient
                colors={["green", "#12372A"]}
                style={styles.LinearGradient}
                start={[0, 0]}
                end={[1, 0]}
                locations={[0.05, 1]} // Set the locations to define where each color starts and ends
              /> */}
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
                    <View
                      style={{
                        position: "relative",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: now ? wp(7) : 0,
                      }}
                    >
                      <Animated.View
                        style={[
                          {
                            padding: 3,
                            backgroundColor: "orange",
                            borderRadius: 120,
                          },
                          now && animatedStyle,
                        ]}
                      >
                        <Tooltip
                          backgroundColor
                          title="Page Info"
                          theme={{
                            colors: { primary: "blue" },
                            backgroundColor: "white",
                          }}
                        >
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                              
                              backgroundColor: "white",
                            
                              position: "relative",
                            }}
                            className="rounded-full p-2"
                          >
                            {selectedMovie.image?.length > 0 && (
                              <Image
                                source={{
                                  uri: `${baseImgURL + selectedMovie.image}`,
                                }}
                                resizeMode="contain"

                                style={{
                                  width: wp(13),
                                  height: wp(13),
                                }}
                              />
                            )}
                          </View>
                        </Tooltip>
                      </Animated.View>
                      {now && (
                        <View
                          className="absolute"
                          style={{
                            bottom: -wp(7),
                          }}
                        >
                          <Image
                            className="rounded-md"
                            source={require("../assets/images/now2.png")}
                            style={{
                              height: wp(8),
                              width: wp(10),
                              backgroundColor: "orange",
                            }}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                    </View>
                    <View style={{ gap: 7 }}>
                      <Text
                        style={{
                          fontSize: hp(2),
                          fontFamily: "raleway-bold",
                          color: "white",
                        }}
                      >
                        {selectedMovie.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: hp(1.5),
                          fontFamily: "raleway-semibold",
                          color: "white",
                        }}
                      >
                        {
                        selectedMovie?.type?.charAt(0).toUpperCase() +
                          selectedMovie?.type?.slice(1)
                          }
                      </Text>
                    </View>
                  </View>
                  <View style={{ gap: wp(2), position: "relative" }}>
                    {/* <Image
                      source={require("../assets/images/vip.png")}
                      style={{
                        minWidth: wp(5),
                        minHeight: wp(3),
                        maxHeight: wp(4),
                        maxWidth: wp(6),
                      }}
                    /> */}

                    <TouchableOpacity
                      onPress={() => setVisible(!visible)}
                      className="mr-2"
                    >
                      <Entypo
                        name="dots-three-vertical"
                        size={22}
                        color="white"
                      />
                    </TouchableOpacity>
                    <View
                      className="absolute bg-white top-2 right-6 rounded-md shadow duration-200 transition-all"
                      style={{
                        width: wp(50),
                        display: visible ? "flex" : "none",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setVisible(false);
                          navigation.navigate("FeedbackScreen", {
                            page_id: movieId,
                            user_id: user?.id,
                            type: "feedback",
                          });
                        }}
                        className="p-3"
                      >
                        <Text className="font-[raleway-bold]">Feedback</Text>
                      </TouchableOpacity>
                      <Divider />
                      <TouchableOpacity
                        onPress={() => {
                          setVisible(false);
                          navigation.navigate("FeedbackScreen", {
                            page_id: movieId,
                            user_id: user?.id,
                            type: "complaint",
                          });
                        }}
                        className="p-3"
                      >
                        <Text className="font-[raleway-bold]">Complaint</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginBottom: 10,
                }}
              >
                <View style={styles.profile_info}>
                  <Text style={styles.profileCount}>
                    {selectedMovie.followers}
                  </Text>
                  <Text style={styles.profileText}>Teammates</Text>
                </View>
                {/* <Divider
                  style={{
                    height: "auto",
                    width: 1,
                    backgroundColor: "#AFAFAF",
                  }}
                /> */}
                <View style={styles.profile_info}>
                  <Text style={styles.profileCount}>{totalPoints}</Text>
                  <Text style={styles.profileText}>Points</Text>
                </View>
                {/* <Divider
                  style={{
                    height: "auto",
                    width: 1,
                    backgroundColor: "#AFAFAF",
                  }}
                /> */}
                {/* <View style={styles.profile_info}>
                  <Text style={styles.profileCount}>
                    {selectedMovie.total_xp}
                  </Text>
                  <Text style={styles.profileText}>Xp</Text>
                </View> */}
                {/* <Divider
                  style={{
                    height: "auto",
                    width: 1,
                    backgroundColor: "#AFAFAF",
                  }}
                /> */}
                {/* <View style={styles.profile_info}>
                  <Text style={styles.profileCount}>{selectedMovie.level}</Text>
                  <Text style={styles.profileText}>Level</Text>
                </View> */}
              </View>
              {/* {isFollowing && (
                <View style={{ marginBottom: 10 }}>
                  <View
                    style={{
                      paddingHorizontal: 15,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={styles.Xp}>
                      {selectedMovie.this_level_xp} Xp
                    </Text>
                    <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: "white",
                        fontFamily: "raleway-bold",
                      }}
                    >
                      {selectedMovie.total_xp} Xp
                    </Text>
                    <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                    <Text style={styles.Xp}>
                      {selectedMovie.next_level_xp} Xp
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: 15,
                    }}
                  >
                    <ProgressBar
                      progress={selectedMovie.percent_to_next_level}
                      style={{ height: 5, borderRadius: 5 }}
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
                    <Text style={styles.Xp}>Level {selectedMovie.level}</Text>
                    <Divider style={{ flex: 1, backgroundColor: "#AFAFAF" }} />
                    <Text style={styles.Xp}>
                      Level {selectedMovie.next_level}
                    </Text>
                  </View>
                </View>
              )} */}
              {movieId && (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    flexDirection: "row",
                    marginBottom: 10,
                  }}
                >
                  <TouchableOpacity
                    className="bg-purple-700 rounded-full"
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 25,
                    }}
                    onPress={() => {
                      if (isFollowing) {
                        setShowAlert(true);
                      } else {
                        toggleFollow();
                      }
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(1.6),
                        color: "white",
                        fontFamily: "raleway-bold",
                      }}
                    >
                      {isFollowing
                        ? "Following"
                        : totalPoints > 0
                        ? "Follow Again"
                        : "Follow"}
                    </Text>
                  </TouchableOpacity>
                  {isFollowing && (
                    <>
                      <TouchableOpacity
                        className="bg-purple-700 rounded-full"
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 25,
                          
  
                        }}
                        onPress={() =>
                          navigation.navigate("LeaderScreen", {
                            pageId: movieId,
                          })
                        }
                      >
                        <Text
                          style={{
                            fontSize: hp(1.6),
                            color: "white",
                            fontFamily: "raleway-bold",
                          }}
                        >
                          Leaderboard
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="bg-purple-700 rounded-full"
                        style={{
                          paddingVertical: 10,
                          paddingHorizontal: 25,
                          
  
                        }}
                        onPress={() =>
                          navigation.navigate("UserRewards", {
                            movieId: movieId,
                          })
                        }
                      >
                        <Text
                          style={{
                            fontSize: hp(1.6),
                            color: "white",
                            fontFamily: "raleway-bold",
                          }}
                        >
                          Rewards
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
              <BlurView
                intensity={50}
                tint="dark"
                style={{
                  overflow: "hidden",
                  borderTopColor: "white",
                  borderWidth: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  {Mainroutes.map((route, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={{
                          paddingHorizontal: 20,
                          paddingTop: 20,
                          paddingBottom: 10,
                          flex: 1,
                          borderBottomWidth:
                            mainRouteIndex === route.key ? 4 : 0,
                          borderBottomColor: "green",
                        }}
                        onPress={() => {
                          setMainRouteIndex(route.key);
                          setActiveRouteIndex(
                            route.title == "Challenges"
                              ? "first"
                              : route.title === "Experience"
                              ? "fourth"
                              : "second"
                          );
                        }}
                      >
                        <Text
                          style={{
                            fontSize: hp(1.5),
                            color: "white",
                            fontFamily:
                              mainRouteIndex === route.key
                                ? "raleway-extra"
                                : "raleway",
                          }}
                        >
                          {route.title.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {routes.map((route, index) => {
                    if (route.parent === mainRouteIndex) {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={{
                            padding: 20,
                            justifyContent: "center",
                            paddingHorizontal: 20,
                            paddingTop: 10,
                            paddingBottom: 20,
                            minWidth:
                              mainRouteIndex == "Community" ? wp(50) : wp(33),
                          }}
                          onPress={() => setActiveRouteIndex(route.key)}
                        >
                          <Text
                            style={{
                              fontSize: hp(1.3),
                              color: "white",
                              textAlign: "center",
                              fontFamily:
                                activeRouteIndex === route.key
                                  ? "raleway-extra"
                                  : "raleway",
                            }}
                          >
                            {activeRouteIndex === route.key
                              ? route.title.toUpperCase()
                              : 
                              route?.title?.charAt(0).toUpperCase() +
                                route?.title?.slice(1).toLowerCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    } else {
                      return null; // or you can render something else or nothing at all
                    }
                  })}
                </ScrollView>
              </BlurView>
            </View>

            {!isLoading && selectedMovie && renderContent()}

            <StatusBar style="light" />
          </View>
        </ScrollView>
      )}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={`Unfollow ${selectedMovie?.title}`}
        message={`Are you sure you want to unfollow ${selectedMovie?.title} ?`}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText="Unfollow"
        confirmButtonColor="#DD6B55"
        onCancelPressed={() => setShowAlert(false)}
        onConfirmPressed={() => {
          toggleFollow();
          setShowAlert(false);
        }}
      />
    </PaperProvider>
  );
};

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
  topLogo: {
    height: 50,
    width: 50,
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
    color: "white",
    fontFamily: "raleway-bold",
  },
  containerStyle: {
    backgroundColor: "transparent",
    padding: 20,
    shadowColor: "transparent",
  },
});

export default Moviehome;
