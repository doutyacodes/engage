import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
const SuggestedComponent = ({item}) => {
  return (
    <View style={{backgroundColor:"red"}}>
      <Text>SuggestedComponent</Text>
    </View>
  )
}

export default SuggestedComponent

const styles = StyleSheet.create({})