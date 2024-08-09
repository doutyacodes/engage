import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import NotificationItem from "./NotificationComponent/NotificationItem";
import { Divider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const NotificationScreen = () => {
  const [user, setUser] = useState(null);
  const [notificationDetails, setNotificationDetails] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          if (storedUser?.steps == 1) {
            PassNav = "DetailSignup";
          }
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
  const makeItSeen = async () => {
    if (user) {
      try {
        // Only fetch rewards if user data is available
        const response = await axios.get(
          `${baseURL}/notificationSeen.php?userId=${user.id}`
        );

        if (response.status === 200) {
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error while make the notification seen:", error.message);
      }
    }
  };
  useEffect(() => {
    const fetchNotification = async () => {
      if (user) {
        try {
          // Only fetch rewards if user data is available
          const response = await axios.get(
            `${baseURL}/getNotification.php?userId=${user.id}`
          );

          if (response.status === 200) {
            setNotificationDetails(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch notification");
          }
        } catch (error) {
          console.error("Error while fetching notification:", error.message);
        }
      }
    };
    fetchNotification();
  }, [user]);
  useEffect(() => {
    setTimeout(() => {
      makeItSeen();
    }, 2000);
  }, []);
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 10 ? top : 30;
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        marginTop: Platform.OS == "android" ? 30 : 0,
      }}
    >
      <FlatList
        data={notificationDetails}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View>
            {/* <View style={{ height: 10 }} /> */}
            <Divider />
          </View>
        )}
        renderItem={({ item, index }) => {
          return <NotificationItem item={item} index={index} />;
        }}
        ListHeaderComponent={() => (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <TouchableOpacity
              className="ml-3"
              onPress={() => navigation.goBack()}
            >
              <Entypo name="chevron-left" size={26} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: hp(2.3), fontFamily: "raleway-bold" }}>
              Notifications
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
              No notifications for you.
            </Text>
          </View>
        )}
        contentContainerStyle={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({});
