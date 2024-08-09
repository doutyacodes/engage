import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import TopBar from "./AppComponents/TopBar";
import { Entypo } from "@expo/vector-icons";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";

// Helper function to get days in a month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the day of the week for the first day of the month
const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

// Updated applied leaves for June, July, and August

const LeaveScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [appliedLeaves, setAppliedLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useGlobalContext();
  const navigation = useNavigation();

  const getLeaves = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/get-applied.php?user_id=${user.id}`
        );
        // console.log(response.data)
        if (response.data.success && response.data.leaves) {
          setAppliedLeaves(response.data.leaves);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    getLeaves();
  }, [user]);
  const today = new Date();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const renderDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to compare dates without time component

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
        .toISOString()
        .split("T")[0];
      const isSelected = selectedDates.includes(date);
      const isApplied = appliedLeaves.includes(date);
      const isBeforeToday = new Date(currentYear, currentMonth, i) < today;

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.day,
            isSelected ? styles.selectedDay : null,
            isApplied ? styles.appliedDay : null,
            isBeforeToday ? styles.disabledDay : null,
          ]}
          onPress={() => !isApplied && !isBeforeToday && handleDateSelect(i)}
          disabled={isApplied || isBeforeToday}
        >
          <Text style={styles.dayText}>{i}</Text>
          {isApplied && <View style={styles.redDot} />}
        </TouchableOpacity>
      );
    }
    return days;
  };

  const renderEmptyDays = () => {
    const emptyDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      emptyDays.push(<View key={`empty-${i}`} style={styles.day} />);
    }
    return emptyDays;
  };

  const renderWeekDays = () => {
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekDays.map((day, index) => (
      <View key={index} style={styles.day}>
        <Text style={styles.weekDayText} className="text-sm">
          {day}
        </Text>
      </View>
    ));
  };

  const getMonthName = (month) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames[month];
  };

  const HandleSubmit = async () => {
    if (selectedDates.length > 0) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${baseURL}/request-leaves.php`,
          {
            user_id: user.id,
            selectedDates: selectedDates,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // console.log("user",user.id)
        // console.log("selectedDates",selectedDates)
        getLeaves();

        console.log(response.data);
        const successMessage = `Leave request submitted successfully`;
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
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setSelectedDates([]);
        setIsLoading(false);
      }
    } else {
      alert("Please select at least one date");
    }
  };

  return (
    <View style={styles.container}>
      <TopBar marginTop={40} />

      <View className="flex-1 p-3">
        <View className="items-end my-5">
          <TouchableOpacity
          onPress={() => navigation.navigate("AppliedLeaveScreen")}
            disabled={appliedLeaves.length <= 0 || isLoading }
            className="bg-[#542782] px-5 py-4 rounded-lg"
            style={{
              opacity: appliedLeaves.length > 0 ? 1 : 0.7,
            }}
          >
            <Text
              className="text-base text-white"
              style={{ fontFamily: "raleway-bold" }}
            >
              Applied Leaves
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <View
              style={styles.navText}
              className="p-3 bg-green-400 rounded-md"
            >
              <Entypo name="chevron-left" size={24} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerText}>{`${getMonthName(
            currentMonth
          )}-${currentYear}`}</Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <View
              style={styles.navText}
              className="p-3 bg-green-400 rounded-md"
            >
              <Entypo name="chevron-right" size={24} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysContainer}>{renderWeekDays()}</View>

        <ScrollView contentContainerStyle={styles.calendar}>
          {renderEmptyDays()}
          {renderDays()}
        </ScrollView>
        <View className="flex-1 justify-end items-center pb-3">
          <TouchableOpacity
            disabled={isLoading || selectedDates.length == 0}
            onPress={HandleSubmit}
            className="w-full rounded-md p-3 items-center"
            style={{
              backgroundColor: "#1E90FF",
              opacity: isLoading || selectedDates.length == 0 ? 0.6 : 1,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  navText: {
    padding: 10,
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekDayText: {
    fontWeight: "bold",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: "14.28%", // 100% / 7 days
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedDay: {
    backgroundColor: "#93c5fd", // Ensure this color is applied correctly
  },
  appliedDay: {
    position: "relative",
  },
  disabledDay: {
    backgroundColor: "#e0e3ea", // Gray color for disabled dates
  },
  dayText: {
    fontSize: 16,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    position: "absolute",
    top: 4,
    right: 4,
  },
});

export default LeaveScreen;
