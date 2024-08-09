import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { baseImgURL } from "../../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import MarqueeText from "react-native-marquee";
import { Divider } from "react-native-paper";

const NewBuzzChallenge = ({ challenge, formattedDate, formattedEndDate }) => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        backgroundColor: "white",
        minHeight: hp(30),
        borderWidth: 1,
        borderColor: "lightgray",
        padding: hp(1.5),
        borderRadius: 13,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
      }}
    >
      <TouchableOpacity
        style={{
          paddingLeft: 5,
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
        onPress={() =>
          navigation.navigate("Moviehome", {
            movieId: challenge.page_id,
          })
        }
      >
        <View className="rounded-full border border-slate-300 p-1">

        <Image
          source={{ uri: `${baseImgURL + challenge.icon}` }}
          className="w-[6vw] h-[6vw]"
          resizeMode="contain"
        />
        </View>
        <View style={{ gap: 3 }}>
          <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.5) }}>
              {challenge.page_title}
            </Text>

            <Text
                style={{ fontSize: hp(1.5),fontFamily: "raleway"}}
                speed={10}
                marqueeOnStart={true}
                
                // loop={true}
                delay={500}
                className="text-slate-500"
              >
                has added a challenge
              </Text>
          </View>
          <Text style={{ color: "gray", fontSize: hp(1.3),fontFamily: "raleway" }}>
            {formattedDate}
          </Text>
        </View>
        {challenge.frequency == "referral" ? (
          <Text style={{ marginLeft: "auto", fontFamily: "raleway-bold" }}>
            {challenge.user_referral_count}/{challenge.referral_count}
          </Text>
        ) : (
          ""
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={{ flex: 1, marginTop: 8 }}
        onPress={() => {
          challenge.frequency == "referral"
            ? challenge.referral_count <= challenge.user_referral_count
              ? navigation.navigate("ChallengeDetails", {
                  pageId: challenge.page_id,
                  challenge: challenge,
                  selectedMovie: challenge.selectedTitle,
                })
              : Toast.show({
                  type: "info",
                  text1: "Sorry",
                  text2: `You need ${challenge.referral_count}  referrals to complete this challenge`,
                })
            : navigation.navigate("ChallengeDetails", {
                pageId: challenge.page_id,
                challenge: challenge,
                selectedMovie: challenge.selectedTitle,
              });
        }}
      >
        <View
          style={{
            padding: 5,
            // flexDirection: "row",
            // alignItems: "center",
            gap: 10,
          }}
        >
          <View>
            <Image
              source={{ uri: `${baseImgURL + challenge.image}` }}
              style={{
                height: hp(15), // Adjust the height of the image as needed
                width: "100%",
                borderRadius: 13,
                borderWidth: 1,
                borderColor: "lightgray",
              }}
              resizeMode="cover"
            />
          </View>
          <View style={{ flexDirection: "column", gap: 3, flex: 1 }}>
            <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
              {challenge.title.length > 40
                ? challenge.title.slice(0, 40) + "..."
                : challenge.title}{" "}
            </Text>
            <Divider style={{ width: "100%", marginVertical: 5 }} />
            <View style={{ gap: 3 }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 15,
                  justifyContent: "space-around",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      fontFamily: "raleway",
                    }}
                  >
                    Entry Fee
                  </Text>
                  <Text style={{ color: "gray" ,                      fontFamily: "raleway",
}}>
                    {challenge.entry_points == 0
                      ? "Nill"
                      : challenge.entry_points + " Points"}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      fontFamily: "raleway",
                    }}
                  >
                    Reward Points
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "gray",                      fontFamily: "raleway",
 }}>
                      {challenge.reward_points == 0
                        ? "Nill"
                        : challenge.reward_points + " Points"}
                    </Text>
                    {challenge.reward_points !== 0 &&
                      challenge.rewards == "yes" && (
                        <Text style={{ color: "gray", fontFamily: "raleway" }}>
                          {" "}
                          +{" "}
                        </Text>
                      )}
                    {challenge.rewards == "yes" && (
                      <Image
                        source={require("../../assets/images/gift.gif")}
                        style={{ height: 20, width: 20 }}
                      />
                    )}
                  </View>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      fontFamily: "raleway",
                    }}
                  >
                    Time Remaining
                  </Text>
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      color: "gray",
                      fontFamily: "raleway",

                    }}
                  >
                    {formattedEndDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NewBuzzChallenge;

const styles = StyleSheet.create({});
