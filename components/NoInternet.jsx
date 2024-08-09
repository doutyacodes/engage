// import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
// import React from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import {
//     heightPercentageToDP as hp,
//     widthPercentageToDP as wp,
//   } from "react-native-responsive-screen";
// import { useNavigation } from '@react-navigation/native';
// import NetInfo from '@react-native-community/netinfo';

// const NoInternet = () => {
//     const navigation = useNavigation();

//   const handleRetry = async () => {
//     const state = await NetInfo.fetch();
//     if (state.isConnected) {
//       navigation.goBack(); // Navigate back to the previous screen
//     } else {
//       Alert.alert('No Connection', 'Still no internet connection. Please try again.');
//     }
//   };
//   return (
//     <SafeAreaView className="justify-center items-center flex-1">
//       <View className="space-y-4 justify-center items-center flex-1 px-3">
//       <Image source={require("../assets/images/no-wifi.png")} style={{height:hp(20),width:hp(20)}} />
//       <Text className="text-center text-2xl font-[raleway-bold]">Whoops!</Text>
//       <Text className="text-center text-base font-[raleway]">No internet connection was found. Check your connection or try again.</Text>
//       <TouchableOpacity className="bg-[#ff6e90] px-12 py-4 rounded-full" onPress={handleRetry}>
//         <Text className="text-lg text-center text-white font-[raleway-bold]">Try Again</Text>
//       </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   )
// }

// export default NoInternet
import { View, Text } from 'react-native'
import React from 'react'

const NoInternet = () => {
  return (
    <View>
      <Text>NoInternet</Text>
    </View>
  )
}

export default NoInternet