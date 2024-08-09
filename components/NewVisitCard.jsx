import React, { useState, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { baseImgURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const NewVisitCard = ({ selectedMovie, challenge }) => {
  const [completedData, setCompletedData] = useState(false);
  // const [unlockChallenge, setUnlockChallenge] = useState(
  //   challenge.open_for == "location" ? false : true
  // );
  const navigation = useNavigation();

  // console.log(challenge.finished)

  useEffect(() => {
    if (challenge.completed === "true") {
      setCompletedData(true);
    }
  }, [challenge.completed]);

  let formattedEndDate;
  let formattedDate;

  formattedDate = moment(challenge.start_date).fromNow();
  const endDate = moment(challenge.end_date);
  const now = moment();
  const duration = moment.duration(endDate.diff(now));

  if (duration.asDays() >= 1) {
    formattedEndDate = Math.round(duration.asDays()) + " days";
  } else if (duration.asHours() >= 1) {
    formattedEndDate =
      Math.floor(duration.asHours()) +
      ":" +
      (duration.minutes() < 10 ? "0" : "") +
      duration.minutes() +
      " hrs";
  } else {
    formattedEndDate = duration.minutes() + " minutes";
  }
  
  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 5,
      }}
    >
      <TouchableOpacity
        style={{ marginTop: 8 }}
        onPress={() => {
          if (!completedData ) {
            navigation.navigate("ChallengeDetails", {
              pageId: challenge.page_id,
              challenge: challenge,
              selectedMovie: selectedMovie,
            });
          }else{
            console.log("pressed")
          }
        }}
      >
        <View
          style={{
            padding: 5,
            flexDirection: "row",
            gap: 10,
            opacity: completedData ? 0.5 : 1,
            
          }}
        >
          <View>
            <Image
              source={{ uri: `${baseImgURL + challenge.image}` }}
              style={{
                width: wp(28),
                minHeight: wp(28),
                borderRadius: 15,
                borderColor:"lightgray",
                borderWidth:1,
                // opacity:unlockChallenge ? 1: 0.3
              }}
              resizeMode="cover"
            />
            <Text
              style={{
                fontSize: hp(1.9),
                fontFamily: "raleway-semibold",
                textAlign: "center",
              }}
            >
              {challenge.title.length > 12
                ? challenge.title.slice(0, 12) + "..."
                : challenge.title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {completedData && challenge.finished=="true" &&(
        <Image
          source={require("../assets/images/badge.png")}
          style={{
            width: wp(12),
            height: wp(12),
            borderRadius: 15,
            position: "absolute",
            top: 0,
            right: 5,
          }}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default NewVisitCard;

const styles = StyleSheet.create({});
