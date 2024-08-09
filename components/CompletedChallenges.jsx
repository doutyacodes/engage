import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { baseImgURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Modal, PaperProvider, Portal } from "react-native-paper";
import {
  Entypo,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
const CompletedChallenges = ({
  item,
  user_id,
  currentUser,
  fetchAchievementData,
}) => {
  const [visible, setVisible] = useState(false);
  const [userText, setUserText] = useState(false);
  // console.log("currentUser",currentUser)
  // console.log("item",item.challenge_id)
  useEffect(() => {
    item.achieved ? setUserText(true) : setUserText(false);
  }, []);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const handleButtonClick = () => {
    // Assuming you have userId and challengeId available within your component
    fetchAchievementData(currentUser, item.challenge_id);
    setUserText(!userText);
    hideModal();
  };
  return (
    <PaperProvider>
      <View
        style={{
          padding: 10,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,

          elevation: 3,
          borderRadius: 12,
          position: "relative",
        }}
      >
        <View style={{ flexDirection: "row", gap: 5, position: "relative" }}>
          <View>
            <Image
              style={{ width: wp(20), height: wp(20), borderRadius: 12 }}
              source={{
                uri:
                  item.uploaded_image?.length > 0
                    ? `${baseImgURL + item.uploaded_image}`
                    : `${baseImgURL + item.image}`,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: hp(1.5), fontFamily: "raleway-bold" }}>
              {item.page_title}
            </Text>
            <Text style={{ fontSize: hp(1.3), fontFamily: "raleway-semibold" }}>
              {item.title}
            </Text>
            <View>
              <Text style={{ fontSize: hp(1.3), fontFamily: "raleway" }}>
                Points earned: {item.earned_points}
              </Text>
              <Text style={{ fontSize: hp(1.3), fontFamily: "raleway" }}>
                Rank : {item.user_rank}
              </Text>
            </View>
          </View>
          {user_id == currentUser && (
            <TouchableOpacity onPress={showModal}>
              <MaterialCommunityIcons
                name="medal"
                size={28}
                color={userText ? "gold" : "gray"}
              />
            </TouchableOpacity>
          )}
        </View>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={styles.containerStyle}
          >
            <TouchableOpacity onPress={handleButtonClick}>
              <Text style={{ fontSize: hp(1.5), fontFamily: "raleway-bold" }}>
                {userText ? "Remove from achievements" : "Move to achievements"}
              </Text>
            </TouchableOpacity>
          </Modal>
        </Portal>
        {item.arena == "yes" && (
          <View style={{ position: "absolute", bottom: 10, right: 20 }}>
            <FontAwesome6 name="building-columns" size={20} color={"green"} />
          </View>
        )}
      </View>
    </PaperProvider>
  );
};

export default CompletedChallenges;

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: "white",
    padding: 20,
    width: wp(60),
    position: "absolute",
    top: 0,
    right: 30,
    borderRadius: 10,
  },
});
