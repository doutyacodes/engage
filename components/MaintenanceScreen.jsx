import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
  } from "react-native-responsive-screen";
const MaintenanceScreen = ({route}) => {
    const {message}  = route.params;
  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"white"}}>
     <View>
        <Image source={require("../assets/images/maintenance.png")} style={{width:wp(95),height:hp(60)}} />
        <View style={{padding:15}}>
            <Text style={{textAlign:"center",fontSize:hp(1.9),color:"#a8a8a8",fontFamily: "raleway-bold"}}>{message}</Text>
        </View>
     </View>
    
    </View>
  )
}

export default MaintenanceScreen

const styles = StyleSheet.create({})