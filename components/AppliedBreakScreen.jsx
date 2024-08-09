import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "./AppComponents/TopBar";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import { DataTable } from "react-native-paper";

const AppliedBreakScreen = () => {
  const [appliedBreaks, setAppliedBreaks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useGlobalContext();

  const getBreaks = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/get-applied-breakes.php?user_id=${user.id}`
        );
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

  const convertTo12HourFormat = (dateTimeStr) => {
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('-');
    const [hours, minutes, seconds] = timePart.split(':');
  
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
  
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  };
  

  return (
    <View className="flex-1">
      <TopBar marginTop={40} />
      <View className=" p-3">
      <ScrollView horizontal className="border rounded-md border-gray-300 shadow bg-white">
        <DataTable style={{ backgroundColor: "transparent" }}>
          <DataTable.Header className="space-x-4">
            <DataTable.Title className="text-center min-w-[33vw]">
              <Text className="text-center font-outfit-bold text-base">Date</Text>
            </DataTable.Title>
            <DataTable.Title className="text-center min-w-[33vw]">
              <Text className="text-center font-outfit-bold text-base">Time From</Text>
            </DataTable.Title>
            <DataTable.Title className="text-center min-w-[33vw]">
              <Text className="text-center font-outfit-bold text-base">Time To</Text>
            </DataTable.Title>
            <DataTable.Title className="text-center min-w-[33vw]">
              <Text className="text-center font-outfit-bold text-base">Status</Text>
            </DataTable.Title>
          </DataTable.Header>
          {appliedBreaks.length > 0 &&
            appliedBreaks.map((item) => (
              <DataTable.Row key={item.id} className="mt-4 space-x-4">
                <DataTable.Cell className="text-center min-w-[33vw]">
                  <Text className="text-center font-outfit text-sm">{item?.break_date}</Text>
                </DataTable.Cell>
                <DataTable.Cell className="text-center min-w-[33vw]">
                  <Text className="text-center font-outfit text-sm">{convertTo12HourFormat(item?.from_time)}</Text>
                </DataTable.Cell>
                <DataTable.Cell className="text-center min-w-[33vw]">
                  <Text className="text-center font-outfit text-sm">{convertTo12HourFormat(item?.to_time)}</Text>
                </DataTable.Cell>
                <DataTable.Cell className="text-center min-w-[33vw]">
                  <Text className="text-center font-outfit text-sm uppercase" style={{
                        color:
                          item.status == "pending"
                            ? "orange"
                            : item2.status == "approved"
                            ? "green"
                            : "red",
                      }}>{item?.status}</Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
        </DataTable>
      </ScrollView>
      </View>
    </View>
  );
};

export default AppliedBreakScreen;
