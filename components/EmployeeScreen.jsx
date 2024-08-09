import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "./AppComponents/TopBar";
import { baseImgURL, baseURL } from "../backend/baseData";
import { AntDesign ,MaterialCommunityIcons} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { useGlobalContext } from "../context/GlobalProvider";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CompanyChat from "./AppComponents/CompanyChat";
const EmployeeScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState([]);
  const { user } = useGlobalContext();
  // console.log(user)
  useEffect(() => {
    const getEmployee = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/get-identity.php?user_id=${user.id}`
          );
          console.log(response.data)
          if (response.data.success && response.data.employee) {
            setEmployee(response.data.employee);
            setIsLoading(false);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    getEmployee();
  }, [user]);
  const navigation = useNavigation();
  const IDRoute = () => (
    <View className="flex-1 bg-blue-200">
      <ScrollView
        className=" flex-1 bg-blue-200 p-3  space-y-2"
        showsVerticalScrollIndicator={false}
      >
        {/* {console.log(employee?.image)} */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color={"red"} size={"small"} />
          </View>
        ) : (
          <>
            {employee && (
              <View className="w-full min-h-[60vh] bg-[#eef0ef] p-4 rounded-lg">
                <View
                  className=" flex-1 justify-center items-center "
                  style={{
                    backgroundColor: employee?.color
                      ? employee?.color
                      : "#00bf63",
                  }}
                >
                  <View className="bg-white p-1.5 rounded-full">
                    <Image
                      source={{
                        uri: `${baseImgURL + employee?.image}`,
                      }}
                      className="h-[17vh] w-[17vh] rounded-full "
                    />
                  </View>
                </View>
                <View className="bg-white flex-1 items-center space-y-4 py-4 px-2">
                  <Text
                    className="text-3xl text-center"
                    style={{ fontFamily: "raleway-bold" }}
                  >
                    {employee?.name}
                  </Text>
                  <Text className="text-2xl text-center text-gray-500">
                  {employee?.employee_id}
                  </Text>
                  <View className="items-center space-y-1">
                    <Image
                      source={{
                        uri: `${baseImgURL + "doutya-technologies.png"}`,
                      }}
                      className="h-[10vh] w-[40vw] mt-2"
                      resizeMode="contain"
                    />
                    <Text className="text-sm text-center text-gray-500">
                      www.doutya.com
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      
      </ScrollView>
    </View>
  );
  const RequestRoute = () => (
    <View className="flex-1 bg-blue-200">
      <ScrollView
        className=" flex-1 bg-blue-200 p-3  space-y-2"
        showsVerticalScrollIndicator={false}
      >
        {/* {console.log(employee?.image)} */}
        
        <TouchableOpacity
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
          onPress={() => navigation.navigate("LeaveScreen")}
        >
          <Text className="text-blue-400">
            <AntDesign name="calendar" size={24} />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
            Leave Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("BreakScreen")}
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
        >
          <Text className="text-red-400">
            <AntDesign name="clockcircleo" size={24} />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
            Break Requests
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
  const NotificationRoute = () =>{
    return(
    <CompanyChat />
    )
  }
  const GreetingsRoute = () => (
    <View className="flex-1 bg-blue-200">
      <ScrollView
        className=" flex-1 bg-blue-200 p-3  space-y-2"
        showsVerticalScrollIndicator={false}
      >
        {/* {console.log(employee?.image)} */}
        
        <TouchableOpacity
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
          onPress={() => navigation.navigate("UserListScreen",{
            type:"applause"
          })}
        >
          <Text className="text-blue-400">
          <MaterialCommunityIcons name="hand-clap" size={24}  />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
            Give Applause
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("UserListScreen",{
            type:"stars"
          })}
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
        >
          <Text className="text-red-400">
            <AntDesign name="star" size={24} />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
          Give Stars
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("TotalApplause",{
            type:"stars"
          })}
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
        >
          <Text className="text-yellow-400">
          <AntDesign name="star" size={24}  />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
          Received Stars
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("TotalApplause",{
            type:"applause"
          })}
          className="w-full p-5 bg-white rounded-md flex-row items-center space-x-3"
        >
          <Text className="text-yellow-400">
          <MaterialCommunityIcons name="hand-clap" size={24}  />
          </Text>
          <Text className=" text-base" style={{ fontFamily: "raleway-bold" }}>
          Received Applause
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
  const renderScene = SceneMap({
    idcard: IDRoute,
    requests: RequestRoute,
    company: NotificationRoute,
    greetings: GreetingsRoute,
  });

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "idcard", title: "ID" },
    { key: "requests", title: "Requests" },
    { key: "company", title: "Notification" },
    { key: "greetings", title: "Greetings" },
  ]);
  return (
    <View className="flex-1 bg-[#f5f5f5]">
       <TopBar marginTop={40} />
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
            scrollEnabled
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

export default EmployeeScreen;
