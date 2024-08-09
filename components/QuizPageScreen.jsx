import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CircularProgress from "react-native-circular-progress-indicator";
import { Video, ResizeMode, Audio } from "expo-av";
import { baseImgURL, baseURL, baseVidUrl } from "../backend/baseData";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import BackgroundTimer from "react-native-background-timer";

const QuizPageScreen = ({ route }) => {
  const { dataQuiz } = route.params;
  const [currentIndex, setCurrentIndex] = useState(route.params.currentIndex);
  const [user, setUser] = useState(route.params.user);
  const [marks, setMarks] = useState(0);
  const [isSelected, setIsSelected] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [status, setStatus] = useState({});
  const timerRef = useRef(null);
  const [dataQuestion, setDataQuestion] = useState(dataQuiz[currentIndex]);
  const [timer, setTimer] = useState(dataQuestion.timer);
  const [sound, setSound] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const newDataQuestion = dataQuiz[currentIndex];
    if (newDataQuestion) {
      setDataQuestion(newDataQuestion);
      setTimer(newDataQuestion.timer);
    }
  }, [currentIndex, dataQuiz]);

  useEffect(() => {
    if (dataQuestion.type === "video") {
      (async () => {
        await videoRef.current.loadAsync(
          {
            uri: `${baseVidUrl + dataQuestion.video}`,
          },
          { shouldPlay: true }
        );
      })();
    } else if (dataQuestion.type === "audio") {
      (async () => {
        try {
          if (sound) {
            await sound.unloadAsync();
          }
          const { sound: newSound } = await Audio.Sound.createAsync({
            uri: `${baseVidUrl + dataQuestion.audio}`,
          });
          setSound(newSound);
          await newSound.playAsync();
        } catch (error) {
          console.error("Error loading audio:", error);
        }
      })();
    }
  }, [dataQuestion]);

  useEffect(() => {
    const countdown = BackgroundTimer.setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          BackgroundTimer.clearInterval(countdown);
          handleTimeout();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => BackgroundTimer.clearInterval(countdown);
  }, [currentIndex, dataQuestion]);

  useEffect(() => {
    const correctItem = dataQuestion.options.find(
      (item) => item.answer === "yes"
    );
    if (correctItem) {
      setCorrectAnswer(correctItem.answer_text);
    }
  }, [dataQuestion]);

  useEffect(() => {
    if (dataQuestion.options?.length > 0) {
      const shuffled = shuffleArray([...dataQuestion.options]);
      setShuffledOptions(shuffled);
    }
  }, [dataQuestion]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleTimeout = useCallback(async () => {
    try {
      const response = await axios.post(
        `${baseURL}/add-quiz-progress.php`,
        {
          user_id: user.id,
          challenge_id: dataQuestion.challenge_id,
          marks,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        setIsSelected("");
        setMarks(0);
        if (dataQuestion.count_question !== currentIndex + 1) {
          if (route.params.live === "yes") {
            navigation.replace("QuizLeaderScreen", {
              challenge_id: dataQuestion.challenge_id,
              user_id: user.id,
              live: route.params.live,
              currentIndex: currentIndex + 1,
              dataQuiz,
              user,
            });
          } else {
            navigation.replace("QuizCountPage", {
              challenge_id: dataQuestion.challenge_id,
              user_id: user.id,
              live: route.params.live,
              currentIndex: currentIndex + 1,
              dataQuiz,
              user,
            });
          }
        } else {
          navigation.replace("QuizLeaderScreen", {
            challenge_id: dataQuestion.challenge_id,
            user_id: user.id,
            live: "no",
          });
        }
      }
    } catch (error) {
      console.error("Error adding marks:", error);
    }
  }, [marks, dataQuestion, currentIndex, user, route.params.live, dataQuiz, navigation]);

  const handleAnswer = async (data) => {
    if (!isSelected) {
      setIsSelected(data);
      let marked = 0;
      if (data === correctAnswer) {
        const remainingMilliseconds = timer * 1000;
        const maxMarks = 1000;
        marked = Math.max(0, ((maxMarks / (dataQuestion.timer * 1000)) * remainingMilliseconds).toFixed(2));
        setMarks(marked);
      } else {
        setMarks(0);
      }
      if (route.params.live === "no") {
        try {
          const finalValue = dataQuestion.count_question !== currentIndex + 1 ? "yes" : "no";
          const response = await axios.post(
            `${baseURL}/add-quiz-progress.php`,
            {
              user_id: user.id,
              challenge_id: dataQuestion.challenge_id,
              marks: marked,
              finalValue,
            },
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response.status === 200) {
            if (finalValue === "yes") {
              navigation.replace("QuizCountPage", {
                challenge_id: dataQuestion.challenge_id,
                user_id: user.id,
                live: route.params.live,
                currentIndex: currentIndex + 1,
                dataQuiz,
                user,
              });
            } else {
              navigation.replace("QuizLeaderScreen", {
                challenge_id: dataQuestion.challenge_id,
                user_id: user.id,
                live: "no",
              });
            }
          }
        } catch (error) {
          console.error("Error adding marks:", error);
        }
      }
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.questionCount}>
          {currentIndex + 1}/{dataQuestion.count_question}
        </Text>
      </View>
      <View style={styles.quizContent}>
        <View style={styles.circularProgressContainer}>
          <CircularProgress
            value={timer}
            radius={hp(6)}
            duration={dataQuestion.timer}
            progressValueColor={"#004643"}
            maxValue={dataQuestion.timer}
            clockwise={false}
            circleBackgroundColor="white"
            activeStrokeColor="#004643"
            titleColor={"white"}
            titleStyle={styles.circularProgressTitle}
          />
        </View>
        <View style={styles.questionContainer}>
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionText}>
              {dataQuestion.question}
            </Text>
            <View style={styles.mediaContainer}>
              {dataQuestion?.type === "image" && (
                <Image
                  source={{
                    uri: `${baseImgURL + dataQuestion.image}`,
                  }}
                  resizeMode="contain"
                  style={styles.image}
                />
              )}
              {dataQuestion?.type === "video" && (
                <Video
                  ref={videoRef}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={(status) => setStatus(status)}
                />
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={styles.optionsContainer}>
        {shuffledOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              {
                backgroundColor: isSelected === item.answer_text ? "orange" : "white",
              },
            ]}
            onPress={() => handleAnswer(item.answer_text)}
          >
            <Text
              style={{
                color: isSelected === item.answer_text ? "white" : "black",
              }}
            >
              {item.answer_text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  questionCount: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  quizContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgressContainer: {
    marginVertical: 20,
  },
  circularProgressTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  questionContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  questionTextContainer: {
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  mediaContainer: {
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: hp(30),
  },
  video: {
    width: "100%",
    height: hp(30),
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  optionButton: {
    width: wp(80),
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuizPageScreen;
