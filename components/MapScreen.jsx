import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import MapView, {
  Marker,
  Circle,
  AnimatedRegion,
  Polygon,
} from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import axios from "axios";
import { Modal, PaperProvider, Portal } from "react-native-paper";
import LottieView from "lottie-react-native";
import { GOOGLE_MAPS_APIKEY } from "../constants";
import { baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const { width, height } = Dimensions.get("window");
import { StackActions } from "@react-navigation/native";
import { Entypo, AntDesign } from "@expo/vector-icons";

const MapScreen = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [visible, setVisible] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [address, setAddress] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState();
  const [newChallenges, setNewChallenges] = useState();
  const [newSteps, setNewSteps] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentPlace, setCurrentPlace] = useState("");
  const mapRef = useRef(null); // Add this line

  const [animatedRegion, setAnimatedRegion] = useState(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    })
  );

  const {
    Title,
    latitudes,
    longitudes,
    reach_distance,
    userSId,
    challenge,
    maxSteps,
    userTaskId,
    tasks,
  } = route.params;
  const mode = "driving";
  const navigation = useNavigation();
  // console.log(userSId);
  const showModal = () => {
    setVisible(true);
  };
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser);
        } else {
          navigation.replace("OtpVerification");
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);
  const hideModal = () => setVisible(false);

  const isFocused = useIsFocused();
  const initLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (newLocation) => {
          setLocation(newLocation);
          setOrigin({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);

      let location = await Location.getCurrentPositionAsync({});
      const { latitude: currentLatitude, longitude: currentLongitude } =
        location.coords;

      setLocation(location);
      setOrigin({
        latitude: currentLatitude,
        longitude: currentLongitude,
      });
      setDestination({
        latitude: parseFloat(latitudes),
        longitude: parseFloat(longitudes),
      });

      const currentAddress = await getAddressFromCoordinates(
        currentLatitude,
        currentLongitude
      );
      setAddress(currentAddress);

      distanceKM(
        `${currentLatitude},${currentLongitude}`,
        `${latitudes},${longitudes}`
      );
    } catch (error) {
      console.error("Error initializing location:", error);
    }finally{
      setIsLoading(false);

    }
  };
  useFocusEffect(
    useCallback(() => {
      
      getLocationName();
    }, [isFocused])
  );
  useEffect(()=>{
    initLocation();

  },[isFocused,location])
  const getLocationName = async () => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitudes},${longitudes}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await axios.get(url);
      const { results } = response.data;
      if (results && results.length > 0) {
        setCurrentPlace(results[0].address_components[2].long_name);
        // console.log(results[0].address_components[2].long_name);
      } else {
        setCurrentPlace("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };
  useEffect(() => {
    if (location) {
      setAnimatedRegion({
        latitude: parseFloat(location.coords.latitude),
        longitude: parseFloat(location.coords.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const handleCompletion = () => {
    navigation.dispatch(StackActions.popToTop());
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await axios.get(url);
      const currentAddress = response.data.results[0].formatted_address;
      setAddress(currentAddress);
      return currentAddress;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  const distanceKM = async (origins, destinations) => {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=${mode}&key=${GOOGLE_MAPS_APIKEY}`;

    try {
      const response = await axios.get(url);
      const currentDistance = response.data.rows[0].elements[0].distance.text;

      setDistance(currentDistance);

      const extractedNumbersString = currentDistance.replace(/[^0-9.]/g, "");
      const extractedNumbers = parseFloat(extractedNumbersString) * 1000;
      console.log("extracted/1000",(extractedNumbers/1000))
      console.log("extracted",(extractedNumbers))
      console.log("reached",reach_distance)
      if ((extractedNumbers/1000) <= reach_distance) {
        const endProgress = async () => {
          try {
            const response = await axios.post(
              `${baseURL}/userEndProgress.php`,
              {
                userTaskId: userTaskId,
                steps: 0,
                challenge_id: challenge.challenge_id,
                userId: userSId,
                end: "yes",
                task_id: tasks.task_id,
              },
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            // console.log(response.data);
            if (response.status === 200) {
              console.log("Success");
              showModal();
            } else {
              console.error(
                "Error4:",
                response.data ? response.data.error : "Unknown error"
              );
            }
          } catch (error) {
            console.error("Error3:", error.message);
          }
        };
        endProgress();

        if (tasks.multiple == "yes") {
          try {
            const response = await axios.get(
              `${baseURL}/checkNextTaskExist.php?task_id=${tasks.task_id}&challenge_id=${tasks.challenge_id}&user_id=${user?.id}`
            );
            if (response.data.next == "yes") {
              setNewChallenges(response.data);
              setNewSteps(response.data.steps);
              setDirection(response.data.direction);
              try {
                const response2 = await axios.post(
                  `${baseURL}/createUserTasks.php`,
                  {
                    task_id: response.data.task_id,
                    user_id: userSId,
                    entry_points: response.data.entry_points,
                  },
                  {
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                  }
                );
                const userTaskId = response2.data.task.userTaskId;
              } catch (error) {
                console.error("Error2:", error);
              }
            }
          } catch (error) {
            console.error("Error1:", error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
    }
  };
  const mapCustomStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];
  const districtPolygons = [
    // Example Polygon for District 1
    [
      { latitude: 12.5547, longitude: 74.8635 },
      { latitude: 12.5547, longitude: 77.0374 },
      { latitude: 8.8932, longitude: 77.0374 },
      { latitude: 8.8932, longitude: 74.0997 },
      { latitude: 12.5547, longitude: 74.0997 },
    ],

    // Add more polygons for other districts as needed
  ];
  // console.log(tasks)
  const renderDistricts = () => {
    return districtPolygons.map((polygon, index) => (
      <Polygon
        key={index}
        coordinates={polygon}
        strokeColor="rgba(0,0,255,0.5)"
        fillColor="rgba(0,0,255,0.1)"
      />
    ));
  };
  useEffect(() => {
    if (origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
        animated: true,
      });
    }
  }, [origin, destination]);

  return (
    <PaperProvider style={{ flex: 1 }}>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.containerStyle}
          dismissable={false}
        >
          <View style={styles.successContainer}>
            <Text
              style={{
                fontSize: 35,
                color: "#0096b1",
                fontFamily: "raleway-bold",
                letterSpacing: 2,
              }}
            >
              CHALLENGE COMPLETED
            </Text>
            <LottieView
              source={require("../assets/animation/success.json")}
              style={{ width: 250, height: 250 }}
              autoPlay
              loop
            />
            {/* <TouchableOpacity
              style={{
                ...styles.btn3,
                marginBottom: 10,
                backgroundColor: "blue",
              }}
              onPress={() =>
                navigation.replace("SelfieScreenShare", {
                  userSId,
                  challenge,
                  tasks,
                  next: "no",
                })
              }
            >
              <Text style={styles.btnTxt3}>Share Your Moment With Us</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.btn} onPress={handleCompletion}>
              <Text style={styles.btnTxt}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
      <View style={styles.bgColor} />
      <ScrollView style={styles.DetailStart}>
        {isLoading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              marginTop: hp(45),
            }}
          >
            <ActivityIndicator size="large" color="red" />
          </View>
        ) : (
          <View style={styles.description}>
            {location && (
              <View style={styles.container}>
                <MapView
                  ref={mapRef} // Add this line
                  style={styles.map}
                  // customMapStyle={mapCustomStyle}
                  initialRegion={{
                    latitude: parseFloat(latitudes),
                    longitude: parseFloat(longitudes),
                    latitudeDelta: 1,
                    longitudeDelta: 1,
                  }}
                  showsUserLocation={true}
                  followsUserLocation={true}
                  moveOnMarkerPress
                >
                  {origin && destination && (
                    <MapViewDirections
                      origin={origin}
                      destination={destination}
                      apikey={GOOGLE_MAPS_APIKEY}
                      strokeWidth={2}
                      strokeColor="#3399ff"
                    />
                  )}
                  {destination && (
                    <Marker.Animated
                      coordinate={destination}
                      title="Your destination"
                      description="Reach this location"
                    />
                  )}
                  <Circle
                    center={{
                      latitude: parseFloat(latitudes),
                      longitude: parseFloat(longitudes),
                    }}
                    radius={parseFloat(reach_distance)}
                    strokeWidth={2}
                    strokeColor="#3399ff"
                    fillColor="rgba(128, 191, 255, 0.5)"
                  />
                  {/* {renderDistricts()} */}
                </MapView>
              </View>
            )}
            {!isLoading && (
              <View className="bg-white w-full flex-1 p-3 space-y-3">
                {address && (
                  <>
                    <Text className="text-slate-600 font-[raleway]">
                      Current Location
                    </Text>
                    <View className="flex-row gap-2">
                      <Entypo name="location-pin" size={24} color="red" />
                      <Text className="font-[raleway-bold] text-base">
                        {address}
                      </Text>
                    </View>
                  </>
                )}
                <Text className="text-slate-600 font-[raleway]">
                  Your Destination
                </Text>
                <View className="flex-row gap-2">
                  <Entypo name="location-pin" size={24} color="red" />
                  <Text className="font-[raleway-bold] text-base">
                    {tasks.task_name}
                  </Text>
                </View>
                {distance && (
                  <Text className="font-[raleway-bold] text-base text-center">
                    You are {distance.toUpperCase()}s away from{" "}
                    {tasks.task_name}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-2 top-12 z-40 rounded-full bg-black/50 shadow border border-slate-100 p-3"
        >
          <Entypo name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
      <StatusBar style="auto" />
    </PaperProvider>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  bgColor: {
    position: "relative",
    height: "100%",
    width: "100%",
    backgroundColor: "#e5e5e5",
    // opacity: 0.9,
  },
  DetailStart: {
    position: "absolute",
    flex: 1,
    height: "100%",
    width: "100%",
  },
  logo: {
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: 40,
    height: 110,
    width: 110,
  },
  description: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  heading: {
    marginRight: "auto",
    marginLeft: "auto",
    fontSize: 30,
    fontFamily: "raleway-bold",
    // color: "white",
  },
  container: {
    borderColor: "#fe8f48",
    borderWidth: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
  },
  map: {
    width: width * 1,
    height: height * 0.8,
  },
  location: {
    // color: "white",
    fontSize: 16,
    fontFamily: "raleway-bold",
  },
  distance: {
    // color: "white",
    fontSize: 20,
    fontFamily: "raleway-bold",
    paddingTop: 10,
    textAlign: "center",
    lineHeight: 30,
  },
  containerStyle: {
    backgroundColor: "transparent",
    padding: 20,
    shadowColor: "transparent",
  },
  btn: {
    marginRight: "auto",
    marginLeft: "auto",
    backgroundColor: "#3caf47",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  btnTxt: {
    fontSize: 20,
    color: "white",
    fontFamily: "raleway-semibold",
  },
  successContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt3: {
    fontSize: 20,
    color: "white",
    fontFamily: "raleway-semibold",
    textAlign: "center",
  },
  btn3: {
    alignItems: "center",
    backgroundColor: "#E32636",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: wp(80),
  },
});
