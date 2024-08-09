import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Divider, FAB, Modal, PaperProvider, Portal } from "react-native-paper";
import { AntDesign, Entypo } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const Followpage = ({ route }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [pages, setPages] = useState([]);
  const [visible, setVisible] = React.useState(false);
  const [text, setText] = React.useState("");
  // const selectedTopic = route.params.selectedEvents;
  // console.log(selectedTopic)
  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setText("");
  };

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
  }, [navigation]);

  useEffect(() => {
    // if (user?.steps >= 2) {
    //   navigation.replace("InnerPage");
    // }
  }, [user, navigation]);

  const handleMovieSelection = (pageId) => {
    setSelectedEvents((prevSelectedMovies) => {
      if (prevSelectedMovies.includes(pageId)) {
        return prevSelectedMovies.filter((id) => id !== pageId);
      } else {
        return [...prevSelectedMovies, pageId];
      }
    });
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/getAllPages.php`,
          {
            text: text,
            // type: ["places"] // Convert to JSON string
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        // console.log(response);

        if (response.status === 200) {
          setPages(response.data);
        } else {
          console.error("Invalid response format or failed to fetch pages");
          setPages([]);
        }
      } catch (error) {
        console.error("Error while fetching pages:", error.message);
      }
    };

    fetchMovies();
  }, [text]); // Include selectedTopic in the dependency array

  const continueToNextScreen = async () => {
    if (selectedEvents.length >= 2) {
      const selectedEventsWithImages = selectedEvents.map((pageId) =>
        pages.find((page) => page.id === pageId)
      );

      const data = {
        userId: user.id,
        selectedEvents: selectedEventsWithImages,
      };
      try {
        const response = await axios.post(`${baseURL}/follow.php`, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        // console.log(response.data)
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...user, steps: 3 })
        );
        navigation.replace("InnerPage");
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
      }
    } else {
      alert("Please follow at least 2 pages to continue.");
    }
  };
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };
  return (
    <PaperProvider style={styles.container}>
      <View
        style={{ justifyContent: "center", alignItems: "center", padding: 15 }}
      >
        <Image
          source={require("../assets/logos/wowfy-blue.png")}
          style={styles.logo}
        />
        <Text style={styles.caption}>Follow at least 2 pages to continue</Text>
        <TouchableOpacity
          onPress={showModal}
          style={{
            backgroundColor: "#ffffff",
            width: "100%",
            borderRadius: 15,
            padding: 15,
            flexDirection: "row",
            marginTop: 20,
          }}
        >
          <Text style={{ fontSize: 16, flex: 1, marginLeft: 10 }}>
            Search...
          </Text>
          <Entypo name="magnifying-glass" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          dismissable={false}
          contentContainerStyle={styles.containerStyle}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={hideModal}>
            <AntDesign name="closecircleo" size={24} color="gray" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginTop: 35 }}>
            <View style={{ flexDirection: "column" }}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#E5E5E5",
                  padding: 10,
                  borderTopLeftRadius: 13,
                  borderTopRightRadius: 13,
                }}
              >
                <TextInput
                  placeholder="Search"
                  style={{ flex: 1 }}
                  onChangeText={(tetxValue) => setText(tetxValue)}
                />
                <Entypo name="magnifying-glass" size={24} color="gray" />
              </View>
              <Divider style={{ height: 2 }} />
              {pages.length > 0 ? (
                <FlatList
                  data={pages}
                  keyExtractor={(item, index) => index}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={<Divider />}
                  renderItem={({ index, item }) => (
                    <TouchableOpacity
                      style={[
                        styles.containerModal,
                        selectedEvents.includes(item.id) &&
                          styles.selectedMovie,
                      ]}
                      onPress={() => handleMovieSelection(item.id)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: `${baseImgURL + item.icon}` }}
                        style={{ height: 50, width: 50, borderRadius: 12 }}
                        resizeMode="contain"
                      />
                      <Text style={{ fontFamily: "raleway-bold" }}>
                        {truncateText(item.title, 20)}
                      </Text>
                      <Text>{item.type}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 15,
                  }}
                >
                  <Text style={{ fontFamily: "raleway-bold", fontSize: 18 }}>
                    Sorry no data found
                  </Text>
                </View>
              )}
              <View
                style={{
                  backgroundColor: "#E5E5E5",
                  height: 5,
                  borderBottomRightRadius: 13,
                  borderBottomLeftRadius: 13,
                }}
              />
            </View>
          </View>
        </Modal>
      </Portal>
      <View style={{ flex: 1 }}>
        <FlatList
          data={pages}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.moviesContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View>
              <View style={{ height: 10 }} />
            </View>
          }
          renderItem={({ index, item }) => (
            <TouchableOpacity
              style={[
                styles.movieBlock,
                selectedEvents.includes(item.id) && styles.selectedMovie,
                { marginRight: index % 2 !== 0 ? 0 : 10 },
              ]}
              onPress={() => handleMovieSelection(item.id)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: `${baseImgURL + item.icon}` }}
                style={styles.movieImage}
                resizeMode="contain"
              />
              <Text style={styles.movieName}>{item.title}</Text>
              {/* <Text style={styles.languageName}>{item.description}</Text> */}
            </TouchableOpacity>
          )}
        />
      </View>
      {/* <FAB icon="magnify" color="black" style={styles.fab} onPress={showModal} /> */}
      <View style={styles.btn}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={continueToNextScreen}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
};

export default Followpage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    resizeMode: "contain",
    width: 80,
    height: 80,
    top: 30,
  },
  caption: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: "raleway-bold",
    top: 20,
  },
  moviesContainer: {
    paddingTop: 20,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  movieBlock: {
    width: "48%",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: "center",
  },
  selectedMovie: {
    backgroundColor: "lightblue",
  },
  btn: {
    justifyContent: "center",
    alignItems: "center",
  },
  movieImage: {
    width: wp(40),
    height: hp(20),
    borderRadius: 10,
  },
  movieName: {
    fontSize: 18,
    fontFamily: "raleway-bold",
    textAlign: "center",
    marginTop: 5,
  },
  languageName: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 1,
  },
  continueButton: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    marginBottom: 17,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "raleway-bold",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 50,
    right: 0,
    bottom: 0,
    backgroundColor: "#E5E5E5",
    color: "black",
  },
  containerStyle: {
    backgroundColor: "white",
    padding: 10,
    margin: 10,
    flex: 1,
    borderRadius: 25,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    margin: 5,
  },
  containerModal: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    padding: 10,
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
