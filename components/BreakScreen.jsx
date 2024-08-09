import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import TopBar from "./AppComponents/TopBar";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";

const BreakScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(
    new Date(new Date().setHours(new Date().getHours() + 1))
  ); // Default to 1 hour later
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedBreaks, setAppliedBreaks] = useState([]);
  const navigation = useNavigation();
  const { user } = useGlobalContext();
  const getBreaks = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/get-applied-breakes.php?user_id=${user.id}`
        );
        console.log(response.data)
        if (response.data.success && response.data.breaks) {
          setAppliedBreaks(response.data.breaks);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    getBreaks();
  }, [user]);
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
  };

  const handleFromTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || fromTime;
    setShowFromTimePicker(Platform.OS === "ios");
    setFromTime(currentTime);
  };

  const handleToTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || toTime;
    setShowToTimePicker(Platform.OS === "ios");
    setToTime(currentTime);
  };

  const showDateSelector = () => {
    setShowDatePicker(true);
  };

  const showFromPicker = () => {
    setShowFromTimePicker(true);
  };

  const showToPicker = () => {
    setShowToTimePicker(true);
  };

  const renderDateTimePicker = (mode, value, onChange) => {
    return (
      <DateTimePicker
        testID="dateTimePicker"
        value={value}
        mode={mode}
        is24Hour={true}
        display="default"
        onChange={onChange}
        minimumDate={new Date()}
        minuteInterval={30}
      />
    );
  };

  const HandleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${baseURL}/request-break.php`,
        {
          user_id: user.id,
          date: selectedDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
          from_time: fromTime.toTimeString().substring(0, 5),
          to_time: toTime.toTimeString().substring(0, 5),
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        getBreaks()
        const successMessage = `Break request submitted successfully`;
        let toast = Toast.show(successMessage, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
          backgroundColor: "white",
          textColor: "black",
          containerStyle: {
            backgroundColor: "white",
            borderRadius: 50,
            padding: 15,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar marginTop={40} />
      <View className="flex-1 p-3 bg-white">
        <View className="items-end my-5">
          <TouchableOpacity
            onPress={() => navigation.navigate("AppliedBreakScreen")}
            disabled={appliedBreaks.length <= 0 || isLoading}
            className="bg-[#542782] px-5 py-4 rounded-lg"
            style={{
              opacity: appliedBreaks.length > 0 ? 1 : 0.7,
            }}
          >
            <Text
              className="text-base text-white"
              style={{ fontFamily: "raleway-bold" }}
            >
              Applied Breaks
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold mb-5">Select Break Time</Text>
        <View className="flex-row items-center mb-5">
          <Text className="text-lg font-bold w-24">Date:</Text>
          <TouchableOpacity
            onPress={showDateSelector}
            className="border border-gray-300 p-3 rounded-md"
          >
            <Text className="text-lg">{selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mb-5">
          <Text className="text-lg font-bold w-24">From:</Text>
          <TouchableOpacity
            onPress={showFromPicker}
            className="border border-gray-300 p-3 rounded-md"
          >
            <Text className="text-lg">
              {fromTime.toTimeString().substring(0, 5)}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mb-5">
          <Text className="text-lg font-bold w-24">To:</Text>
          <TouchableOpacity
            onPress={showToPicker}
            className="border border-gray-300 p-3 rounded-md"
          >
            <Text className="text-lg">
              {toTime.toTimeString().substring(0, 5)}
            </Text>
          </TouchableOpacity>
        </View>
        {showDatePicker &&
          renderDateTimePicker("date", selectedDate, handleDateChange)}
        {showFromTimePicker &&
          renderDateTimePicker("time", fromTime, handleFromTimeChange)}
        {showToTimePicker &&
          renderDateTimePicker("time", toTime, handleToTimeChange)}
        <View className="flex-1 justify-end items-center pb-3">
          <TouchableOpacity
            disabled={isLoading}
            onPress={HandleSubmit}
            className="w-full rounded-md p-3 items-center"
            style={{
              backgroundColor: "#1E90FF",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Text
              className="text-center text-base text-white"
              style={{ fontFamily: "raleway-bold" }}
            >
              {isLoading ? (
                <ActivityIndicator color={"white"} size={"small"} />
              ) : (
                "Submit"
              )}
            </Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="dark" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BreakScreen;
