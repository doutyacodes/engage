import {
  View,
  Text,
  ScrollView,
  Touchable,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGlobalContext } from "../../context/GlobalProvider";
import { baseImgURL, baseURL } from "../../backend/baseData";
import { useNavigation } from "@react-navigation/native";

const Companies = () => {
  const [userPages, setUserPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();
  const navigation = useNavigation();
  //   console.log(user)

  const fetchUserPages = async () => {
    try {
      // Only fetch rewards if user data is available
      const response = await axios.get(
        `${baseURL}/get-all-user-pages.php?user_id=${user ? user.id : null}`
      );
      //   console.log(response.data)
      if (response.data.success) {
        setUserPages(response.data.data);
      }
    } catch (error) {
      console.error("Error while fetching pages:", error.message);
    }finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    fetchUserPages();
  }, [user]);
  return (
    <>
      {
        loading ? <View className="items-start">
          <ActivityIndicator color={"white"} size={"small"} />
        </View> : <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="p-3 max-h-28 w-full"
      >
        <View className=" items-center  flex-row space-x-3">
          {/* <Text style={{fontFamily:"raleway-bold"}}>My </Text> */}
          {userPages?.length > 0 &&
            userPages.map((item) => {
              return (
                <View key={item.id} className=" items-center flex-col">
                  <TouchableOpacity
                    className="p-1 rounded-md bg-white"
                    onPress={() =>
                      navigation.navigate("Moviehome", {
                        movieId: item.id,
                      })
                    }
                  >
                    <Image
                      className="w-10 h-10 object-cover"
                      source={{ uri: `${baseImgURL + item.icon}` }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Moviehome", {
                        movieId: item.id,
                      })
                    }
                  >
                    <Text
                      className="text-black text-center text-[9px] mt-2"
                      style={{ fontFamily: "raleway-bold" }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>
      </ScrollView>
      }
      {/* <View className="py-2 bg-white w-full " /> */}
    </>
  );
};

export default Companies;
