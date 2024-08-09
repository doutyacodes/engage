import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";
import { Provider } from "react-redux";
import { store } from "./context/store";
import { MenuProvider } from "react-native-popup-menu";
import { registerForPushNotificationsAsync } from "./PushNotifications"; // Import your push notification setup function
import DrawerStack from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { useFonts } from 'expo-font';
import { RootSiblingParent } from 'react-native-root-siblings';
import GlobalProvider from "./context/GlobalProvider";

// Enable screen freezing
enableFreeze(true);

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  
  // useEffect(() => {
  //   // Register for push notifications when the component mounts
  //   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  // }, []);
  const [fontsLoaded, fontError] = useFonts({
    'raleway': require('./assets/fonts/Raleway-Regular.ttf'),
    'raleway-semibold': require('./assets/fonts/Raleway-SemiBold.ttf'),
    'raleway-bold': require('./assets/fonts/Raleway-Bold.ttf'),
    'raleway-extra': require('./assets/fonts/Raleway-ExtraBold.ttf'),
    'poppins-extra': require('./assets/fonts/PermanentMarker-Regular.ttf'),
  });
  if (!fontsLoaded && !fontError) {
    return null;  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
        <GlobalProvider>

          <MenuProvider>
          <RootSiblingParent>
            <DrawerStack />
            <Toast />
          </RootSiblingParent>
          </MenuProvider>
          </GlobalProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
