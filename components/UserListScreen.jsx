import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import TopBar from "./AppComponents/TopBar";
import { useGlobalContext } from "../context/GlobalProvider";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const UserListScreen = ({ route }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { user } = useGlobalContext(); // Replace with actual user ID
  const typeRoute = route.params.type;

  const loadUsers = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/get-all-users.php?user_id=${user.id}`
      );
      // console.log(response.data)
      if (response.data.success) {
        setUsers(
          response.data.users.map((user_data) => ({
            ...user_data,
            stars: 0,
            description: "",
            image2: null, // Add image property to each user
            sender_id: user.id,
            type: typeRoute,
          }))
        );
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const getStarCount = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/get-stars-applause.php?user_id=${user.id}&type=${typeRoute}`
      );
      if (response.data.success && response.data.user) {
        if (typeRoute == "stars") {
          setTotalStars(response.data.user.total_count);
        } else {
          setTotalStars(3);
        }
      }
    } catch (err) {
      console.error("Error fetching count:", err);
      setError("Failed to fetch count");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadUsers();
      getStarCount();
    }
  }, [user]);

  const handleStarChange = (index, change) => {
    const newUsers = [...users];
    newUsers[index].stars += change;
    setUsers(newUsers);
    if (typeRoute == "stars") {
      const newTotalStars = totalStars - change;
      if (newTotalStars < 0) {
        return;
      }

      setTotalStars(newTotalStars);
    } else {
      setTotalStars(3);
    }
    const updatedAssignedUsers = newUsers.filter((user) => user.stars > 0);
    setAssignedUsers(updatedAssignedUsers);
  };

  const handleDescriptionChange = (index, description) => {
    const newUsers = [...users];
    newUsers[index].description = description;
    setUsers(newUsers);
    const updatedAssignedUsers = newUsers.filter((user) => user.stars > 0);
    setAssignedUsers(updatedAssignedUsers);
  };

  const pickImage = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newUsers = [...users];
      newUsers[index].image2 = result.assets[0].uri;
      setUsers(newUsers);
    }
  };

  const handleSubmit = async () => {
    if (assignedUsers.length === 0) {
      Alert.alert("Validation Error", "No stars have been assigned.");
      return;
    }

    if (
      typeRoute === "stars" &&
      assignedUsers.some((user) => !user.description)
    ) {
      Alert.alert(
        "Validation Error",
        "All assigned stars must have a description."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      assignedUsers.forEach((assignedUser, index) => {
        formData.append(`assigned_users[${index}][id]`, assignedUser.id);
        formData.append(`assigned_users[${index}][stars]`, assignedUser.stars);
        formData.append(`assigned_users[${index}][sender_id]`, user.id);
        formData.append(`assigned_users[${index}][type]`, typeRoute);
        formData.append(
          `assigned_users[${index}][description]`,
          assignedUser.description
        );
        if (assignedUser.image2) {
          const imageUri = assignedUser.image2;
          const imageName = imageUri.split("/").pop();
          const imageType = imageName.split(".").pop();
          formData.append(`photo_${index}`, {
            uri: imageUri,
            type: `image/${imageType}`,
            name: imageName,
          });
        }
      });

      const response = await axios.post(
        `${baseURL}/submit-stars.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        Alert.alert("Success", "Stars have been submitted successfully.");
        getStarCount();
        loadUsers();
      } else {
        Alert.alert("Error", response.data.error);
      }
    } catch (error) {
      console.error("Error submitting stars:", error);
      Alert.alert("Error", "Failed to submit stars.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-[#f5f5f5]">
          <TopBar marginTop={40} />
          {typeRoute == "stars" && (
            <View className="items-end p-4">
              <Text className="font-bold text-lg">
                Available{" "}
                <Text className=" text-green-400">
                  {typeRoute == "stars" ? (
                    <AntDesign name="star" size={24} />
                  ) : (
                    <MaterialCommunityIcons name="hand-clap" size={24} />
                  )}
                </Text>{" "}
                : <Text>{totalStars}</Text>
              </Text>
            </View>
          )}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, padding: 15 }}
            ItemSeparatorComponent={<View style={{ height: 10 }} />}
            renderItem={({ item, index }) => (
              <View className="w-full shadow-md border border-black/5 shadow-slate-400 bg-white rounded-lg p-4">
                <View className="flex-row space-x-2 items-center">
                  <View style={styles.avatarContainer}>
                    {item.image?.length > 0 ? (
                      <Image
                        style={{
                          width: wp(15),
                          height: wp(15),
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                        source={{ uri: `${baseImgURL + item.image}` }}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {item.first_character}
                      </Text>
                    )}
                  </View>
                  <Text className="text-lg font-bold">{item.name}</Text>
                  <View className="flex-row items-center justify-end flex-1">
                    <TouchableOpacity
                      onPress={() => handleStarChange(index, -1)}
                      disabled={item.stars <= 0}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={24}
                        color={item.stars <=  0 ? "gray" : "red"}
                      />
                    </TouchableOpacity>
                    <Text className="mx-2">{item.stars}</Text>
                    <TouchableOpacity
                      onPress={() => handleStarChange(index, 1)}
                      disabled={
                        totalStars <= 0||
                        (typeRoute == "applause" && item.already) ||
                        (typeRoute == "applause" && item.stars == 1)
                      }
                    >
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color={
                          totalStars <= 0||
                          (typeRoute == "applause" && item.already) ||
                          (typeRoute == "applause" && item.stars == 1)
                            ? "gray"
                            : "green"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {item?.stars > 0 && (
                  <>
                    {item.image2 && (
                      <Image
                        source={{ uri: item.image2 }}
                        style={{ width: 100, height: 100, marginTop: 10 }}
                        className="rounded-md"
                      />
                    )}
                    <TextInput
                      placeholder={"Description"}
                      multiline
                      className="py-2 flex-1"
                      value={item.description}
                      onChangeText={(text) =>
                        handleDescriptionChange(index, text)
                      }
                    />
                    <TouchableOpacity
                      disabled={item.stars <= 0}
                      onPress={() => pickImage(index)}
                      className="flex-row items-center space-x-3 p-2 rounded-full bg-purple-800 justify-center max-w-[38vw]"
                    >
                      <Text
                        style={{ fontFamily: "raleway-bold", color: "white" }}
                      >
                        Add Image
                      </Text>
                      <Text>
                        <Ionicons name="image" size={20} color="white" />
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 min-h-[70vh] justify-center items-center">
                <Text
                  style={{ fontFamily: "raleway-bold" }}
                  className="text-xl text-center"
                >
                  No users exist yet!
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
          {users && (
            <TouchableOpacity
              className="my-2 mx-4 rounded-md p-4 justify-center items-center bg-[#542782]"
              disabled={assignedUsers.length === 0}
              style={{
                opacity: assignedUsers.length === 0 ? 0.7 : 1,
              }}
              onPress={handleSubmit}
            >
              <Text className="font-bold text-white text-lg text-center">
                Submit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: wp(15),
    width: wp(15),
    backgroundColor: "#ff8f8e",
    borderRadius: 50,
  },
  avatarText: {
    fontFamily: "raleway-bold",
    color: "white",
    fontSize: wp(5),
  },
});
