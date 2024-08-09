import {
  View,
  Text,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Fontisto, AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import { baseImgURL, baseURL } from "../backend/baseData";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
const EditProfile = ({ route }) => {
  const [image, setImage] = useState(null);
  const { user_id } = route.params;
  // console.log(user_id)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 13,
    today.getMonth(),
    today.getDate()
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  // const [countryList, setCountryList] = useState([]);
  // const [stateList, setStateList] = useState([]);
  const [dataForm, setDataForm] = useState({
    name: "",
    gender: "",
    birth_date: minDate,
    // country: 99,
    // state: "",
    id: user_id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const genderList = [
    { label: "Mr", value: "Mr" },
    { label: "Ms", value: "Ms" },
    { label: "Mrs", value: "Mrs" },
    { label: "Other", value: "Other" },
  ];
  

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/getUserEditDetails.php`,
          {
            id: user_id,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 200) {
          const userData = response.data.data;
          // const birthDateParts = userData.birth_date.split("/");
          // const birthDate = new Date(
          //   parseInt(birthDateParts[2]), // Year
          //   parseInt(birthDateParts[1]) - 1, // Month (zero-based index)
          //   parseInt(birthDateParts[0]) // Day
          // );
          // Update the dataForm state with fetched user data
          setDataForm({
            name: userData.name,
            gender: userData.gender,
            birth_date: minDate,
            // country: userData.country,
            // state: userData.state,
            id:user_id
          });
          if (userData?.image && userData?.image?.length > 0) {
            setImage(`${baseImgURL + userData.image}`);
          }
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    getUserDetails();
  }, []);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const imageUri = result.assets[0].uri;
      const imageName = imageUri.split("/").pop();
      const imageType = imageName.split(".").pop(); // Extract file extension
      const mimeType = `image/${imageType}`;
      // Create a FormData object
      const formData = new FormData();
      formData.append("id", user_id); // Assuming 'id' is a parameter needed by your backend
      formData.append("photo", {
        uri: imageUri,
        type: mimeType, // Adjust the type based on your requirements
        name: imageName, // Adjust the name based on your requirements
      });

      // Make a POST request to your backend API
      const apiUrl = `${baseURL}/editUploadImage.php`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          // Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.success) {
        const successMessage = "Profile Image successfully uploaded";
        Toast.show({
          type: "success",
          text1: "Congratulation",
          text2: successMessage,
        });
        // alert(successMessage);
      } else {
        alert(`Error: ${responseData.message}`);
      }
    }
  };
  // useEffect(() => {
  //   const fetchState = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${baseURL}/state.php?country_id=${dataForm.country}`
  //       );

  //       if (response.status === 200) {
  //         setStateList(response.data);
  //       } else {
  //         console.error("Failed to fetch states");
  //       }
  //     } catch (error) {
  //       console.error("Error while fetching states:", error.message);
  //     }
  //   };

  //   fetchState();
  // }, [dataForm.country]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}/country.php`);

  //       if (response.status === 200) {
  //         setCountryList(response.data);
  //       } else {
  //         console.error("Failed to fetch countries");
  //       }
  //     } catch (error) {
  //       console.error("Error while fetching countries:", error.message);
  //     }
  //   };

  //   fetchData();
  // }, []);
  // console.log(dataForm)
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axios.post(
          `${baseURL}/getUserEditDetails.php`,
          {
            id: user_id,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 200) {
          // console.log(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, []);

  const updateField = (fieldName, value) => {
    setDataForm({ ...dataForm, [fieldName]: value });
  };
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date) => {
    updateField("birth_date", date);
    hideDatePicker();
  };
  const addToDB = async () => {
    try {
      setIsLoading(true);
      for (const key in dataForm) {
        if (dataForm[key] === "" || dataForm[key] === null) {
          showToast(`${key} is required`);
          setIsLoading(false);
          return;
        }
      }
// console.log(dataForm)
      const response = await axios.post(`${baseURL}/updateUser.php`, dataForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const storedUser = await AsyncStorage.getItem("user");
        const currentUser = JSON.parse(storedUser);

        // Assuming 'response.data.user' contains the updated details
        const updatedUserDetails = response.data.user;

        // Update only the specific fields of the user object
        currentUser.birth_date = updatedUserDetails.birth_date; // Update field1
        // currentUser.country = updatedUserDetails.country; // Update field2
        currentUser.gender = updatedUserDetails.gender; // Update field2
        currentUser.id = updatedUserDetails.id; // Update field2
        currentUser.image = updatedUserDetails.image; // Update field2
        currentUser.name = updatedUserDetails.name; // Update field2
        // currentUser.state = updatedUserDetails.state; // Update field2
        // Add more fields as needed

        // Save the updated user object back to AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(currentUser));

        // Navigate to Settings screen
        navigation.navigate("OtherUserScreen",{
          user_id:user_id
        });

        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.error("Error:", response.data.error);
        // console.log(response.data);
        showToast(response.data.error);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error.message);
    }
    // } else {
    //   Alert.alert("Oops!", "You need to add a profile picture");
    // }
  };
  const showToast = (errorData) => {
    Toast.show({
      type: "error",
      text1: "Oops",
      text2: errorData,
    });
  };
  //   console.log(dataForm.birth_date)
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          flex: 1,
          width: wp(100),
          height: hp(100),
          backgroundColor: "white",
        }}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={{ marginTop: 30, flex: 1 }}>
            <Image
              source={require("../assets/logos/wowfy_black.png")}
              style={{ height: 50, width: 50, alignSelf: "center" }}
            />
            <View
              style={{
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={pickImage}
                style={{ alignItems: "center" }}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{ width: wp(30), height: wp(30), borderRadius: 100 }}
                  />
                ) : (
                  <Image
                    source={require("../assets/logos/person.png")}
                    style={{ width: wp(30), height: wp(30), borderRadius: 100 }}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                padding: 15,
                gap: 15,
                marginTop: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 10,
                  paddingVertical: 20,
                  flexDirection: "row",
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,

                  elevation: 2,
                }}
              >
                <TextInput
                  placeholder="Enter your name"
                  style={{ flex: 1, fontSize: hp(1.8) }}
                  value={dataForm.name}
                  onChangeText={(text) => updateField("name", text)}
                  placeholderTextColor="gray"
                />
                <Fontisto name="person" size={24} color="#c1c1c1" />
              </View>
              <View
                style={{
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 10,
                  paddingVertical: 16,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,

                  elevation: 2,
                }}
              >
                <Dropdown
                  labelField="label"
                  valueField="value"
                  placeholderStyle={{ color: "black" }}
                  placeholder="Select you gender"
                  data={genderList}
                  value={dataForm.gender}
                  onChange={(item) => {
                    updateField("gender", item.value);
                  }}
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 10,
                  paddingVertical: 20,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,

                  elevation: 2,
                }}
                onPress={showDatePicker}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: hp(1.8), flex: 1 }}>
                    {dataForm.birth_date.toLocaleDateString("en-GB")}
                  </Text>
                  <AntDesign name="calendar" size={24} color="#c1c1c1" />
                </View>

                <DateTimePickerModal
                  maximumDate={minDate}
                  isVisible={isDatePickerVisible}
                  mode="date"
                  themeVariant="dark"
                  display="inline"
                  onConfirm={handleConfirm}
                  onCancel={hideDatePicker}
                />
              </TouchableOpacity>
              {/* <View
                style={{
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 10,
                  paddingVertical: 16,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,

                  elevation: 2,
                }}
              >
                <Dropdown
                  labelField="label"
                  valueField="value"
                  placeholderStyle={{ color: "black" }}
                  placeholder="Select you country"
                  data={countryList}
                  value={dataForm.country}
                  onChange={(item) => {
                    updateField("country", item.value);
                  }}
                />
              </View>
              <View
                style={{
                  backgroundColor: "#f2f2f2",
                  paddingHorizontal: 10,
                  paddingVertical: 16,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.41,

                  elevation: 2,
                }}
              >
                <Dropdown
                  labelField="label"
                  valueField="value"
                  placeholderStyle={{ color: "black" }}
                  placeholder="Select you state"
                  data={stateList}
                  value={dataForm.state}
                  onChange={(item) => {
                    updateField("state", item.value);
                  }}
                />
              </View> */}
              <TouchableOpacity
                onPress={addToDB}
                style={{
                  backgroundColor: "#004182",
                  paddingHorizontal: 10,
                  paddingVertical: 18,
                  borderRadius: 12,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: hp(1.8),
                    }}
                  >
                    SUBMIT
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </View>
  );
};

export default EditProfile;
