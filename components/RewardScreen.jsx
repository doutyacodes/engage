import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import wowfy_white from "../assets/logos/wowfy_white.png";
import { AntDesign } from "@expo/vector-icons";
import RewardCard from "./RewardCard";

const RewardScreen = () => {
  const DummyData = [
    {
      title: "Reward 1",
      reward_points: 100,
      status: "pending",
      comment: "Pending approval",
    },
    {
      title: "Reward 2",
      reward_points: 200,
      status: "approved",
    },
    {
      title: "Reward 3",
      reward_points: 150,
      status: "rejected",
      comment: "Not eligible",
    },
  ];

  const FirstRoute = () => (
    <View style={{ flex: 1, backgroundColor: "#673ab7" }}></View>
  );

  const SecondRoute = () => (
    <View style={{ flex: 1, backgroundColor: "#673ab7" }} />
  );
  const HistoryRoute = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white", marginHorizontal: "auto" }}
    >
      <View style={{alignItems:"center",gap:8,paddingTop:15}}>
      {/* {DummyData.map((item, index) => {
        return <RewardCard item={item} index={index} key={index} />;
      })} */}
      {/* {DummyData.map((item, index) => {
        return <RewardCard item={item} index={index} key={index} />;
      })} */}
      </View>
    </ScrollView>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: HistoryRoute,
  });

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "First" },
    { key: "second", title: "Second" },
    { key: "third", title: "History" },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        // Button Linear Gradient
        colors={["#6938ef", "#6938ef", "#6938ef"]}
        style={styles.linearG}
      >
        <View>
          <View style={{ alignItems: "center" }}>
            <Image source={wowfy_white} style={styles.topLogo} />
          </View>
        </View>
        <View style={{ paddingTop: 50, paddingHorizontal: 15 }}>
          <Text style={{ fontSize: hp(3), color: "white", fontFamily: "raleway-bold" }}>
            Rewards
          </Text>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 15,
            }}
          >
            <View
              style={{
                width: "100%",
                minHeight: 25,
                backgroundColor: "white",
                borderRadius: 10,
              }}
            >
              <View style={{ flexDirection: "row", padding: 10, gap: 10 }}>
                <View>
                  <AntDesign name="star" size={hp(8)} color="gold" />
                </View>
                <View>
                  <Text style={{ fontSize: hp(2.7), fontFamily: "raleway-bold" }}>
                    365
                  </Text>
                  <Text style={{ fontSize: hp(2.1), color: "gray" }}>
                    Available Points
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        indicatorStyle={{ backgroundColor: "white" }}
        style={{ backgroundColor: "pink" }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            renderLabel={({ route, color }) => (
              <Text style={{ color: "black", margin: 8 }}>{route.title}</Text>
            )}
            style={{ backgroundColor: "white" }}
          />
        )} // <-- add this line
      />
    </View>
  );
};

export default RewardScreen;

const styles = StyleSheet.create({
  topLogo: {
    height: 50,
    width: 50,
    top: 50,
  },
  linearG: {
    minHeight: hp(15),
    width: wp(100),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
});
