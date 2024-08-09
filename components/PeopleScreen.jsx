// PeopleScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import wowfy_black from "../assets/logos/wowfy_black.png";
import axios from "axios";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { baseImgURL, baseURL } from "../backend/baseData";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import CertificateList from "./CertificateList";
import TopBar from "./AppComponents/TopBar";
const PeopleScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [peopleData, setPeopleData] = useState([]);
  const [user, setUser] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser)
        } else {
          navigation.navigate("OtpVerification");
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchPeople = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            const response = await axios.get(
              `${baseURL}/getBuzzPeople.php?userId=${user.id}`
            );

            if (response.status === 200) {
              setPeopleData(response.data);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch people");
            }
          } catch (error) {
            console.error("Error while fetching people:", error.message);
          }
        }
      };

      fetchPeople();
    }, [isFocused, user])
  );
  useEffect(() => {
    const fetchSearch = async () => {
      if (user && searchText.length > 0) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/searchUser.php?user_id=${user.id}&text=${searchText}`
          );

          if (response.status === 200) {
            setSearchData(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch users");
          }
        } catch (error) {
          console.error("Error while fetching users:", error.message);
        }
      }
      if (searchText.length <= 0) {
        setSearchData([]);
      }
    };

    fetchSearch();
  }, [searchText]);
  // console.log(searchData.length)
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <TopBar marginTop={40} user={user} />
      </View>
      <View style={{ position: "relative", marginVertical: 15, zIndex: 200 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("SearchScreen")}
          style={{
            flexDirection: "row",
            marginHorizontal: 10,
            borderRadius: 13,
            backgroundColor: "#E5E5E5",
            padding: 15,
          }}
        >
          <Text style={{ color: "gray", fontFamily: "raleway" }}>
            Explore Connections...
          </Text>
        </TouchableOpacity>
        {/* {searchData && searchData?.length > 0 && (
          <View
            style={{
              paddingHorizontal: 10,
              position: "absolute",
              zIndex: 120,
              width: "100%",
              top: 63,
            }}
          >
            <FlatList
              data={searchData}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={
                <View>
                  <View style={{ height: 3 }} />
                </View>
              }
              renderItem={({ index, item }) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    padding: 10,
                    borderColor: "#909090",
                    borderWidth: 1,
                    borderRadius: 5,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  onPress={() =>
                    navigation.navigate("OtherUserScreen", {
                      user_id: item.id,
                    })
                  }
                >
                  <Text style={{ fontSize: hp(1.8) }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )} */}
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={peopleData}
          keyExtractor={(item, index) => index}
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 10 }} />
            </View>
          }
          renderItem={({ index, item }) => (
            <CertificateList
              item={item}
              index={index}
              user_id={user.id}
              arena={null}
            />
          )}
          ListEmptyComponent={() => (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
                No data found.
              </Text>
            </View>
          )}
        />
      </View>

      <StatusBar style="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topLogo: {
    height: 50,
    width: 50,
    // marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  settingsIcon: {
    padding: 1,
    position: "relative",
    zIndex: 800,
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
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
  titleContainer: {
    backgroundColor: "#E32636",
    width: "100%",
    marginTop: 15,
  },
  title: {
    fontSize: 25,
    fontFamily: "raleway-bold",
    color: "white",
    padding: 10,
    textAlign: "center",
  },
  selectedMoviesContainer: {
    marginTop: 15,
  },
  movieInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedMovieBlock: {
    width: "100%",
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    padding: 5,
  },
  moviesContainer: {
    paddingTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  selectedMovieImage: {
    width: 30,
    height: 40,
    borderRadius: 5,
  },
  caption: {
    fontSize: 14,
    color: "black",
  },
  latestMediaContainer: {
    marginTop: 10,
    backgroundColor: "lightgrey",
    height: 150,
    width: "100%",
    borderRadius: 10,
  },
  selectedMovieName: {
    fontSize: 14,
    fontFamily: "raleway-bold",
    color: "black",
  },
});

export default PeopleScreen;
