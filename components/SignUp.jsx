import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { Feather, Entypo, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import { useDispatch } from "react-redux";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../context/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const SignUp = ({ navigation, route }) => {
  // console.log(route.params)
  const [image, setImage] = useState(null);

  const [formDataCheck, setFormDataCheck] = useState({
    name: "",
    // username: "",
    password: null,
    confirmPassword: null,
    uid: route.params?.uid || null,
    phone: route.params?.phone || null,
    user: route.params?.user || null,
  });
  const dispatch = useDispatch();

  const handleChange = (name, value) => {
    setFormDataCheck((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  console.log(formDataCheck);
  const showToast = (errorData) => {
    Toast.show({
      type: "error",
      text1: "Oops",
      text2: errorData,
    });
  };
  const isPasswordStrong = (password) => {
    // Password must be at least 8 characters long and contain letters, numbers, and special characters
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleLogin = async () => {
    for (const key in formDataCheck) {
      if (formDataCheck.name === "" || formDataCheck.name === null) {
        let key2 = "Name";
        showToast(`${key2} is required`);
        return;
      }
    }
  
    try {
      dispatch(loginStart());
  
      // Create a FormData object
      const formData = new FormData();
      formData.append("name", formDataCheck.name);
      formData.append("password", formDataCheck.password);
      formData.append("confirmPassword", formDataCheck.confirmPassword);
      formData.append("uid", formDataCheck.uid);
      formData.append("phone", formDataCheck.phone);
      formData.append("gender", formDataCheck.user.gender);
      if (image) {
        const imageUri = image;
        const imageName = imageUri.split("/").pop();
        const imageType = imageName.split(".").pop(); // Extract file extension
        const mimeType = `image/${imageType}`;
        formData.append("photo", {
          uri: imageUri,
          type: mimeType,
          name: imageName,
        });
      }
  
      // Make a POST request to your backend API
      const apiUrl = `${baseURL}/signup1.php`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data", // No need to set this header; FormData does it automatically
        },
        body: formData,
      });
        console.log(response);

      // Handle response
      const responseText = await response.text();
      const responseData = JSON.parse(responseText);
      // console.log(responseData);
  
      if (responseData.success) {
        const successMessage = "Profile created successfully";
        Toast.show({
          type: "success",
          text1: "Congratulations",
          text2: successMessage,
        });
        await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
        dispatch(loginSuccess(responseData.user));
        navigation.replace("InnerPage")
      } else {
        showToast(responseData.error || "Signup failed");
      }
    } catch (error) {
      console.error("Error:", error.message);
      showToast("Failed to connect to the server");
    }
  };
  
  
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
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginTop: 30 }}>
          <Image
            source={require("../assets/logos/wowfy_black.png")}
            style={{ height: 50, width: 50, alignSelf: "center" }}
          />
        </View>
        {formDataCheck.user.name && (
          <Text
            className="my-4 text-lg "
            style={{ fontFamily: "raleway-bold" }}
          >
            Welcome, {formDataCheck.user.name}
          </Text>
        )}
        <View
          style={{
            marginTop: 10,
          }}
        >
          <View className="justify-center items-center my-4">
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: wp(30), height: wp(30), borderRadius: 100 }}
                  className="border"
                />
              ) : (
                <Image
                  source={require("../assets/logos/person.png")}
                  style={{ width: wp(30), height: wp(30), borderRadius: 100 }}
                  className="border"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View className="p-3 border border-[#0291B3] rounded-lg mt-4 flex-row items-center">
          <Feather
            name="user"
            size={20}
            color="#0291B3"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Display name"
            onChangeText={(text) => handleChange("name", text)}
            value={formDataCheck.name}
            className="placeholder:text-gray-400 flex-1"
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace("OtpVerification")}>
          <Text style={styles.signUpText} className="text-center">
            Already have an account?{" "}
            <Text style={styles.signUpLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  curveTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "20%",
    zIndex: 1,
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    padding: 16,
    zIndex: 2,
    // marginTop: 80,
  },
  header: {
    fontSize: 32,
    fontFamily: "raleway-bold",
    color: "#0291B3",
    marginBottom: 10,
    fontFamily: "Arial",
    marginTop: -100,
  },
  subHeader: {
    fontSize: 16,
    color: "#999999",
    marginBottom: 20,
  },

  inputIcon: {
    marginRight: 10,
    marginLeft: 10,
  },

  rememberForgot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  rememberMeLabel: {
    marginLeft: 5,
    color: "#0291B3",
  },
  forgotPassword: {
    color: "#0291B3",
  },
  signUpText: {
    color: "grey",
    marginTop: 40,
  },
  signUpLink: {
    color: "#0291B3",
  },
  loginButton: {
    backgroundColor: "#0291B3",
    width: "100%",
    height: 50,
    borderRadius: 25,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontFamily: "raleway-bold",
    fontSize: 18,
    paddingVertical: 10,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 5,
  },
  optionButton: {
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  optionText: {
    color: "grey",
    marginBottom: 5,
    fontSize: 15,
  },
  line: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
    width: "60%",
    marginTop: 65,
  },
});

export default SignUp;
