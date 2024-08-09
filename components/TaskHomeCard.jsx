import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { baseImgURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const TaskHomeCard = ({ item }) => {
  // console.log(item.pending_task);
  const navigation = useNavigation();
  const formattedDate = moment(item.start_date).fromNow();
  let statusValue;
  if (item.pending_task == "yes" || item.frequency=="food" || item.frequency=="experience") {
    statusValue = "Continue";
  } else {
    statusValue = "Pending";
  }
  
  const handleDetails =()=>{
    if(statusValue=="Continue"){
        if(item.frequency=="food" || item.frequency=="experience")
          {
            navigation.navigate("FoodLocation", {
              challenge: {
                challenge_id:item.challenge_id,
                page_id:item.page_id,
                title:item.challenge_title,
                description:item.description,
                entry_points:item.entry_points,
                reward_points:item.reward_points,
              },
              type: item.frequency,
            });
          }
          else{
            navigation.navigate("ChallengesList", {
              challenge: item.challenge,
              selectedMovie: item.selectedMovie,
            });

          }
    }
  }
  // console.log(item.image);
  return (
    <View>
      <View
        style={{
          backgroundColor: "white",
          marginTop: 10,
          padding: 5,
          borderRadius: 13,
        }}
      >
        <TouchableOpacity
          style={{
            paddingLeft: 5,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
          
        >
          <Image
            source={{ uri: `${baseImgURL + item.selectedMovie.image}` }}
            style={{
              borderColor:"lightgray",borderWidth:1,
              width: wp(10),
              minHeight: wp(10),
              borderRadius: 77,
              opacity:statusValue=="Continue" ? 1 : 0.2
            }}
          />
          <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(1.8) }}>
              {item.selectedMovie.title}{" "}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, marginTop: 8 }}
          onPress={handleDetails}
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
                source={{ uri: `${baseImgURL + item.image}` }}
                style={{
                  width: "100%",
                  height: hp(20),
                  borderRadius: 15,borderColor:"lightgray",borderWidth:1,
                  opacity:statusValue=="Continue" ? 1 : 0.2,
                  marginLeft:"auto",
                  marginRight:"auto"
                }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flexDirection: "column", gap: 3, flex: 1 }}>
              <Text style={{ fontSize: hp(1.9), fontFamily: "raleway-bold" }}>
                {item.task_name}
              </Text>
              <Text style={{ fontSize: hp(1.5), fontFamily: "raleway-semibold" }}>
                {item.challenge_title}
              </Text>
              <Text style={{ color: "gray",fontFamily: "raleway" }}>{formattedDate}</Text>
              <Divider style={{ width: "100%", marginVertical: 5 }} />
              <View style={{ gap: 3 }}>
                <View style={{ flexDirection: "row", gap: 15, justifyContent:"space-around"}}>
                  <View>
                    <Text
                      style={{
                        color: "gray",
                        fontSize: hp(1.5),
                        fontFamily: "raleway"
                      }}
                    >
                      Entry Fee
                    </Text>
                    <Text style={{fontFamily: "raleway"}}>
                      {item.entry_points == 0
                        ? "Nill"
                        : item.entry_points + " Points"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: "gray",
                        fontSize: hp(1.5),
                        fontFamily: "raleway"
                      }}
                    >
                      Reward Points
                    </Text>
                    <Text style={{fontFamily: "raleway"}}>
                      {item.reward_points == 0
                        ? "Nill"
                        : item.reward_points + " Points"}
                    </Text>
                  </View>
                <View style={{  gap: 5 }}>
                  <Text
                    style={{
                      color: "gray",
                      fontSize: hp(1.5),
                      fontFamily: "raleway"
                    }}
                  >
                    Current Status :
                  </Text>
                  <Text
                    style={{
                      fontSize: hp(1.5),
                      fontFamily: "raleway"
                    }}
                  >
                    {statusValue}
                  </Text>
                </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskHomeCard;
