import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions, Camera } from "expo-camera";
import { Audio, Video, ResizeMode } from "expo-av";
import {
  MD3Colors,
  ProgressBar,
  Modal,
  Portal,
  PaperProvider,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions } from "@react-navigation/native";

export default function VideoTesting({ route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState(null);
  const [recording, setRecording] = useState(false);
  const [videoSource, setVideoSource] = useState(null);
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newDirection, setNewDirection] = useState();
  const [newChallenges, setNewChallenges] = useState();
  const [newDuration, setNewDuration] = useState(0);
  const [navRoute, setNavRoute] = useState(0);
  const [newSteps, setNewSteps] = useState(0);
  const [newUserTaskId, setNewUserTaskId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [user, setUser] = useState(null);
  const [minutes, setMinutes] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    (async () => {
      requestPermission();
      getAudioPermission();
    })();
  }, []);

  const showModal = () => {
    setVisible(true);
  };

  const showModal2 = () => {
    setVisible2(true);
  };

  const hideModal = () => setVisible(false);

  const hideModal2 = () => setVisible2(false);

  const getAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === "granted");
    } catch (error) {
      console.error("Error getting audio permission:", error);
    }
  };

  function toggleCameraType() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const { userTaskId, tasks, userSId, challenge, duration } = route.params;
  const durationAsNumber = parseInt(duration, 10);

  const startCounting = () => {
    const startTime = new Date().getTime();

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - startTime) / 1000;

      if (elapsedSeconds >= durationAsNumber) {
        setProgress(1);
        clearInterval(interval);
      } else {
        const newCount = elapsedSeconds / durationAsNumber;
        const secondCount = Math.floor(durationAsNumber - elapsedSeconds);
        const minutes = Math.floor(secondCount / 60);
        const remainingSeconds = secondCount % 60;
        setMinutes(
          `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
        );
        setProgress(newCount);
      }
    }, 100);
  };

  const startRecording = async () => {
    if (cameraRef.current && audioPermission === true) {
      console.log("hello");
      console.log(recording);

      try {
        // Check if recording is already in progress
        if (recording) {
          // Stop recording if it's currently in progress
          if (cameraRef.current?._cameraRef?.current?.stopRecording) {
            await cameraRef.current._cameraRef.current.stopRecording(); // Await stopping recording
            setRecording(false); // Update recording state
          } else {
            console.error("stopRecording method not available");
          }
        } else {
          setProgress(0); // Reset progress
          startCounting(); // Start the progress counting
          setRecording(true); // Set recording state to true

          // Validate duration parameter
          const isDurationValid =
            !isNaN(durationAsNumber) && durationAsNumber > 0;
          const recordParams = isDurationValid
            ? { maxDuration: durationAsNumber }
            : {};

          // Start recording and await the result
          const result = await cameraRef.current.recordAsync(recordParams);
          console.log(result);
          // Check if the result has a uri property
          if (result && result.uri) {
            setVideoSource(result.uri); // Set the video source URI
          } else {
            console.error("Failed to get video URI");
          }
        }
      } catch (error) {
        console.error("Error starting/stopping recording:", error); // Log any errors encountered
      }
    } else {
      console.error("Camera ref or audio permission is not available");
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && recording) {
      try {
        if (cameraRef.current?._cameraRef?.current?.stopRecording) {
          await cameraRef.current._cameraRef.current.stopRecording(); // Await stopping recording
          setRecording(false); // Update recording state
        } else {
          console.error("stopRecording method not available");
        }
      } catch (error) {
        console.error("Error stopping recording:", error); // Log any errors encountered
      }
    }
  };

  const handleReset = () => {
    setProgress(0);
    setVideoSource(null);
    stopRecording();
  };

  const submitSave = async () => {
    if (!videoSource) {
      Alert.alert("Oops!", "You need to take a video first! 📸");
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("imageFile", {
        uri: videoSource,
        type: "video/mp4",
        name: `video_${Date.now()}.mp4`,
      });
      formData.append("userTaskId", userTaskId);
      formData.append("taskId", tasks.task_id);
      formData.append("userSId", userSId);
      formData.append("challenge_id", challenge.challenge_id);
      formData.append("media_type", "video");

      const response = await axios.post(`${baseURL}/add-media.php`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log("success");
      } else {
        console.error("Unexpected status code:", response.status);
      }

      const checkNext = async () => {
        try {
          const response = await axios.get(
            `${baseURL}/checkNextTaskExist.php?task_id=${tasks.task_id}&challenge_id=${tasks.challenge_id}&user_id=${user?.id}`
          );

          if (response.data.next == "yes") {
            setNewChallenges(response.data);
            setNewSteps(response.data.steps);
            setNewDirection(response.data.direction);
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
              setNewUserTaskId(response2.data.task.userTaskId);
              setNewDuration(response.data.duration);
              if (response.data.task_type == "videoCapture") {
                setNavRoute("VideoTesting");
              }
              if (response.data.task_type == "mediaCapture") {
                setNavRoute("SelfieScreen");
              }
              if (response.data.task_type == "stepCounter") {
                setNavRoute("AcceleroMeterScreen");
              }
              showModal();
            } catch (error) {
              console.error("Error2:", error);
            }
          } else {
            showModal2();
          }
        } catch (error) {
          console.error("Error1:", error);
          throw error;
        }
      };

      if (tasks.multiple == "yes") {
        checkNext();
      } else {
        showModal2();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      Alert.alert("Sorry", `Video didn't upload`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletion = () => {
    navigation.replace("EntryCard", {
      navRoute: navRoute,
      userSId: userSId,
      challenge: newChallenges,
      tasks: newChallenges,
      maxSteps: newSteps,
      direction: newDirection,
      userTaskId: newUserTaskId,
      duration: newDuration,
    });
  };

  return (
    <PaperProvider style={{ flex: 1 }}>
      <Portal>
        <Modal
          dismissable={false}
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.containerStyle}
        >
          <View style={styles.successContainer}>
            <Text
              style={{
                fontSize: 35,
                color: "#0096b1",
                fontWeight: "bold",
                letterSpacing: 2,
              }}
            >
              CHALLENGE COMPLETED
            </Text>
            <LottieView
              source={require("../assets/animation/success.json")}
              style={styles.lottie}
              autoPlay
              loop={false}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCompletion()}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18 }}>
              NEXT CHALLENGE
            </Text>
          </TouchableOpacity>
        </Modal>
        <Modal
          dismissable={false}
          visible={visible2}
          onDismiss={hideModal2}
          contentContainerStyle={styles.containerStyle}
        >
          <View style={styles.successContainer}>
            <Text
              style={{
                fontSize: 35,
                color: "#0096b1",
                fontWeight: "bold",
                letterSpacing: 2,
              }}
            >
              CHALLENGE COMPLETED
            </Text>
            <LottieView
              source={require("../assets/animation/success.json")}
              style={styles.lottie}
              autoPlay
              loop={false}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.dispatch(StackActions.popToTop())}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18 }}>
              BACK TO HOME
            </Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
      <View style={styles.container}>
        {videoSource ? (
          <Video
            source={{ uri: `${videoSource}` }}
            style={styles.camera}
            resizeMode={ResizeMode.COVER}
            useNativeControls
            // isLooping
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            ratio="16:9"
            mode="video"
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleCameraType}
          >
            <MaterialIcons name="flip-camera-ios" size={28} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={startRecording}
          >
            {recording ? (
              <MaterialIcons name="stop" size={28} color="#FFF" />
            ) : (
              <MaterialIcons
                name="fiber-manual-record"
                size={28}
                color="#FFF"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={submitSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <MaterialIcons name="upload" size={28} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        <ProgressBar
          progress={progress}
          color={MD3Colors.primary50}
          style={styles.progressBar}
        />
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{minutes}</Text>
        </View>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
  },
  toggleButton: {
    backgroundColor: "#0096b1",
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 50,
  },
  uploadButton: {
    backgroundColor: "#0096b1",
    padding: 15,
    borderRadius: 50,
  },
  progressBar: {
    margin: 10,
    height: 10,
    borderRadius: 5,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  containerStyle: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  button: {
    backgroundColor: "#0096b1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
  },
});
