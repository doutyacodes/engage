import { View, Text, Image, FlatList, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Divider, Searchbar } from "react-native-paper";
import { List } from "react-native-paper";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { baseImgURL, baseURL } from "../backend/baseData";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDrawerStatus } from "@react-navigation/drawer";
import QRCode from "react-native-qrcode-svg";
import LeftSearchCompoent from "./AppComponents/LeftSearchCompoent";
import TeamMates from "./AppComponents/TeamMates";
const CustomNestedDrawer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [userPages, setUserPages] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [teammates, setTeammates] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const isFocused = useIsFocused();
  const [openedDrawer, setOpenedDrawer] = useState(
    useDrawerStatus() === "open"
  );
  const isDrawerOpen = useDrawerStatus() === "open";

  // console.log(isDrawerOpen);

  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      const fetchUserAndFollow = async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          if (userString) {
            const userObject = JSON.parse(userString);
            setUser(userObject);
          }
        } catch (error) {
          console.error(
            "Error fetching user from AsyncStorage:",
            error.message
          );
        }
      };

      fetchUserAndFollow();
      // Fetch data every 10 seconds
    }, [isFocused, isDrawerOpen])
  );

  useEffect(() => {
    const fetchPages = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getAllUserPages.php?user_id=${user.id}`
          );
          if (response.status === 200) {
            setUserPages(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch pages");
          }
        } catch (error) {
          console.error("Error while fetching pages:", error.message);
        }
      }
    };

    fetchPages();
    const fetchFollowers = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getUserFollowers.php?user_id=${user.id}`
          );
          if (response.status === 200) {
            setFollowers(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch followers");
          }
        } catch (error) {
          console.error("Error while fetching followers:", error.message);
        }
      }
    };

    fetchFollowers();
    const fetchFollowing = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getUserFollowing.php?user_id=${user.id}`
          );
          if (response.status === 200) {
            setFollowing(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch following");
          }
        } catch (error) {
          console.error("Error while fetching following:", error.message);
        }
      }
    };

    fetchFollowing();
    const fetchFriends = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getUserFriends.php?user_id=${user.id}`
          );
          if (response.status === 200) {
            setFriends(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch friends");
          }
        } catch (error) {
          console.error("Error while fetching friends:", error.message);
        }
      }
    };

    fetchFriends();

    const intervals = [
      setInterval(fetchPages, 10000),
      setInterval(fetchFollowers, 10000),
      setInterval(fetchFollowing, 10000),
      setInterval(fetchFriends, 10000),
    ];

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [user]);
  useEffect(() => {
    const fetchSearch = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/getSearchUser.php?q=${searchQuery}&user_id=${user.id}`
          );
          if (response.status === 200) {
            setSearchData(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch search");
          }
        } catch (error) {
          console.error("Error while fetching friends:", error.message);
        }
      }
    };
    const fetchTeammates = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/get-team-mates.php?user_id=${user.id}`
          );
          // console.log("Teammates",response.data);

          if (response.status === 200) {
            setTeammates(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch search");
          }
        } catch (error) {
          console.error("Error while fetching friends:", error.message);
        }
      }
    };

    fetchSearch();
    fetchTeammates();
  }, [user, searchQuery]);
  // console.log(searchQuery);
  return (
    <View style={{ backgroundColor: "#078bd6", flex: 1 }}>
      <View style={{ marginTop: 50, padding: 10 }}>
        {user && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 20,
            }}
          >
            <View
              style={{
                padding: 10,
                backgroundColor: "white",
                borderRadius: 15,
              }}
            >
              <QRCode
                value={`https://wowfy.com/?user_id=${user.mobile}`}
                logo={require("../assets/images/wowcoin.png")}
                logoSize={30}
                size={wp(35)}
                logoBackgroundColor="transparent"
              />
            </View>
          </View>
        )}
        <View style={{ marginTop: 15 }}>
          <List.AccordionGroup>
            {/* <List.Accordion
              style={{ backgroundColor: "#078bd6" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="book-open-page-variant"
                  color={"white"}
                />
              )}
              title="Pages"
              titleStyle={{ color: "white", fontFamily: "raleway-bold" }}
              id="1"
            >
              <FlatList
                data={userPages}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={
                  <View>
                    <View style={{ height: 10 }} />
                  </View>
                }
                renderItem={({ index, item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                      paddingBottom: 10,
                    }}
                    onPress={() =>
                      navigation.navigate("Moviehome", {
                        movieId: item.id,
                      })
                    }
                  >
                    <Image
                      source={{ uri: `${baseImgURL + item.icon}` }}
                      style={{ width: wp(10), height: wp(10), borderRadius: 8 }}
                      resizeMode="contain"

                    />
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: "white",
                        fontFamily: "raleway",
                      }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </List.Accordion> */}
            <Divider />
            <List.Accordion
              style={{ backgroundColor: "#078bd6" }}
              // left={(props) => (
              //   <List.Icon {...props} icon="human-male-male" color={"white"} />
              // )}
              titleStyle={{ color: "white", fontFamily: "raleway-bold" }}
              title="Teammates"
              id="1"
            >
              <FlatList
                data={teammates}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={
                  <View>
                    <View style={{ height: 10 }} />
                  </View>
                }
                renderItem={({  item,index }) => <TeamMates item={item} />}
              />
            </List.Accordion>
            <Divider className="mt-2"/>
            {/* 
            <List.Accordion
              style={{ backgroundColor: "#078bd6" }}
              left={(props) => (
                <List.Icon {...props} icon="human-male-male" color={"white"} />
              )}
              titleStyle={{ color: "white", fontFamily: "raleway-bold" }}
              title="Friends"
              id="2"
            >
              <FlatList
                data={friends}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={
                  <View>
                    <View style={{ height: 10 }} />
                  </View>
                }
                renderItem={({ index, item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                      paddingBottom: 10,
                    }}
                    onPress={() => {
                      navigation.navigate("OtherUserScreen", {
                        user_id: item?.goto_id,
                      });
                    }}
                  >
                    {item.user_image?.length > 0 ? (
                      <Image
                        source={{ uri: `${baseImgURL + item.user_image}` }}
                        style={{
                          width: wp(10),
                          height: wp(10),
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <View className="p-1 bg-[#ff8f8e] rounded-full w-[5vh] h-[5vh] justify-center items-center">
                        <Text
                          style={{
                            fontSize: hp(2),
                            fontFamily: "raleway-bold",
                            color: "white",
                          }}
                        >
                          {item.first_character}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: "white",
                        fontFamily: "raleway",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </List.Accordion>
            <Divider />
            <List.Accordion
              style={{ backgroundColor: "#078bd6" }}
              left={(props) => (
                <List.Icon {...props} icon="human-queue" color={"white"} />
              )}
              titleStyle={{ color: "white", fontFamily: "raleway-bold" }}
              title="Followers"
              id="3"
            >
              <FlatList
                data={followers}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={
                  <View>
                    <View style={{ height: 10 }} />
                  </View>
                }
                renderItem={({ index, item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                      paddingBottom: 10,
                    }}
                    onPress={() => {
                      navigation.navigate("OtherUserScreen", {
                        user_id: item?.followed_user,
                      });
                    }}
                  >
                    {item.user_image?.length > 0 ? (
                      <Image
                        source={{ uri: `${baseImgURL + item.user_image}` }}
                        style={{
                          width: wp(10),
                          height: wp(10),
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <View className="p-1 bg-[#ff8f8e] rounded-full w-[5vh] h-[5vh] justify-center items-center">
                        <Text
                          style={{
                            fontSize: hp(2),
                            fontFamily: "raleway-bold",
                            color: "white",
                          }}
                        >
                          {item.first_character}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: "white",
                        fontFamily: "raleway",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </List.Accordion>
            <Divider />
            <List.Accordion
              style={{ backgroundColor: "#078bd6" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="human-male-height"
                  color={"white"}
                />
              )}
              titleStyle={{ color: "white", fontFamily: "raleway-bold" }}
              title="Following"
              id="4"
            >
              <FlatList
                data={following}
                keyExtractor={(item, index) => index}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={
                  <View>
                    <View style={{ height: 10 }} />
                  </View>
                }
                renderItem={({ index, item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      alignItems: "center",
                      paddingBottom: 10,
                    }}
                    onPress={() => {
                      navigation.navigate("OtherUserScreen", {
                        user_id: item?.user_id,
                      });
                    }}
                  >
                    {item.user_image?.length > 0 ? (
                      <Image
                        source={{ uri: `${baseImgURL + item.user_image}` }}
                        style={{
                          width: wp(10),
                          height: wp(10),
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <View className="p-1 bg-[#ff8f8e] rounded-full w-[5vh] h-[5vh] justify-center items-center">
                        <Text
                          style={{
                            fontSize: hp(2),
                            fontFamily: "raleway-bold",
                            color: "white",
                          }}
                        >
                          {item.first_character}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: "white",
                        fontFamily: "raleway",
                      }}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </List.Accordion>
            <Divider /> */}
          </List.AccordionGroup>
        </View>
      </View>
    </View>
  );
};

export default CustomNestedDrawer;
const styles = StyleSheet.create({});
