import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import React, { useEffect, useState } from "react";
import TopBar from "./AppComponents/TopBar";
import {
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";

const TotalApplause = ({ route }) => {
  const [totalStars, setTotalStars] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeRoute = route.params.type;
  const { user } = useGlobalContext(); // Replace with actual user ID

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/get-user-stars.php?user_id=${user.id}&type=${typeRoute}`
      );
      console.log(response.data);
      if (response.data.success && response.data.users) {
        setUsers(response.data.users);
        setTotalStars(response.data.count);
      }
    } catch (err) {
      console.error("Error fetching stars:", err);
    } finally {
      setLoading(true);
    }
  };
  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-[#f5f5f5]">
          <TopBar marginTop={40} />
          <View className="items-end p-4">
            <Text className=" text-lg" style={{ fontFamily: "raleway-bold" }}>
              Received{" "}
              <Text className=" text-yellow-400">
                {typeRoute == "stars" ? (
                  <AntDesign name="star" size={24} />
                ) : (
                  <MaterialCommunityIcons name="hand-clap" size={24} />
                )}
              </Text>{" "}
              : <Text>{totalStars}</Text>
            </Text>
          </View>
          <FlatList
            data={users}
            // data={[]}
            keyExtractor={(item, index) => index}
            contentContainerStyle={{ flexGrow: 1, padding: 15 }}
            ItemSeparatorComponent={<View style={{ height: 10 }} />}
            renderItem={({ item, index }) => (
              <View className="w-full shadow-md border border-black/5 shadow-slate-400 bg-white rounded-lg p-4">
                <View className="flex-row space-x-2 items-center">
                  <View style={styles.avatarContainer}>
                    {item.image?.length > 0 ? (
                      <Image
                        style={{
                          width: wp(15),
                          height: wp(15),
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                        source={{ uri: `${baseImgURL + item.image}` }}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {item.first_character}
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontFamily: "raleway" }}>
                    <Text
                      className="text-lg "
                      style={{ fontFamily: "raleway-bold" }}
                    >
                      {item.name}
                    </Text>{" "}
                    has given {item.greeting_count}{" "}
                    {typeRoute == "stars" ? "stars" : "applause"}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 min-h-[70vh] justify-center items-center">
                {loading ? (
                  <ActivityIndicator size={"small"} color={"red"} />
                ) : (
                  <Text
                    style={{ fontFamily: "raleway-bold" }}
                    className="text-xl text-center"
                  >
                    No {typeRoute} exists yet!
                  </Text>
                )}
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default TotalApplause;
const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: wp(15),
    width: wp(15),
    backgroundColor: "#ff8f8e",
    borderRadius: 50,
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
});
