import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { CameraView,useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { baseURL } from "../backend/baseData";
import {  MaterialIcons } from "@expo/vector-icons";
import { PaperProvider, Portal } from "react-native-paper";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackActions } from "@react-navigation/native";

export default function SelfieScreen({ route }) {
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [newDirection, setNewDirection] = useState();
  const [newChallenges, setNewChallenges] = useState();
  const [newDuration, setNewDuration] = useState(0);
  const [navRoute, setNavRoute] = useState(0);
  const [newSteps, setNewSteps] = useState(0);
  const [newUserTaskId, setNewUserTaskId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const cameraRef = useRef(null);

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
  const showModal = () => {
    setVisible(true);
  };
  const showModal2 = () => {
    setVisible2(true);
  };
  const hideModal = () => setVisible(false);
  const hideModal2 = () => setVisible2(false);
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }
  const { userTaskId, tasks, userSId, challenge } = route.params ?? {};

  // console.log(challenge.challenge_id);
  const takePicture = async () => {
    if (cameraRef) {
      // console.log(cameraRef);

      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo);
      // console.log(photo);
    }
  };
  // console.log(route.params); // Log route parameters

  function toggleCameraType() {
    setFacing((current) =>
      current === "back" ? "front" : "back"
    );
  }
  const submitSave = async () => {
    if (!capturedPhoto) {
      Alert.alert("Oops!", "You need to take a cute selfie first! 📸");
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();

      // Append captured image
      formData.append("imageFile", {
        uri: capturedPhoto.uri,
        type: "image/jpeg",
        name: `selfie_${Date.now()}.jpg`,
      });

      // Append other parameters from route.params
      formData.append("userTaskId", userTaskId);
      formData.append("taskId", tasks.task_id);
      formData.append("userSId", userSId);
      formData.append("challenge_id", challenge.challenge_id);
      formData.append("media_type", "photo");

      // Make an Axios request to your PHP backend API
      const response = await axios.post(`${baseURL}/add-media.php`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("API Response:", response.data);

      // Reset capturedPhoto state
      setCapturedPhoto(null);

      console.log("API Response:", response.data);

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
          // console.log(response.data);
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
              // console.log(response2)
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
      // console.log(tasks.multiple)
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
  //  console.log("userSId:", userSId);
  // console.log("challenge:", challenge);
  //console.log("tasks:", tasks);
  //  console.log("next:", "no");
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
                  navRoute: navRoute,
                  userSIds: userSId,
                  challenge: newChallenges,
                  tasks: newChallenges,
                  maxSteps: newSteps,
                  direction: newDirection,
                  userTaskId: newUserTaskId,
                  duration: newDuration,
                  next: "yes",
                })
              }
            >
              <Text style={styles.btnTxt3}>Share Your Moment With Us</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.btn2} onPress={handleCompletion}>
              <Text style={styles.btnTxt}>Go to Next Task</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          visible={visible2}
          onDismiss={hideModal2}
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
            <TouchableOpacity
              style={{ ...styles.btn3, backgroundColor: "red" }}
              onPress={() => navigation.dispatch(StackActions.popToTop())}
            >
              <Text style={styles.btnTxt3}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
      <View style={styles.bgColor} />
      <View style={styles.DetailStart}>
        {!permission.granted ? (
          <View style={styles.description}>
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: hp(1.9),
                marginBottom: 50,
              }}
            >
              We need your permission to show the camera
            </Text>
            <Button onPress={requestPermission} title="grant permission" />
          </View>
        ) : (
          <View style={styles.description}>
            {capturedPhoto ? (
              <Image
                source={{ uri: capturedPhoto.uri }}
                style={{
                  ...styles.camera,
                  transform: [{ scaleX: facing === "front" ? -1 : 1 }],
                }}
              />
            ) : (
              <>
                <CameraView
                  ratio="1:1"
                  style={{ ...styles.camera }}
                  facing={facing}
                  ref={cameraRef}

                />
              </>
            )}
            <View style={styles.InnerContainer}>
              <View>
                <TouchableOpacity
                  style={{ minHeight: hp(5), minWidth: hp(5) }}
                  onPress={() => setCapturedPhoto(null)}
                  disabled={isLoading}
                >
                  {capturedPhoto && (
                    <MaterialIcons name="close" size={hp(5)} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.Circle} onPress={takePicture} />
              <TouchableOpacity
                onPress={toggleCameraType}
                style={{
                  padding: 5,
                  borderRadius: 10,
                }}
              >
                <MaterialIcons
                  name="flip-camera-ios"
                  size={hp(5)}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            {capturedPhoto && (
              <View style={styles.detailsbtns}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#F2613F",
                    padding: 10,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    alignSelf: "center",
                    flexDirection: "row",
                    gap: 15,
                  }}
                  onPress={submitSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Text style={{ color: "white", fontSize: hp(2) }}>
                        Submiting
                      </Text>
                      <ActivityIndicator size="small" color="white" />
                    </>
                  ) : (
                    <Text style={{ color: "white", fontSize: hp(2) }}>
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <StatusBar style="light" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
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
  },
  btn3: {
    alignItems: "center",
    backgroundColor: "#E32636",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth: wp(80),
  },
  image: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  bgColor: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "black",
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
  containerStyle: {
    backgroundColor: "transparent",
    padding: 20,
    shadowColor: "transparent",
  },
  description: {
    flex: 1,
    marginTop: 40,
    position: "relative",
  },

  heading: {
    marginRight: "auto",
    marginLeft: "auto",
    fontSize: 35,
    fontFamily: "raleway-bold",
    color: "white",
    marginTop: 40,
  },
  Circle: {
    backgroundColor: "white",
    height: hp(7),
    width: hp(7),
    borderRadius: 50,
    borderColor: "red",
    borderWidth: 4,
    marginBottom: 15,
  },
  InnerContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    paddingHorizontal: 15,
    minHeight:hp(30)
  },
  detailsbtns: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  btn2: {
    marginRight: "auto",
    marginLeft: "auto",
    backgroundColor: "#E32636",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  btnTxt: {
    fontSize: 20,
    color: "white",
    fontFamily: "raleway-semibold",
  },
  text: {
    color: "white",
    textAlign: "center",
  },
});
