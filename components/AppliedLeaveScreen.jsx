import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "./AppComponents/TopBar";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import { AntDesign } from "@expo/vector-icons";
const AppliedLeaveScreen = () => {
  const [appliedLeaves, setAppliedLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useGlobalContext();

  const getLeaves = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${baseURL}/get-applied-leaves.php?user_id=${user.id}`
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
  // console.log(appliedLeaves)
  return (
    <View className="flex-1">
      <TopBar marginTop={40} />
      <FlatList
        data={appliedLeaves}
        keyExtractor={(item) => item.batch}
        contentContainerStyle={{ flex: 1, padding: 15 }}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 10 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View className="w-full shadow-md border border-black/5 shadow-slate-400 bg-white rounded-lg p-4">
            <View className="flex-row space-x-3 items-center">
              <Text className="text-blue-200">
                <AntDesign name="clockcircle" size={24} />
              </Text>
              <Text className="text-base">
                Applied Date : <Text>{item?.entries[0]?.created_at}</Text>
              </Text>
            </View>
            <View className="py-[0.3px] w-full bg-slate-300 my-2" />
            <View>
              {item?.entries?.length > 0 &&
                item.entries.map((item2) => (
                  <View
                    className="flex-row justify-between items-center"
                    key={item2.id}
                  >
                    <Text className="font-bold text-base">
                      {item2.leave_date}
                    </Text>
                    <Text
                      className="uppercase"
                      style={{
                        color:
                          item2.status == "pending"
                            ? "orange"
                            : item2.status == "approved"
                            ? "green"
                            : "red",
                      }}
                    >
                      {item2.status}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 min-h-[70vh] justify-center items-center">
            <Text
              style={{ fontFamily: "raleway-bold" }}
              className="text-xl text-center"
            >
              You don't applied for any leaves yet!
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AppliedLeaveScreen;
