import React, { useCallback, useEffect } from "react";
import { View, Image, StyleSheet, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";

import axios from "axios";
import { baseURL } from "../backend/baseData";
// import VersionCheck from 'react-native-version-check';
// import VersionCheck from "react-native-version-check-expo";
import * as Application from "expo-application";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndNavigate = async () => {
        try {
          const userString = await AsyncStorage.getItem("user");
          const user = JSON.parse(userString);
          let PassNav = "OtpVerification";

          if (user) {
            
              PassNav = "InnerPage";
              try {
                // Only fetch rewards if user data is available
                const response = await axios.get(
                  `${baseURL}/getUserDetails.php?id=${user.id}`
                );
                console.log(response.data)
                if (response.data.success) {
                  if (response.data.user.data.verified == "no") {
                   PassNav = "VerificationScreen"
                  }
                }
                // console.log(response.data)
              } catch (error) {
                console.error("Error while fetching user:", error.message);
              }
            
          }

          setTimeout(() => navigation.replace(PassNav), 2500);
        } catch (error) {
          console.error("Error fetching user:", error.message);
        }
      };
            fetchUserAndNavigate();

      // fetchUserAndNavigate();
      // const AppMaintenance = async () => {
      //   const currentVersion = VersionCheck.getCurrentVersion();
      //   // console.log(currentVersion)
      //   try {
      //     const response = await axios.get(
      //       `${baseURL}/checkAppUpdate.php?app_version=${currentVersion}`
      //     );

      //     // console.log(response.data);

      //     if (response.data.maintenance == "yes") {
      //       navigation.replace("Maintenance", {
      //         message: response.data.maintenance_message,
      //       });
      //     }
      //     if (response.data.force_update == "yes") {
      //       navigation.replace("ForceUpdate");
      //     }
      //     if (
      //       response.data.force_update == "no" &&
      //       response.data.maintenance == "no"
      //     ) {
      //       fetchUserAndNavigate();
      //     }
      //   } catch (error) {
      //     console.error("Error fetching user:", error.message);
      //   }
      // };
      // AppMaintenance();
    }, [isFocused])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/splash.png")}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  logo: {
    flex: 1,
    resizeMode: "cover",
  },
});

export default WelcomeScreen;
