// BuzzwallScreen.js
import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome, AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChallengeHomeCard from "./ChallengeHomeCard";
import { Divider, Modal, PaperProvider, Portal } from "react-native-paper";
import LottieView from "lottie-react-native";
import SwiperFlatList from "react-native-swiper-flatlist";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { GOOGLE_MAPS_APIKEY } from "../constants";
import { Entypo } from "@expo/vector-icons";
import TopBar from "./AppComponents/TopBar";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/Colors";
import Companies from "./AppComponents/Companies";
const BuzzwallScreen = () => {
  const navigation = useNavigation();
  const [textDataBottom, setTextDataBottom] = useState("");
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [see, setSee] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [filterChallenges, setFilterChallenges] = useState([]);
  const isFocused = useIsFocused();
  const [loginData, setLoginData] = useState([]);
  const [instructionData, setInstructionData] = useState([]);
  const [goldStar, setGoldStar] = useState(0);
  const [grayStar, setGrayStar] = useState(7);
  const [currentPage, setCurrentPage] = useState(0); // State to keep track of current page
  const swiperRef = useRef(null); // Ref for SwiperFlatList component
  const [location, setLocation] = useState(null);
  const [delay, setDelay] = useState(false);
  const [district, setDistrict] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [nowData, setNowData] = useState([]);
  const [country, setCountry] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchLocation();
    }, [isFocused])
  );
  const fetchLocation = async () => {
    setDelay(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("stus", status);

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
      const countryComponent = addressComponents.find((component) =>
        component.types.includes("country")
      );
      setDistrict(districtComponent.long_name);
      setCountry(countryComponent.long_name);
    } catch (error) {
      console.error("Error fetching district:", error);
    } finally {
      setDelay(false);
    }
  };
  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
    if (district) {
      text += `\nDistrict: ${district}`;
    }
  }

  useEffect(() => {
    const fetchallenge = async () => {
      if (district || country) {
        try {
          // Only fetch rewards if user data is available
          let countryNow;
          if (country) {
            countryNow = `&country=${country}`;
          }
          const response = await axios.get(
            `${baseURL}/getNow.php?district=${district}${countryNow}`
          );

          if (response.status === 200) {
            setNowData(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch challenges");
          }
        } catch (error) {
          console.error("Error while fetching challenges:", error.message);
        }
      }
    };
    // fetchallenge();
  }, [district, country]);
  const goToNextPage = (index) => {
    if (index <= instructionData.length) {
      if (swiperRef.current) {
        swiperRef.current.scrollToIndex({ index: index + 1, animated: true }); // Navigate to the next page
      }
    }
  };
  // Function to open the bottom sheet

  const displayTuts = async () => {
    await AsyncStorage.setItem("buzzwall", "true");

    setSee(false);
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          if (storedUser?.steps == 1) {
            PassNav = "DetailSignup";
          }
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
    const fetchData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("buzzwall");
        if ((storedUser || isVisibleModal) && storedUser) {
          setSee(false);
        } else {
          setSee(true);
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchData();
  }, []);
  // console.log(goldStar)
  useFocusEffect(
    useCallback(() => {
      const fetchallenge = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            const response = await axios.get(
              `${baseURL}/getBuzzWall.php?userId=${user.id}`
            );
            console.log("getBuzzWall", response.data);

            if (response.status === 200) {
              setFilterChallenges(response.data);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch buzzwall");
            }
          } catch (error) {
            console.error("Error while fetching buzzwall:", error.message);
          } finally {
            setIsLoading(false);
          }
        }
      };
      fetchallenge();
      fetchLocation();
    }, [user])
  );
  useEffect(() => {
    const fetchInstruction = async () => {
      try {
        // Only fetch rewards if user data is available
        const response = await axios.get(
          `${baseURL}/getInstructions.php?type=buzzwall`
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
    const fetchDailyLogin = async () => {
      if (user) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.post(
            `${baseURL}/dailyLoginApi.php`,
            {
              user_id: user.id,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
          // console.log(response.data)
          if (response.status == 200) {
            // console.log(response.data);
            if (response.data.already_logged == "no") {
              setLoginData(response.data);
              setIsVisibleModal(true);
              const goldValue = parseInt(response.data.login_count);
              // console.log(response.data.login_count);
              setGoldStar(goldValue);
              setGrayStar(7 - goldValue);
            }
          } else {
            console.error("Failed to fetch login");
          }
        } catch (error) {
          console.error("Error while fetching login:", error.message);
        }
      }
    };
    fetchDailyLogin();
  }, [user, isLoading]);
  // Pagination appearance customization:

  const FirstRoute = () => (
    <PaperProvider style={{ flex: 1, height: "100%", width: "100%" }}>
      {/* <Portal>
        <Modal
          dismissable={false}
          // visible={true}
          visible={isVisibleModal}
          onDismiss={() => setIsVisibleModal(false)}
          contentContainerStyle={styles.containerStyle}
        >
          <View
            style={{
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.37,
              shadowRadius: 7.49,

              elevation: 12,
              minHeight: hp(45),
              borderRadius: 15,
              flex: 1,
              padding: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ marginTop: 20, marginBottom: 30 }}>
              <Text style={{ textAlign: "center", fontSize: hp(2.2) }}>
                Daily Login
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                // flex: 1,
              }}
            >
              {loginData &&
                loginData.already_logged == "no" &&
                [...Array(goldStar)].map((_, index) => {
                  // console.log("Rendering gold star:", index);
                  return (
                    <Image
                      source={require("../assets/images/gift-open.gif")}
                      key={`gold-star-${index}`}
                      style={{ height: wp(10), width: wp(10) }}
                    />
                  );
                })}
              {loginData &&
                loginData.already_logged == "no" &&
                [...Array(grayStar)].map((_, index) => {
                  // console.log("Rendering gray star:", index);
                  return (
                    <Image
                      source={require("../assets/images/gift.gif")}
                      key={`gray-star-${index}`}
                      style={{ height: wp(10), width: wp(10) }}
                    />
                  );
                })}
            </View>
            <TouchableOpacity
              onPress={() => setIsVisibleModal(false)}
              style={{
                padding: 15,
                marginBottom: 10,
                backgroundColor: "red",
                minWidth: wp(20),
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: hp(2),
                  color: "white",
                  fontFamily: "raleway-bold",
                }}
              >
                Ok
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal> */}

      <FlatList
        data={filterChallenges}
        // data={[]}
        ListEmptyComponent={() => (
          <View className="flex-1 min-h-[70vh] justify-center items-center">
            <Text
              style={{ fontFamily: "raleway-bold" }}
              className="text-xl text-center"
            >
              No items for display now!
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => index} // Updated keyExtractor function
        contentContainerStyle={styles.moviesContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 15 }} />
          </View>
        }
        renderItem={({ index, item }) => (
          <ChallengeHomeCard
            challenge={item}
            user={user}
            key={index}
            index={index}
            arena={null}
          />
        )}
      />
    </PaperProvider>
  );

  // const apple ="Apple";
  if (delay) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }
  if (!location && !delay) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: "flex-end",
            position: "relative",
            padding: 15,
            gap: 20,
          },
        ]}
      >
        <Text
          style={{
            fontSize: hp(3),
            color: "white",
            fontWeight: "bold",
          }}
        >
          Grant Location Permissions
        </Text>
        <Text
          style={{
            fontSize: hp(2),
            color: "white",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          To provide you with tailored services and relevant information, Wowfy
          needs access to your device's location!
        </Text>
        <View
          style={{
            flex: 1,
            zIndex: -10,
            backgroundColor: "black",
            opacity: Platform.OS == "ios" ? 0.6 : 0.8,
            height: hp(100),
            width: wp(100),
            position: "absolute",
          }}
        />
        <Image
          source={require("../assets/images/location1.jpeg")}
          style={{
            flex: 1,
            position: "absolute",
            height: hp(100),
            width: wp(100),
            zIndex: -15,
          }}
        />
        <TouchableOpacity
          style={{
            marginBottom: 50,
            padding: 20,
            backgroundColor: "#e77721",
            borderRadius: 10,
          }}
          onPress={fetchLocation}
        >
          <Text
            style={{
              fontSize: hp(2),
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  const { width, height } = Dimensions.get("window");
  return (
    <View style={styles.container}>
      {/* <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            width: width,
            height: hp(100),
            zIndex: -250,
          }}
        > */}
      {/* <View style={{position:"absolute",top:0,zIndex:-200}}>
        <Image source={require("../assets/images/doodle2.png")} style={{height:hp(100),width:wp(100),opacity:0.75}} />
      </View> */}
      {/* </BlurView> */}

      {
        // see && instructionData?.length > 0 && (
        //   <BlurView
        //     intensity={100}
        //     tint="dark"
        //     style={{
        //       position: "absolute",
        //       width: width,
        //       height: hp(93),
        //       zIndex: 250,
        //     }}
        //   >
        //     <SwiperFlatList
        //       // autoplay
        //       // autoplayDelay={2}
        //       // autoplayLoop
        //       ref={swiperRef}
        //       horizontal
        //       showPagination
        //       data={instructionData}
        //       renderItem={({ item, index }) => (
        //         <View
        //           style={[
        //             {
        //               flex: 1,
        //               width: width,
        //               justifyContent: "center",
        //               alignItems: "center",
        //               padding: 15,
        //             },
        //           ]}
        //         >
        //           <View
        //             style={{
        //               flex: 1,
        //               gap: 20,
        //               justifyContent: "center",
        //               alignItems: "center",
        //             }}
        //           >
        //             {item.image && (
        //               <Image
        //                 source={{ uri: `${baseImgURL + item.image}` }}
        //                 style={{ width: wp(80), height: hp(60) }}
        //                 resizeMode="contain"
        //               />
        //             )}
        //             {item.title && (
        //               <Text
        //                 style={{
        //                   fontSize: hp(3),
        //                   color: "white",
        //                   fontWeight: "bold",
        //                 }}
        //               >
        //                 {item.title}
        //               </Text>
        //             )}
        //             {item.description && (
        //               <Text
        //                 style={{
        //                   fontSize: hp(2),
        //                   color: "white",
        //                   fontWeight: "500",
        //                   textAlign: "center",
        //                   lineHeight: 28,
        //                 }}
        //               >
        //                 {item.description}
        //               </Text>
        //             )}
        //           </View>
        //           <View style={{ marginBottom: 10 }}>
        //             {index + 1 == instructionData?.length ? (
        //               <TouchableOpacity
        //                 style={{
        //                   paddingHorizontal: 15,
        //                   paddingVertical: 15,
        //                   borderRadius: 12,
        //                   minWidth: wp(70),
        //                   backgroundColor: "blue",
        //                 }}
        //                 onPress={displayTuts}
        //               >
        //                 <Text
        //                   style={{
        //                     fontSize: hp(1.9),
        //                     color: "white",
        //                     textAlign: "center",
        //                     fontWeight: "bold",
        //                   }}
        //                 >
        //                   Continue
        //                 </Text>
        //               </TouchableOpacity>
        //             ) : (
        //               <TouchableOpacity
        //                 style={{
        //                   paddingHorizontal: 15,
        //                   paddingVertical: 15,
        //                   borderRadius: 12,
        //                   minWidth: wp(70),
        //                   backgroundColor: "blue",
        //                 }}
        //                 onPress={() => goToNextPage(index)}
        //               >
        //                 <Text
        //                   style={{
        //                     fontSize: hp(1.9),
        //                     color: "white",
        //                     textAlign: "center",
        //                     fontWeight: "bold",
        //                   }}
        //                 >
        //                   Next
        //                 </Text>
        //               </TouchableOpacity>
        //             )}
        //           </View>
        //         </View>
        //       )} // Ensure horizontal swiping
        //       paginationDefaultColor="gray" // Change inactive dot color
        //       paginationActiveColor="gray" // Change active dot color
        //       paginationStyleItem={{
        //         width: 5, // Adjust individual dot width
        //         height: 5, // Adjust individual dot height
        //         borderRadius: 6, // Make dots round
        //         margin: 5,
        //         marginTop: 10, // Space between dots
        //       }}
        //       paginationStyleItemActive={{
        //         opacity: 1, // Ensure active dot is fully opaque
        //       }}
        //       paginationStyleItemInactive={{
        //         opacity: 0.5, // Give inactive dots a subtle transparency
        //       }}
        //     />
        //     {/* </View> */}
        //   </BlurView>
        // )
      }
      <View>
        <TopBar marginTop={40} user={user} />
        <LinearGradient
          start={{ x: 0.5, y: 0 }} // Start from the top center
          end={{ x: 0.5, y: 1 }}
          colors={["rgba(253, 185, 38,1)", "rgba(253, 185, 38, 0.8)"]}
          style={{ width: "100%" }}
        >
          <Companies />
        </LinearGradient>
        <View className="p-3 my-2">
          <Text
            className="text-lg text-left"
            style={{ fontFamily: "raleway-bold" }}
          >
            Buzzwall
          </Text>
        </View>
      </View>
      {/* {nowData && (
        <>
          <Divider />

          <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: hp(2),
                  fontFamily: "raleway-bold",
                  marginBottom: 10,
                }}
              >
                Now
              </Text>
            </View>
            <FlatList
              ItemSeparatorComponent={
                <View>
                  <View style={{ width: 10 }} />
                </View>
              }
              data={nowData}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Moviehome", {
                        movieId: item.id,
                        now: "yes",
                      })
                    }
                    style={{
                      maxWidth: wp(25),
                      gap: 5,
                      alignItems: "center",
                    }}
                  >
                    {item.type == "places" && (
                      <Entypo name="location-pin" size={17} color="red" />
                      // <AntDesign name="qrcode" size={21} color="blue" />
                    )}
                    <View
                      style={{
                        borderColor: "#AFAFAF",
                        borderWidth: 1,
                        borderRadius: wp(22),
                      }}
                    >
                      <Image
                        source={{ uri: `${baseImgURL + item.image}` }}
                        style={{
                          height: wp(15),
                          width: wp(15),
                          borderRadius: wp(17),
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        textAlign: "center",
                        overflow: "hidden",
                        fontFamily: "raleway-semibold",
                        fontSize: hp(1.4),
                      }}
                    >
                      {" "}
                      {item.title.length > 10
                        ? item.title.slice(0, 10) + "..."
                        : item.title}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              horizontal
            />
          </View>
        </>
      )} */}
      <View className="w-full py-[1px] bg-orange-300" />
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>BUZZ WALL</Text> */}
      {/* <Image
          source={require("../assets/images/buzzbg.jpg")}
          style={{
            height: 55,
            width: wp(100),
            position: "absolute",
            top: 0,
            zIndex: -20,
          }}
        /> */}
      {/* </View> */}
      <FirstRoute />

      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    // backgroundColor:"#e5e5e5"
  },
  topLogo: {
    height: 50,
    width: 50,
    // marginTop: 50,
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
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
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
    position: "relative",
  },
  title: {
    fontSize: 25,
    // fontFamily: "poppins-extra",
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
  containerStyle: {
    backgroundColor: "transparent",
    padding: 20,
    shadowColor: "transparent",
  },
});

export default BuzzwallScreen;
