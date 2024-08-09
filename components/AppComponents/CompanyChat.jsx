import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { baseImgURL, baseURL } from "../../backend/baseData";
import { useGlobalContext } from "../../context/GlobalProvider";

// Replace with the actual URL of your PHP API

const CompanyChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useGlobalContext(); // Replace with actual user ID

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-company-chat.php?user_id=${user.id}`);
        // console.log(response.data);
        if (response.data.success) {
          setMessages(response.data.messages);
        } else {
          setError(response.data.error);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to fetch messages");
      }
      setLoading(false);
    };

    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadOlderMessages = () => {
    // Implement loading older messages if needed
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = [];
    let lastDate = "";

    messages.forEach((message) => {
      const messageDate = moment(message.date).format("YYYY-MM-DD");
// console.log(message.date)
      if (messageDate !== lastDate) {
        groupedMessages.push({
          type: "date",
          date: messageDate,
        });
        lastDate = messageDate;
      }

      groupedMessages.push({
        type: "message",
        ...message,
      });
    });

    return groupedMessages;
  };

  const renderMessage = ({ item }) => {
    if (item.type === "date") {
      return (
        <View className="items-center my-2">
          <Text className="text-gray-600 text-center rounded-full shadow-lg border border-slate-200 bg-white px-3 py-1">
            {moment(item.date).calendar(null, {
              sameDay: "[Today]",
              lastDay: "[Yesterday]",
              lastWeek: "[Last] dddd",
              sameElse: "MMMM D, YYYY",
            })}
          </Text>
        </View>
      );
    }

    return (
      <View className="p-2 flex-row items-end space-x-2">
        <View className="bg-white rounded-full p-[2px]">
        <Image
          source={{ uri: `${baseImgURL+item.image_url}` }} // Ensure the field name matches API response
          style={{ width: 40, height: 40 }}
          className="rounded-full"
          resizeMode="contain"
        />
        </View>
        <View className="bg-white p-2 rounded-lg shadow-md mt-1 flex-1">
          <Text className="text-gray-800 leading-5">{item.message_text}</Text>
          <Text className="text-gray-400 text-xs">
            {moment(item.timestamp).format("h:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  const groupedMessages = groupMessagesByDate(messages).reverse();

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  //   if (error) return <Text className="text-red-500 text-center">{error}</Text>;

  return (
    <View className="flex-1 bg-blue-200 p-4">
      <FlatList
        data={groupedMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        onEndReached={loadOlderMessages}
        onEndReachedThreshold={0.1}
        inverted
      />
    </View>
  );
};

export default CompanyChat;
