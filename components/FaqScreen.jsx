import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { List } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
const FaqScreen = () => {
  const navigation = useNavigation()
  const faqData = [
    {
      id: 1,
      question: "How do I join a challenge?",
      answer:
        "To join a challenge, simply navigate to the challenges section of the app, browse through the available challenges, and click on the 'Join' button next to the challenge you're interested in.",
    },
    {
      id: 2,
      question: "Can I participate in multiple challenges at the same time?",
      answer:
        "Yes, you can participate in multiple challenges simultaneously. However, make sure you can commit enough time and effort to each challenge to make meaningful progress.",
    },
    {
      id: 3,
      question: "What happens if I miss a day of the challenge?",
      answer:
        "Missing a day won't disqualify you from the challenge, but it might affect your progress. Try to stay consistent, but if you miss a day, you can always continue with the challenge from where you left off.",
    },
    {
      id: 4,
      question: "How do I track my progress?",
      answer:
        "You can track your progress within each challenge by accessing the challenge details. Most challenges come with built-in progress tracking features that allow you to log your activities, view your achievements, and see how you compare to other participants.",
    },
    {
      id: 5,
      question: "What if I encounter technical issues during the challenge?",
      answer:
        "If you encounter any technical issues, such as app crashes or glitches, please reach out to our support team immediately. We're here to help you resolve any issues so you can continue enjoying the challenge.",
    },
  ];
  return (
    <View style={{ flex: 1, padding: 15 }}>
      <View style={{ marginTop: 40, marginBottom: 15, flexDirection: "row",justifyContent:"space-between",alignItems:"center" }}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Entypo name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <View >
          <Text style={{ fontSize: hp(2.5), fontFamily: "raleway-bold" }}>FAQ</Text>
        </View>
        <View />
      </View>
      <View>
        <List.AccordionGroup>
          <FlatList
            data={faqData}
            ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    backgroundColor: "white",
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
                  <List.Accordion
                    style={{ backgroundColor: "white" }}
                    title={item.question}
                    titleStyle={{ fontFamily: "raleway-bold" }}
                    titleNumberOfLines={5}
                    id={item.id}
                  >
                    <Text
                      style={{
                        backgroundColor: "white",
                        paddingHorizontal: 15,
                        color: "#7d7d7d",
                        fontSize: hp(1.7),
                        fontFamily: "raleway-semibold",
                        paddingVertical: 10,
                        lineHeight: 22,
                      }}
                    >
                      {item.answer}
                    </Text>
                  </List.Accordion>
                </View>
              );
            }}
          />
        </List.AccordionGroup>
      </View>
      <StatusBar style="dark" />
    </View>
  );
};

export default FaqScreen;

const styles = StyleSheet.create({});
