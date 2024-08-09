import React, { useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Accelerometer, Magnetometer } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Modal, Portal, PaperProvider } from "react-native-paper";
import LottieView from "lottie-react-native";
import axios, { Axios } from "axios";
import { baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Grid, Col, Row } from "react-native-easy-grid";
const { height, width } = Dimensions.get("window");
import greenArrow from "../assets/green-arrow.png";
import redArrow from "../assets/compass_pointer.png";
import { StackActions } from '@react-navigation/native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STRIDE_LENGTH = 0.762; // Average stride length in meters

export default function AcceleroMeterScreen({ route }) {
  const { userSId, challenge, maxSteps,  direction,userTaskId } = route.params;
  // console.log(userTaskId)
  const [steps, setSteps] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [magnetometer, setMagnetometer] = useState(0);
  const [pointerColor, setPointerColor] = useState("red");
  const [newDirection, setNewDirection] = useState();
  const [newChallenges, setNewChallenges] = useState();
  const [newDuration, setNewDuration] = useState(0);
  const [navRoute, setNavRoute] = useState(0);
  const [newSteps, setNewSteps] = useState(0);
  const [newUserTaskId, setNewUserTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [visible2, setVisible2] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser);
        } else {
          navigation.replace("OtpVerification")
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);
  const showModal2 = () => {
    setVisible2(true);
  };
  const tasks = challenge;
  const navigation = useNavigation();
  const showModal = () => {
    setVisible(true);
  };
  const hideModal = () => setVisible(false);
  const hideModal2 = () => setVisible2(false);

  useEffect(() => {
    _toggle();
    return () => {
      _unsubscribe();
    };
  }, []);

  const _toggle = () => {
    if (subscription) {
      _unsubscribe();
    } else {
      _subscribe();
    }
  };

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener((data) => {
        setMagnetometer(_angle(data));
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const _angle = (magnetometer) => {
    let angle = 0;
    if (magnetometer) {
      let { x, y, z } = magnetometer;
      if (Math.atan2(y, x) >= 0) {
        angle = Math.atan2(y, x) * (180 / Math.PI);
      } else {
        angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
      }
    }
    return Math.round(angle);
  };

  const _direction = (degree) => {
    if (degree >= 22.5 && degree < 67.5) {
      return "NE";
    } else if (degree >= 67.5 && degree < 112.5) {
      return "E";
    } else if (degree >= 112.5 && degree < 157.5) {
      return "SE";
    } else if (degree >= 157.5 && degree < 202.5) {
      return "S";
    } else if (degree >= 202.5 && degree < 247.5) {
      return "SW";
    } else if (degree >= 247.5 && degree < 292.5) {
      return "W";
    } else if (degree >= 292.5 && degree < 337.5) {
      return "NW";
    } else {
      return "N";
    }
  };

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  const _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userObject = JSON.parse(userString);
          setUser(userObject);
        }
      } catch (error) {
        console.error("Error fetching user from AsyncStorage:", error.message);
      }
    };

    fetchUser();
  }, []); // Empty dependency array ensures the effect runs only once

  useEffect(() => {
    let accelSubscription;

    const startAccelerometer = () => {
      accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        const threshold = 1.2;

        const magnetometerAngle = _angle({ x, y, z });

        if (direction) {
          const isMovingInDirection =
            _direction(_degree(magnetometerAngle)) === direction;

          if (isMovingInDirection) {
            setPointerColor("green");
          } else {
            setPointerColor("red");
          }

          if (acceleration > threshold && isMovingInDirection) {
          }
        } else {
          setPointerColor("green");

          if (acceleration > threshold) {
            setSteps((prevSteps) => {
              const newSteps = prevSteps + 1;

              if (newSteps >= maxSteps) {
                stopSensors();
                const endProgress = async () => {
                  try {
                    const response = await axios.post(
                      `${baseURL}/userEndProgress.php`,
                      {
                        userTaskId: userTaskId,
                        steps: maxSteps,
                        challenge_id: challenge.challenge_id,
                        userId: user?.id ? user?.id : userSId,
                        task_id: tasks?.task_id 
                      },
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    if (response.status === 200) {
                      console.log("Success");
                    } else {
                      console.error(
                        "Error:",
                        response.data ? response.data.error : "Unknown error"
                      );
                    }
                  } catch (error) {
                    console.error("Error:", error.message);
                  }
                };

                endProgress();
// console.log(tasks.task_id)
// console.log(tasks.challenge_id)
// console.log(user?.id)
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
                              "Content-Type":
                                "application/x-www-form-urlencoded",
                            },
                          }
                        );
                        // console.log(response2)
                        setNewUserTaskId(response2.data.task.userTaskId);
                        setNewDuration(response.data.duration)
                        // console.log(response)
                        if(response.data.task_type=="videoCapture")
                        {
                          setNavRoute("VideoTesting")
                        }
                        if(response.data.task_type=="mediaCapture")
                        {
                          setNavRoute("SelfieScreen")
                        }
                        if(response.data.task_type=="stepCounter")
                        {
                          setNavRoute("AcceleroMeterScreen");
                        }
                        showModal()
                      } catch (error) {
                        console.error("Error2:", error);
                      }
                    }
                  } catch (error) {
                    console.error("Error1:", error);
                    throw error;
                  }
                };

                if (tasks.multiple == "yes") {
                  checkNext();

                } else {
                  showModal2()
                }
              } else if (newSteps % 10 === 0) {
                const sendProgressData = async () => {
                  try {
                    const response = await axios.post(
                      `${baseURL}/userTaskProgress.php`,
                      {
                        userTaskId: userTaskId,
                        steps: newSteps,
                      },
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    if (response.status === 200) {
                      console.log("Success");
                    } else {
                      console.error(
                        "Error:",
                        response.data ? response.data.error : "Unknown error"
                      );
                    }
                  } catch (error) {
                    console.error("Error:", error.message);
                  }
                };

                sendProgressData();
              }

              return newSteps;
            });
          }
        }
      });
    };

    const stopSensors = () => {
      if (accelSubscription) {
        accelSubscription.remove();
      }
    };

    startAccelerometer();

    return () => {
      stopSensors();
    };
  }, []);

  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      const calculatedProgress = (steps / maxSteps) * 100;
      setProgress(calculatedProgress);
    }, [isFocused, steps])
  );

  const distanceInKm = (steps * STRIDE_LENGTH) / 1000;

  // const renderCircles = () => {
  //   const totalCircles = 24;
  //   const circles = [];
  //   const circleRadius = 60;
  //   const gapFactor = 1.4;

  //   for (let i = 0; i < totalCircles; i++) {
  //     const angle = (i / totalCircles) * 360;
  //     const cx =
  //       100 + circleRadius * gapFactor * Math.cos((angle * Math.PI) / 180);
  //     const cy =
  //       100 + circleRadius * gapFactor * Math.sin((angle * Math.PI) / 180);

  //     const circleFill =
  //       i < (progress / 100) * totalCircles ? "#5ce1e6" : "#ffffff";

  //     circles.push(
  //       <Circle
  //         key={i}
  //         cx={cx}
  //         cy={cy}
  //         r="8"
  //         fill={circleFill}
  //         stroke="#fff"
  //         strokeWidth="2"
  //       />
  //     );
  //   }

  //   return circles;
  // };
  const handleCompletion = () => {
    navigation.replace("EntryCard", {
      navRoute:navRoute,
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
const { top } = useSafeAreaInsets();
  const paddingTop = top > 10 ? top : 30;
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
              <TouchableOpacity
                style={{ ...styles.btn3, marginBottom: 10,backgroundColor:"blue" }}
                onPress={() => navigation.replace("SelfieScreenShare",{
                   userSId, challenge ,
                   navRoute:navRoute,
                   userSIds: userSId,
                   challenge: newChallenges,
                   tasks: newChallenges,
                   maxSteps: newSteps,
                   direction: newDirection,
                   userTaskId: newUserTaskId,
                   duration: newDuration,
                   next:"yes"
                })}
              >
                <Text style={styles.btnTxt3}>Share Your Moment With Us</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleCompletion}>
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
                style={{ ...styles.btn3, marginBottom: 10,backgroundColor:"blue" }}
                onPress={() => navigation.replace("SelfieScreenShare",{
                   userSId, challenge,tasks ,next: "no"
                })}
              >
                <Text style={styles.btnTxt3}>Share Your Moment With Us</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={{...styles.btn3,backgroundColor:"red"}}
                onPress={() => navigation.dispatch(StackActions.popToTop())}
              >
                <Text style={styles.btnTxt3}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
        <View style={[styles.bgColor,{paddingTop:paddingTop}]} />
        <View style={styles.DetailStart}>
          
          <View style={styles.description}>
            <View style={{ gap: 10 }}>
              <Text style={styles.heading}>WALK {maxSteps} STEPS </Text>
              {direction && (
                <Text style={styles.heading}>TO {direction} CHALLENGE</Text>
              )}
              <View style={{ width: "100%", alignItems: "center" }}>
                {/* <Svg height="200" width="200">
                  {renderCircles()}
                  <SvgText
                    x="48%"
                    y="52%"
                    fontSize="30"
                    fill="#fff"
                    fontWeight={"500"}
                    textAnchor="middle"
                  >
                    {Math.round(progress)}%
                  </SvgText>
                </Svg> */}
                <CircularProgress
  value={steps}
  radius={90}
  progressValueColor={'#433e64'}
  maxValue={maxSteps}
  title={'Steps'}
  titleColor={'#433e64'}
  titleStyle={{fontWeight: 'bold'}}
  activeStrokeColor="#7973f1"
/>
              </View>
              <View>
              
                <Text style={styles.counter}>
                  {steps} / {maxSteps} STEPS
                </Text>
                <Text style={styles.counter}>
                  {distanceInKm.toFixed(3)} kms
                </Text>
              </View>
            </View>
            {/* <Image
              source={require("../assets/compass.png")}
              resizeMode="cover"
              style={[
                styles.compassValue,
                {
                  transform: [
                    {
                      rotate: `${
                        magnetometerData && magnetometerData.x
                          ? magnetometerData.x.toFixed(2)
                          : "0"
                      }deg`,
                    },
                  ],
                },
              ]}
            /> */}
            <Grid>
              <Row style={{ alignItems: "center" }} size={0.9}>
                <Col style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      // color: "#fff",
                      fontSize: height / 26,
                      fontFamily: "raleway-bold",
                    }}
                  >
                    {_direction(_degree(magnetometer))}
                  </Text>
                </Col>
              </Row>

              <Row style={{ alignItems: "center" }} size={0.1}>
                <Col style={{ alignItems: "center" }}>
                  <View
                    style={{
                      position: "absolute",
                      width: width,
                      alignItems: "center",
                      top: 0,
                    }}
                  >
                    <Image
                      source={pointerColor === "green" ? greenArrow : redArrow}
                      style={{
                        height: height / 50,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                </Col>
              </Row>

              <Row style={{ alignItems: "center" }} size={2}>
                <Col style={{ alignItems: "center" }}>
                  <Image
                    source={require("../assets/compass.png")}
                    style={{
                      height: height / 4,
                      justifyContent: "center",
                      alignItems: "center",
                      resizeMode: "contain",
                      transform: [{ rotate: `${360 - magnetometer}deg` }],
                    }}
                  />
                </Col>
              </Row>
            </Grid>
          </View>
        </View>
      <StatusBar style="light" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  bgColor: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
  },
  DetailStart: {
    position: "absolute",
    flex: 1,
    padding: 15,
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
  },
  heading: {
    marginRight: "auto",
    marginLeft: "auto",
    fontSize: 35,
    fontFamily: "raleway-bold",
  },
  counter: {
    marginRight: "auto",
    marginLeft: "auto",
    fontSize: 30,
    fontFamily: "raleway-bold",
    // color: "white",
    marginTop: 10,
  },
  containerStyle: {
    backgroundColor: "transparent",
    padding: 20,
    shadowColor: "transparent",
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
    alignItems:"center",
    backgroundColor: "#E32636",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    minWidth:wp(80)
  },
  btn: {
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
  compassValue: {
    marginRight: "auto",
    marginLeft: "auto",
    height: 200,
    width: 200,
  },
});
