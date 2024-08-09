import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { baseImgURL, baseURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import axios from "axios";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import * as Location from "expo-location";
import { GOOGLE_MAPS_APIKEY } from "../constants";

const TaskCard = ({ item, index, userId,disabled=false }) => {
  const frequency = item.frequency;
  const [isCompleted, setisCompleted] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState([]);
  // console.log(item.task_id)
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [district, setDistrict] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

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

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
    if (district) {
      text += `\nDistrict: ${district}`;
    }
  }
  useFocusEffect(
    useCallback(() => {
      // console.log(text)
      const fetchCompleted = async () => {
        try {
          const response = await axios.get(
            `${baseURL}/checkTaskCompleted.php?task_id=${item.task_id}&user_id=${userId}`
          );
          if (response.status === 200) {
            // console.log(response.data.completed);
            // console.log(response.data);
            const isTaskCompleted =
              response.data.completed == "true" ? true : false;

            // console.log(isTaskCompleted);
            setisCompleted(isTaskCompleted);
          } else {
            console.error("Failed to fetch task details");
          }
        } catch (error) {
          console.error("Error while fetching task details:", error.message);
        }
      };

      if (item.challenge_type == "ordered") {
        fetchCompleted();
      }
    }, [isFocused])
  );
  // console.log(frequency)
  if (isCompleted && frequency == "treasure") {
    return;
  }
  return (
    <TouchableOpacity
      style={[styles.movieBlock]}
      activeOpacity={isCompleted ? 1 : 0.8}
      onPress={() =>
        !isCompleted &&
        navigation.navigate("TaskDetails", {
          challenge: item,
        })
      }
      disabled={disabled}
    >
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,

          elevation: 8,
          backgroundColor: "white",
          paddingVertical: 10,
          paddingHorizontal:18,
          borderRadius: 30,
        }}
      >
        <Text style={{fontSize:hp(2),fontFamily: "raleway"}}>{index + 1}</Text>
      </View>
      <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
        <Image
          source={{ uri: `${baseImgURL + item.image}` }}
          style={{ ...styles.movieImage, opacity: isCompleted ? 0.5 : 1 }}
        />
        <Text style={{ ...styles.movieName, opacity: isCompleted ? 0.5 : 1 }}>
          {item.task_name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  movieName: {
    fontSize: 18,
    fontFamily: "raleway-bold",
    textAlign: "center",
    marginTop: 5,
  },
  languageName: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 1,
  },
  movieImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: 3,
  },
  movieBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems:"center",
    gap:8,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
