import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { CountryPicker } from "react-native-country-codes-picker";
import axios from "axios";
import { baseURL } from "../backend/baseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth"; // Import Firebase auth

const OtpVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState(null);
  const navigation = useNavigation();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  // useEffect(() => {
  //   // Disable app verification for testing
  //   if (Platform.OS === 'android') {
  //     auth().settings.appVerificationDisabledForTesting = true;
  //   }
  // }, []);

  const signInWithPhoneNumber = async () => {
    const phoneWithCode = countryCode + phoneNumber;
    try {
      setIsLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phoneWithCode,true);
      Promise.resolve();
      setConfirm(confirmation);
    } catch (error) {
      console.log("Error sending code: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCode = async () => {
    const phoneWithCode = countryCode + phoneNumber;
    try {
      setIsLoading(true);
      const userCredential = await confirm.confirm(code);
      const user = userCredential.user;
      if (user) {
        try {
          const response = await axios.get(
            `${baseURL}/checkAlreadyUser.php?phone=${phoneWithCode}`
          );
          // console.log(response.data.user);
          if (response.data.user && response.data.logged) {
            await AsyncStorage.setItem(
              "user",
              JSON.stringify(response.data.user)
            );
            setConfirm(null);
            setPhoneNumber("");

            navigation.replace("InnerPage");
          } else if (response.data.user) {
            setConfirm(null);

            navigation.navigate("Signup", {
              uid: user.uid,
              phone: phoneWithCode,
              user: response.data.user,
            });
          } else {
            Alert.alert(
              "Notice",
              "It appears that this number is not registered in our system. Please use a registered number."
            );
          }
          
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log("Invalid code.", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const signInWithPhoneNumber = async () => {
  //   const phoneWithCode = countryCode + phoneNumber;
  //   try {
  //     setIsLoading(true);
  //     // const userCredential = await confirm.confirm(code);
  //     // const user = userCredential.user;
  //     if (phoneWithCode) {
  //       try {
  //         const response = await axios.get(
  //           `${baseURL}/checkAlreadyUser.php?phone=${phoneWithCode}`
  //         );
  //         // console.log(response.data.user);
  //         if (response.data.user && response.data.logged) {
  //           await AsyncStorage.setItem(
  //             "user",
  //             JSON.stringify(response.data.user)
  //           );
  //           setConfirm(null);
  //           setPhoneNumber("");

  //           navigation.replace("InnerPage");
  //         } else if (response.data.user) {
  //           setConfirm(null);

  //           navigation.navigate("Signup", {
  //             uid: user.uid,
  //             phone: phoneWithCode,
  //             user: response.data.user,
  //           });
  //         } else {
  //           Alert.alert(
  //             "Sorry!",
  //             "Looks like you have not entered into the system yet!"
  //           );
  //         }
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Invalid code.", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndNavigate = async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          const user = JSON.parse(userString);
          let PassNav = "InnerPage";
          if (user) {
            PassNav = "InnerPage";
            navigation.replace(PassNav);
          }
        } catch (error) {
          console.error("Error fetching user:", error.message);
        }
      };
      fetchUserAndNavigate();
    }, [isFocused])
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: hp(35),
          padding: 15,
        }}
      >
        <Image
          source={require("../assets/images/message.png")}
          style={{ height: hp(20), width: hp(20), marginBottom: 10 }}
        />
        <Text
          style={{
            fontSize: hp(2.2),
            fontWeight: "bold",
            textAlign: "left",
            width: "100%",
          }}
        >
          OTP Verification
        </Text>
        {/* <Text
          style={{
            fontSize: hp(1.6),
            marginTop: 10,
            fontFamily: "raleway",
            fontStyle: "italic",
            textAlign: "left",
            width: "100%",
            color: "#B6B6B6",
          }}
        >
          We need to send OTP to authenticate your number.
        </Text> */}
      </View>
      <View style={{ flex: 1, padding: 15 }}>
        {confirm ? (
          <>
            <TextInput
              style={[styles.input]}
              placeholder="Enter Otp"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <TouchableOpacity
              disabled={isLoading}
              style={styles.loginButton}
              onPress={confirmCode}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Verify Otp</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={styles.input}
              >
                <Text>{countryCode}</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mobile number"
                placeholderTextColor="#fff"
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                value={phoneNumber}
              />
            </View>
            <TouchableOpacity
              disabled={isLoading}
              style={styles.loginButton}
              onPress={signInWithPhoneNumber}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      <CountryPicker
        show={show}
        searchMessage="Search country code..."
        pickerButtonOnPress={(item) => {
          setCountryCode(item.dial_code);
          setShow(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topLogo: {
    position: "absolute",
    top: 30,
    resizeMode: "contain",
    width: 150,
    height: 150,
    opacity: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 30,
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: "raleway-bold",
    marginTop: 30,
    marginBottom: 10,
  },
  mobileNumberText: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 50,
    marginBottom: 5,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#fff",
    height: 50,
  },
  loginButton: {
    backgroundColor: "orange",
    padding: 12,
    borderRadius: 17,
    marginTop: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "raleway-bold",
    fontSize: 18,
  },
  bottomLogo: {
    position: "absolute",
    bottom: 40,
    resizeMode: "contain",
    width: 80,
    height: 80,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    gap: 30,
    marginTop: 30,
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
});

export default OtpVerification;
