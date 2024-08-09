import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Platform,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { FontAwesome,Feather,Ionicons } from "@expo/vector-icons";

import wowfy_black from "../assets/logos/wowfy_black.png";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import TaskCard from "./TaskCard";
import TopBar from "./AppComponents/TopBar";

const ChallengesList = ({ route }) => {
  const navigation = useNavigation();
  const {  selectedMovie, challenge } = route.params;
  // console.log(challenge.frequency);
  const [user, setUser] = useState(null);
  const [taskArray, setTaskArray] = useState([]);
  const [isLoading,setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // navigation.navigate("OtpVerification")
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, [navigation]);

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      const fetchChallengeList = async () => {
        try {
          if (!user || !user.id) {
            // If user or user.id doesn't exist, skip the fetch
            return;
          }
          setIsLoading(true)

          const response = await axios.get(
            `${baseURL}/getAllTasks.php?challenge_id=${challenge.challenge_id}&user_id=${user.id}`
          );

          if (response.status === 200) {
            // console.log(response.data);
            setTaskArray(response.data.tasks);
          } else {
            console.error("Failed to fetch challenges");
          }
        } catch (error) {
          console.error("Error while fetching challenges:", error.message);
        }
        finally{
          setIsLoading(false)
        }
      };

      fetchChallengeList();
    }, [isFocused, user])
  );

// console.log(selectedMovie)
  return (
    <View style={styles.container}>
             <View style={{ position: "relative" }}>
          <View style={[styles.LinearGradient, { zIndex: -10 }]}>
            <Image
              source={{ uri: `${baseImgURL + selectedMovie.banner}` }}
              style={{ height: "100%", width: "100%", resizeMode: "cover" }}
            />
          </View>
          <View
            style={[
              styles.LinearGradient,
              {
                zIndex: -5,
                backgroundColor: "black",
                opacity: Platform.OS == "ios" ? 0.6 : 0.8,
              },
            ]}
          />

          <View style={{ padding: 15, marginTop: 20 }}>
            
          <TopBar color={"white"}  user={user}  />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                <View>
                  <View
                    style={[
                      {
                        padding: 3,
                        backgroundColor: "orange",
                        borderRadius: 120,
                      },
                    ]}
                  >
                   
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: wp(20),
                          width: wp(20),
                          backgroundColor: "white",
                          borderRadius: 50,
                          position: "relative",
                        }}
                      >
                        {selectedMovie.image?.length > 0 && (
                          <Image
                            source={{
                              uri: `${baseImgURL + selectedMovie.image}`,
                            }}
                            style={{
                              width: wp(20),
                              height: wp(20),
                              borderRadius: 50,
                              resizeMode: "contain",
                              backgroundColor: "white",
                            }}
                          />
                        )}
                      </View>
                  </View>
                </View>
                <View style={{ gap: 7 }}>
                  <Text
                    style={{
                      fontSize: hp(2.2),
                      fontFamily: "raleway-bold",
                      color: "white",
                    }}
                  >
                    {selectedMovie.title}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      <Card style={styles.card}>
        <FlatList
          data={taskArray}
          keyExtractor={(item,index) => index}
          
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 10 }} />
            </View>
          }
          renderItem={({ index, item }) => (
            <TaskCard  item={item} index={index} disabled={isLoading} userId={user.id} />
          )}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  topLogo: {
    height: 50,
    width: 50,
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "lightgrey",
    borderRadius: 20,
    padding: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
  },
  settingsIcon: {
    padding: 0,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  movieInfoContainer: {
    borderColor: "lightgrey",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    paddingTop: 5,
    paddingBottom: 10,
    width: "95%",
    marginTop: 7,
  },
  movieDetailsContainer: {
    width: "90%",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft:10

  },
  movieImage: {
    width: 50,
    height: 60,
    borderRadius: 5,
  },
  titleInfo: {
    flexDirection: "row",
    marginTop: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: "raleway-bold",
  },
  titleIcon: {
    marginTop: 15,
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  backIcon: {
    paddingRight: 10,
  },
  FollowPoints: {
    gap: 5,
    alignItems: "center",
  },
  followButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#E32636",
    borderRadius: 18,
  },
  followersText: {
    fontSize: 14,
  },
  boldCount: {
    fontFamily: "raleway-bold",
  },
  pointsText: {
    fontSize: 14,
  },
  card: {
    flex: 1,
    width: wp(95),
    marginTop: 10,
  },
  moviesContainer: {
    paddingTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  LinearGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // minHeight:hp(35)
  },
});

export default ChallengesList;
