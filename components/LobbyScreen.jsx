import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { baseURL, baseVidUrl } from "../backend/baseData";
import axios from "axios";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { Audio } from "expo-av";

const LobbyScreen = ({ route }) => {
  const [user, setUser] = useState(null);
  const [quizData, setQuizData] = useState(null); // Initialize to null
  const [isQuizStarted, setIsQuizStarted] = useState(false); // Track quiz start
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time
  const navigation = useNavigation();
  const [progressPercentage, setProgressPercentage] = useState(0); // State to store progress percentage
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdown3, setCountdown3] = useState(-2);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [sound, setSound] = useState();
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!quizData) return; // Do nothing if quizData is not available

    // Parse start time and calculate difference in seconds
    const startTime = new Date(quizData.start_time);
    const timeDifferenceInSeconds = Math.floor(
      (currentTime.getTime() - startTime.getTime()) / 1000
    );

    // Calculate total duration of the quiz
    const quizDurationInSeconds =
      quizData.duration_hours * 3600 + quizData.duration_minutes * 60;

    // Calculate progress percentage
    const calculatedProgressPercentage = Math.min(
      (timeDifferenceInSeconds / quizDurationInSeconds) * 100,
      100
    );

    // Update progress percentage state
    setProgressPercentage(calculatedProgressPercentage);
  }, [quizData, currentTime]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
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
    const fetchQuiz = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getSingleQuiz.php?userId=${user?.id}&challenge_id=${route.params.challenge.challenge_id}`
          );

          if (response.status === 200) {
            // console.log("live", response.data.challenges.challenge_id);
            // alert(response.data.challenges[0].count_question);
            setQuizData(response.data.challenges);
          } else {
            console.error("Failed to fetch quiz");
          }
        } catch (error) {
          console.error("Error while fetching quiz:", error.message);
        }
      }
    };

    fetchQuiz();
  }, [user]);
  const convertTime = () => {
    const hrs = Math.floor(countdown3 / 3600);
    const mins = Math.floor((countdown3 % 3600) / 60);
    const secs = countdown3 % 60;
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
  };
  useEffect(() => {
    // Update current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    convertTime();
  }, [quizData, countdown3]);
  const handleQuiz = () => {
    if (quizData) {
      // Quiz not live
      gotoQuiz(quizData.challenge_id);
    } else {
      // Quiz data not available
      Alert.alert("Quiz Alert", "Quiz data is not available.");
    }
  };

  const gotoQuiz = async (challenge_id) => {
    try {
      const response2 = await axios.post(
        `${baseURL}/createUserQuiz.php`,
        {
          user_id: user.id,
          challenge_id: challenge_id,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response2.data.success) {
        console.log("Joining quiz...");
        navigation.replace("QuizPageScreen", {
          currentIndex: 0,
          dataQuiz: quizData,
          user: user,
          live: quizData.live,
        });
      }
      // console.log(response2.data);
    } catch (error) {
      console.error("Error2:", error);
    }
  };
  useEffect(() => {
    if (quizData) {
      const quizStartTime = new Date();
      const [hours, minutes, seconds] = quizData.start_time.split(":");
      quizStartTime.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10)
      );

      // Calculate the difference in milliseconds
      const differenceInMilliseconds = currentTime - quizStartTime;

      // Convert milliseconds to seconds and round down
      const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

      if (currentTime > quizStartTime) {
        setCompleted(true);
      }

      if (quizStartTime > currentTime) {
        setCountdown(Math.abs(differenceInSeconds));
        setCountdown3(Math.abs(differenceInSeconds));
      }

      // console.log("Difference in seconds:", quizStartTime);
    }
   
  }, [quizData]);
  useEffect(() => {
    if (sound) {
      return () => {
        console.log("Unloading Sound");
        sound.unloadAsync();
      };
    }
  }, [sound]);
  useEffect(() => {
    if (isFocused && quizData && quizData.live=="yes") {
      loadSound();
    } else {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
    }
  }, [isFocused, quizData]);

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `${baseVidUrl + quizData.music}` },
        { shouldPlay: true }
      );
      setSound(sound);
      console.log("Playing Sound");
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  };
  useEffect(() => {
    if (quizData && quizData.live === "yes" && countdown3 >= 0) {
      const secondminus = setInterval(() => {
        setCountdown3((prevCount) => prevCount - 1);
      }, 1000);

      // Clear interval on component unmount
      return () => clearInterval(secondminus);
    }
  }, [quizData, countdown3]);

  console.log("countd", countdown3);
  useEffect(() => {
    if (countdown3 === 0) {
      handleQuiz();
    }
  }, [countdown3]);
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {quizData ? (
        <TouchableOpacity
          style={styles.quizCard}
          onPress={handleQuiz}
          disabled={quizData.live == "yes" ? true : false} // Disable if not live or quiz already started
        >
          <Text style={styles.quizText}>Welcome</Text>
          {/* {quizData.live == "yes" && !completed && (
            <CountdownCircleTimer
              isPlaying
              duration={countdown}
              colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
              colorsTime={[7, 5, 2, 0]}
            >
              {({ remainingTime }) => (
                <Text style={{ fontSize: hp(2.5) }}>{remainingTime}</Text>
              )}
            </CountdownCircleTimer>
          )} */}
          {quizData.live == "yes" && completed && (
            <Text
              style={{
                textAlign: "center",
                color: "red",
                fontSize: hp(1.8),
                fontFamily: "raleway-bold",
              }}
            >
              Oops!..Quiz has been already started
            </Text>
          )}
          {quizData.live == "yes" && !completed && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View>
                <Text
                  style={{
                    backgroundColor: "#f9b715",
                    minWidth: hp(8),
                    borderRadius: 8,
                    padding: 10,
                    fontSize: hp(3),
                    fontFamily: "raleway-bold",
                    textAlign: "center",
                  }}
                >
                  {hours}
                </Text>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontWeight: "400",
                    textAlign: "center",
                  }}
                >
                  Hours
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    backgroundColor: "#f9b715",
                    minWidth: hp(8),
                    borderRadius: 8,
                    padding: 10,
                    fontSize: hp(3),
                    fontFamily: "raleway-bold",
                    textAlign: "center",
                  }}
                >
                  {minutes}
                </Text>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontWeight: "400",
                    textAlign: "center",
                  }}
                >
                  Minutes
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    backgroundColor: "#f9b715",
                    minWidth: hp(8),
                    borderRadius: 8,
                    padding: 10,
                    fontSize: hp(3),
                    fontFamily: "raleway-bold",
                    textAlign: "center",
                  }}
                >
                  {seconds}
                </Text>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontWeight: "400",
                    textAlign: "center",
                  }}
                >
                  Seconds
                </Text>
              </View>
            </View>
          )}
          {quizData.live == "no" && (
            <TouchableOpacity
              onPress={handleQuiz}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: "red",
                borderRadius: 12,
              }}
            >
              <Text
                style={{ fontSize: hp(2), color: "white", fontFamily: "raleway-bold" }}
              >
                Start
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
};

export default LobbyScreen;

const styles = StyleSheet.create({
  quizCard: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    // minHeight: hp(30),
    gap: 15,
    minWidth: wp(80),
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  quizText: {
    color: "black",
    fontSize: hp(2.5),
    fontFamily: "raleway-bold",
  },
});
