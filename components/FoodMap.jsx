import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_APIKEY } from "../constants";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Entypo, AntDesign } from "@expo/vector-icons";
import { baseImgURL, baseURL } from "../backend/baseData";
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet"; // Import BottomSheet from the library
import axios from "axios";

const FoodMap = ({ route }) => {
  const [mapRegion, setMapRegion] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const mapRef = useRef(null);

  const navigation = useNavigation();
  const { item, user_id } = route.params;
  // console.log(item);
  const destination = {
    latitude: parseFloat(item?.latitude),
    longitude: parseFloat(item?.longitude),
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  let locationSubscription = null;
  const locationCheck = async()=>{
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation);
        setMapRegion({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        const distance = getDistance(
          newLocation.coords.latitude,
          newLocation.coords.longitude,
          destination.latitude,
          destination.longitude
        );

        if (distance < 30 && !alertShown) {
          // Adjust the distance as needed (30 meters in this case)
          openBottomSheet();
          addProgress()
          setAlertShown(true);
        }
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [
              {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              },
              {
                latitude: destination.latitude,
                longitude: destination.longitude,
              },
            ],
            {
              edgePadding: { top: 20, right: 20, bottom: 20, left: 20 },
              animated: true,
            }
          );
        }
      }
    );
  }
  useEffect(() => {

    locationCheck()

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [alertShown]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
  };

  const bottomSheetRef = useRef(null);
  const openBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.expand();
      setBottomSheetOpen(true);
    }
  };

  const openCamera = async (id) => {
    try {
      const response = await axios.post(
        `${baseURL}/createUserChallenge.php`,
        {
          user_id: user_id,
          challenge_id: item.challenge_id,
          page_id: item.page_id,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(response.data);
      if (id) {
        if (response.data.success) {
          navigation.navigate("FoodApprovalScreen", {
            item: item,
            completed_id: response.data.completed_id,
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const addProgress = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/add-progress-store.php`,
        {
          user_id: user_id,
          challenge_id: item.challenge_id,
          store_id: item.store_id,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        openCamera();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // useEffect(() => {
  //   openBottomSheet();
  // }, []);
  return (
    <View style={styles.container}>
      {mapRegion ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker coordinate={destination} title="Destination" />

            <MapViewDirections
              origin={mapRegion}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor="#3399ff"
            />
          </MapView>
          <View className="bg-white w-full flex-1 p-3 space-y-3">
            <Text className="text-slate-600 font-[raleway]">
              Your Destination
            </Text>
            <View className="flex-row items-center gap-2">
              <Image
                source={{ uri: baseImgURL + item.image }}
                className="w-16 h-16 rounded-md"
              />
              <Entypo name="location-pin" size={24} color="red" />
              <Text className="font-[raleway-bold] text-xl ">
                {item.name.length > 20
                  ? `${item.name.substring(0, 20)}...`
                  : item.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute left-2 top-12 z-40 rounded-full bg-black/50 shadow border border-slate-100 p-3 "
          >
            <Entypo name="chevron-left" size={24} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="red" />
          {errorMsg && <Text>{errorMsg}</Text>}
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["40%"]}
        index={-1}
        onChange={(index) => console.log("Bottom Sheet Index:", index)}
      >
        <BottomSheetScrollView>
          <View className="mt-5">
            <View className="justify-center items-center px-5">
              <AntDesign name="checkcircle" size={hp(8)} color="green" />
              <Text
                className="mt-5 font-[raleway-bold] text-center"
                style={{ fontSize: hp(2.7) }}
              >
                You have reached your destination.
              </Text>
              <TouchableOpacity
                className="bg-red-500 mt-5 p-4 rounded-md flex-row items-center"
                style={{ gap: 10 }}
                onPress={() => openCamera("yes")}
              >
                <Entypo name="camera" size={24} color="white" />
                <Text
                  className="text-white font-[raleway]"
                  style={{ fontSize: hp(1.8) }}
                >
                  Open Camera
                </Text>
              </TouchableOpacity>
              <View className="mt-5 flex-row items-center" style={{ gap: 5 }}>
                <View className="border border-slate-500 p-0.5 rounded-full">
                  <Entypo name="info" size={hp(1.3)} color="gray" />
                </View>
                <Text className="text-slate-500" style={{ fontSize: hp(1.3) }}>
                  Please click the "Open Camera" once the food recieved.
                </Text>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  map: {
    width: "100%",
    height: hp(80),
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FoodMap;
