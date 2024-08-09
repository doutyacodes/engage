import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { baseImgURL, baseURL } from "../backend/baseData";
import moment from "moment";

import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import axios from "axios";
import Posts from "./Posts";
import CertificateList from "./CertificateList";
import NewBuzzChallenge from "./AppComponents/NewBuzzChallenge";
import UserPosts from "./UserPosts";
import GreetingsComponent from "./AppComponents/GreetingsComponent";

const ChallengeHomeCard = ({
  challenge,
  index,
  user,
  arena,
  district,
}) => {
  const [selectedMovie, setSelectedMovie] = useState([]);
// alert(challenge.already_liked)
  // console.log(challenge.page_id)
  const navigation = useNavigation();
  useEffect(() => {
    const fetchMovie = async () => {
      if (challenge.info_type == "challenge" || arena == "yes") {
        try {
          if (!user || !user.id) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }

          const response = await axios.get(
            `${baseURL}/getOneChallenge.php?id=${challenge.page_id}&userId=${user.id}&district=${district}`
          );

          // console.log(response.data);
          if (response.status === 200) {
            setSelectedMovie(response.data);
          } else {
            console.error("Failed to fetch getOneChallenge");
          }
        } catch (error) {
          console.error("Error while fetching getOneChallenge:", error.message);
        }
      }
    };

    fetchMovie();
  }, [user]);

  if (challenge.completed == "true") {
    return;
  }
  let formattedEndDate;
  let formattedDate;

  if (challenge.info_type == "challenge" || arena == "yes") {
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
  }
  // alert(challenge.user_referral_count)
  return (
    <View key={index}>
      {challenge.info_type == "challenge" || arena == "yes" ? (
        <NewBuzzChallenge challenge={challenge} formattedDate={formattedDate} formattedEndDate={formattedEndDate} />
      ) : challenge.info_type == "post" ? (
        <Posts item={challenge} user_id={user?.id} />
      ) : challenge.info_type =="user_post" ? (
        <UserPosts
        item={challenge}
        index={1}
        user_id={user.id}
        arena={null}
      />
      ):challenge.info_type =="greetings_history" ? (
        <GreetingsComponent
        item={challenge}
        index={1}
        user_id={user.id}
        arena={null}
      />
      ): (
        <CertificateList
          item={challenge}
          index={index}
          user_id={user?.id}
          arena={null}
        />
      )}
    </View>
  );
};

export default ChallengeHomeCard;

const styles = StyleSheet.create({});
