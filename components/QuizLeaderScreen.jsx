import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Path, Svg } from "react-native-svg";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { useNavigation } from "@react-navigation/native";
const QuizLeaderScreen = ({ route }) => {
  const navigation = useNavigation();
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(route.params.currentIndex ? route.params.currentIndex : 0);
  const { user_id, challenge_id } = route.params;
  useEffect(() => {
    const fetchQuiz = async () => {
      if (user_id) {
        try {
          const response = await axios.get(
            `${baseURL}/getQuizLeader.php?user_id=${user_id}&challenge_id=${challenge_id}`
          );

          if (response.status === 200) {
            setLeaderBoard(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch leadership");
          }
        } catch (error) {
          console.error("Error while fetching leadership:", error.message);
        }
      }
    };

    fetchQuiz();
    const timer = setTimeout(() => {
      if (route.params.live == "yes") {
        navigation.replace("QuizPageScreen", {
          currentIndex: route.params.currentIndex,
          dataQuiz: route.params.dataQuiz,
          user: route.params.user,
          live: route.params.live,
        });
      } else {
        // navigation.replace("InnerPage");
      }
    }, 10000);

    // Clear the timer on component unmount
    return () => clearTimeout(timer);
  }, [user_id]);
  return (
    <View
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: "#648e8c",
      }}
    >
      <Image
        source={require("../assets/images/doodle.jpg")}
        style={{
          resizeMode: "cover",
          height: hp(100),
          width: wp(100),
          opacity: 0.1,
          zIndex: -5,
          position: "absolute",
        }}
      />

      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: hp(2.5),
            fontFamily: "raleway-bold",
            color: "white",
            marginTop: hp(3.5),
          }}
        >
          Leaderboard
        </Text>
        {leaderBoard?.first_place && (
          <View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                paddingHorizontal: wp(3),
                paddingVertical: hp(1),
                borderRadius: 12,
                gap: 2,
                alignItems: "center",
                shadowColor: "#000",
                marginTop: hp(1),
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,

                elevation: 7,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "raleway-bold" }}>
                  #{leaderBoard?.first_place.rank}
                </Text>
                {leaderBoard?.first_place.image ? (
                  <Image
                    source={{
                      uri: `${baseImgURL + leaderBoard?.first_place.image}`,
                    }}
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                      backgroundColor: "#ff8f8e",
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: hp(2),
                        textAlign: "center",
                      }}
                    >
                      {leaderBoard?.first_place.first_character}
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    fontFamily: "raleway-bold",
                    color:
                      leaderBoard?.first_place.id == user_id ? "red" : "black",
                  }}
                >
                  {leaderBoard?.first_place.name}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: "raleway-bold" }}>
                  {leaderBoard?.first_place.marks}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {leaderBoard?.second_place && (
          <View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                paddingHorizontal: wp(3),
                paddingVertical: hp(1),
                borderRadius: 12,
                gap: 2,
                alignItems: "center",
                shadowColor: "#000",
                marginTop: hp(1),
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,

                elevation: 7,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "raleway-bold" }}>
                  #{leaderBoard?.second_place.rank}
                </Text>
                {leaderBoard?.second_place.image ? (
                  <Image
                    source={{
                      uri: `${baseImgURL + leaderBoard?.second_place.image}`,
                    }}
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                      backgroundColor: "#ff8f8e",
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: hp(2),
                        textAlign: "center",
                      }}
                    >
                      {leaderBoard?.second_place.first_character}
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    fontFamily: "raleway-bold",
                    color:
                      leaderBoard?.second_place.id == user_id ? "red" : "black",
                  }}
                >
                  {leaderBoard?.second_place.name}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: "raleway-bold" }}>
                  {leaderBoard?.second_place.marks}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {leaderBoard?.third_place && (
          <View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                paddingHorizontal: wp(3),
                paddingVertical: hp(1),
                borderRadius: 12,
                gap: 2,
                alignItems: "center",
                shadowColor: "#000",
                marginTop: hp(1),
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,

                elevation: 7,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "raleway-bold" }}>
                  #{leaderBoard?.third_place.rank}
                </Text>
                {leaderBoard?.third_place.image ? (
                  <Image
                    source={{
                      uri: `${baseImgURL + leaderBoard?.third_place.image}`,
                    }}
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: hp(4),
                      height: hp(4),
                      borderRadius: wp(20),
                      backgroundColor: "#ff8f8e",
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: hp(2),
                        textAlign: "center",
                      }}
                    >
                      {leaderBoard?.third_place.first_character}
                    </Text>
                  </View>
                )}
                <Text
                  style={{
                    fontFamily: "raleway-bold",
                    color:
                      leaderBoard?.third_place.id == user_id ? "red" : "black",
                  }}
                >
                  {leaderBoard?.third_place.name}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: "raleway-bold" }}>
                  {leaderBoard?.third_place.marks}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {leaderBoard?.others?.length > 0 &&
          leaderBoard?.others?.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  paddingHorizontal: wp(3),
                  paddingVertical: hp(1),
                  borderRadius: 12,
                  gap: 2,
                  alignItems: "center",
                  shadowColor: "#000",
                  marginTop: hp(1),
                  shadowOffset: {
                    width: 0,
                    height: 3,
                  },
                  shadowOpacity: 0.29,
                  shadowRadius: 4.65,

                  elevation: 7,
                  backgroundColor: "white",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: "raleway-bold" }}>#{item.rank}</Text>
                  {item.image ? (
                    <Image
                      source={{
                        uri: `${baseImgURL + item.image}`,
                      }}
                      style={{
                        width: hp(4),
                        height: hp(4),
                        borderRadius: wp(20),
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: hp(4),
                        height: hp(4),
                        borderRadius: wp(20),
                        backgroundColor: "#ff8f8e",
                        paddingTop: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: hp(2),
                          textAlign: "center",
                        }}
                      >
                        {item.first_character}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      fontFamily: "raleway-bold",
                      color: item.id == user_id ? "red" : "black",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View>
                  <Text style={{ fontFamily: "raleway-bold" }}>{item.marks}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {leaderBoard?.user_place && (
          <View>
            <Text
              style={{
                fontSize: hp(2),
                fontFamily: "raleway-bold",
                marginTop: 5,
                color: "white",
              }}
            >
              Your Score
            </Text>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                paddingHorizontal: wp(3),
                paddingVertical: hp(1),
                borderRadius: 12,
                gap: 2,
                alignItems: "center",
                shadowColor: "#000",
                marginTop: hp(1),
                shadowOffset: {
                  width: 0,
                  height: 3,
                },
                shadowOpacity: 0.29,
                shadowRadius: 4.65,

                elevation: 7,
                backgroundColor: "white",
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2.8) }}>
                  #{leaderBoard?.user_place.rank}
                </Text>
                {leaderBoard?.user_place.image ? (
                  <Image
                    source={{
                      uri: `${baseImgURL + leaderBoard?.user_place.image}`,
                    }}
                    style={{
                      width: 2 * hp(4),
                      height: 2 * hp(4),
                      borderRadius: wp(20),
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 2 * hp(4),
                      height: 2 * hp(4),
                      borderRadius: wp(20),
                      backgroundColor: "#ff8f8e",
                      justifyContent:"center",
                      paddingTop: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: hp(3),
                        textAlign: "center",
                      }}
                    >
                      {leaderBoard?.user_place.first_character}
                    </Text>
                  </View>
                )}
                <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2.4) }}>
                  {leaderBoard?.user_place.name}
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2.4) }}>
                  {leaderBoard?.user_place.marks}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 10, padding: 10 }}>
              
              { currentIndex ==0 &&(<TouchableOpacity
                style={{
                  marginTop: 2,
                  padding: 10,
                  backgroundColor: "#FF9800",
                  borderRadius: 12,
                  flex: 1,
                }}
                onPress={() =>
                  navigation.replace("QuizComplete", {
                    user_id: user_id,
                    challenge_id: challenge_id,
                  })
                }
              >
                <Text
                  style={{
                    fontSize: hp(2),
                    color: "white",
                    fontFamily: "raleway-bold",
                    textAlign: "center",
                  }}
                >
                  NEXT
                </Text>
              </TouchableOpacity>)}
            </View>
          </View>
        )}
      </View>

      <StatusBar style="light" />
    </View>
  );
};

export default QuizLeaderScreen;

const styles = StyleSheet.create({});
