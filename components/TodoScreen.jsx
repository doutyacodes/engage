// TodoScreen.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import wowfy_black from "../assets/logos/wowfy_black.png";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import { StatusBar } from "expo-status-bar";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskHomeCard from "./TaskHomeCard";
import { FontAwesome,Feather,Ionicons } from "@expo/vector-icons";
import TopBar from "./AppComponents/TopBar";

const TodoScreen = () => {
  const navigation = useNavigation();

  const [todoData, setTodoData] = useState([]);
  const [arenaTodo, setArenaTodo] = useState([]);
  const [user, setUser] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          // console.log(storedUser)
        } else {
          navigation.navigate("OtpVerification")
        }
      } catch (error) {
        console.error("Error while fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchTodo = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            const response = await axios.get(
              `${baseURL}/getAlltodoTasks.php?user_id=${user.id}`
            );
            // console.log(response.data);
            if (response.status === 200) {
              setTodoData(response.data.tasks);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch progress");
            }
          } catch (error) {
            console.error("Error while fetching progress:", error.message);
          }
        }
      };

      fetchTodo();
      const fetchArenaTofo = async () => {
        if (user) {
          try {
            // Only fetch rewards if user data is available
            const response = await axios.get(
              `${baseURL}/getArenaTodos.php?user_id=${user.id}`
            );

            if (response.status === 200) {
              setArenaTodo(response.data.tasks);
              // console.log(response.data);
            } else {
              console.error("Failed to fetch progress arena");
            }
          } catch (error) {
            console.error(
              "Error while fetching progress arena:",
              error.message
            );
          }
        }
      };

      fetchArenaTofo();
    }, [isFocused, user])
  );

  const SecondRoute = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        data={todoData}
        keyExtractor={(item, index) => index}
        contentContainerStyle={styles.moviesContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 10 }} />
          </View>
        }
        renderItem={({ index, item }) => <TaskHomeCard item={item} />}
      />
    </View>
  );
  const ThirdRoute = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        data={arenaTodo}
        keyExtractor={(item, index) => index}
        contentContainerStyle={styles.moviesContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 10 }} />
          </View>
        }
        renderItem={({ index, item }) => <TaskHomeCard item={item} />}
      />
    </View>
  );
  const renderScene = SceneMap({
    arena: SecondRoute,
    third: ThirdRoute,
  });

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "arena", title: "In Progress" },
    // { key: "third", title: "Arena" },
  ]);
  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
      <TopBar marginTop={40}  user={user}  />

      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        indicatorStyle={{ backgroundColor: "white" }}
        style={{ backgroundColor: "#e5e5e5" }}
        renderTabBar={(props) => (
          <TabBar
            indicatorStyle={{ backgroundColor: "black" }}
            {...props}
            renderLabel={({ route, color }) => (
              <Text
                style={{
                  color: "black",
                  margin: 8,
                  fontFamily: "raleway-bold",
                  fontSize: hp(1.8),
                }}
              >
                {route.title}
              </Text>
            )}
            style={{ backgroundColor: "white" }}
          />
        )} // <-- add this line
      />
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

export default TodoScreen;
