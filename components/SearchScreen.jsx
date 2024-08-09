// import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
// import React, { useEffect, useState } from "react";
// import * as Contacts from "expo-contacts";
// import axios from "axios";
// import { baseURL } from "../backend/baseData";
// import SuggestedComponent from "./AppComponents/SuggestedComponent";
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP as wp,
// } from "react-native-responsive-screen";
// import InviteComponent from "./AppComponents/InviteComponent";
// import { Divider, Searchbar } from "react-native-paper";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import LeftSearchCompoent from "./AppComponents/LeftSearchCompoent";
// const SearchScreen = () => {
//   const [userContacts, setUsercontacts] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);
//   const [inviteData, setInviteData] = useState([]);
//   const [userData, setUserData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [user, setUser] = useState(null);
//   const [searchData, setSearchData] = useState([]);
//   useEffect(() => {
//     const fetchUserAndFollow = async () => {
//       try {
//         const userString = await AsyncStorage.getItem("user");
//         if (userString) {
//           const userObject = JSON.parse(userString);
//           setUser(userObject);
//         }
//       } catch (error) {
//         console.error("Error fetching user from AsyncStorage:", error.message);
//       }
//     };

//     fetchUserAndFollow();
//   }, []);
//   useEffect(()=>{
//     const fetchPeople = async () => {
//       if (user) {
//         try {
//           const response = await axios.get(
//             `${baseURL}/getOtherUser.php?user_id=${user.id}`
//           );
//           if (response.status === 200) {
//             setUserData(response.data);
//           } else {
//             console.error("Failed to fetch other");
//           }
//         } catch (error) {
//           console.error("Error while fetching other:", error.message);
//         }
//       }
//     };

//     fetchPeople();
//   },[user])
//   useEffect(() => {
//     (async () => {
//       const { status } = await Contacts.requestPermissionsAsync();
//       if (status === "granted") {
//         const fetchContacts = async () => {
//           const { data } = await Contacts.getContactsAsync({
//             fields: [Contacts.Fields.PhoneNumbers],
//             sort: Contacts.SortTypes.FirstName,
//           });
//           // console.log("contacts",data[120].phoneNumbers[0].number);
//           // console.log("contacts",data[188]);
//           // console.log("contacts",data);
//           setUsercontacts(data);
//         };
//         fetchContacts();
//       }
//     })();
//   }, []);
//   useEffect(() => {
//     const fetchUserContact = async () => {
//       if (userContacts.length > 0) {
//         try {
//           // Make an Axios request to your PHP backend API
//           const response = await axios.post(
//             `${baseURL}/userSuggestion.php`,
//             {
//               contacts: userContacts,
//               user_id: 24,
//             },
//             {
//               headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//               },
//             }
//           );
//           // console.log("contact", response.data[97]);
//           // console.log("contact", response.data);
//           setSuggestions(response.data);

//           // Navigate to the desired screen
//         } catch (error) {
//           console.error("Error submitting data:", error);
//         }
//       }
//     };
//     fetchUserContact();
//     const fetchInvite = async () => {
//       if (userContacts.length > 0) {
//         try {
//           // Make an Axios request to your PHP backend API
//           const response = await axios.post(
//             `${baseURL}/userInvite.php`,
//             {
//               contacts: userContacts,
//               user_id: 24,
//             },
//             {
//               headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//               },
//             }
//           );
//           // console.log("contact", response.data[97]);
//           console.log("contact", response.data.contacts);
//           const sortedInviteData = response.data.contacts.sort((a, b) => {
//             const nameA = a.name?.toLowerCase();
//             const nameB = b.name?.toLowerCase();
//             if (nameA < nameB) return -1;
//             if (nameA > nameB) return 1;
//             return 0;
//           });
//           setInviteData(sortedInviteData);

//           // Navigate to the desired screen
//         } catch (error) {
//           console.error("Error submitting data:", error);
//         }
//       }
//     };
//     fetchInvite();
//   }, [userContacts]);
//   useEffect(() => {
//     const fetchSearch = async () => {
//       if (user) {
//         try {
//           const response = await axios.get(
//             `${baseURL}/getSearchUserOnly.php?q=${searchQuery}&user_id=${user.id}`
//           );
//           if (response.status === 200) {
//             setSearchData(response.data);
//             // console.log(response.data);
//           } else {
//             console.error("Failed to fetch search");
//           }
//         } catch (error) {
//           console.error("Error while fetching friends:", error.message);
//         }
//       }
//     };

//     fetchSearch();
//   }, [user, searchQuery]);
//   return (
//     <View style={{ flex: 1, backgroundColor: "#e5e5e5" }}>
//       <View style={{ position: "relative", zIndex: 10 }}>
//           <Searchbar
//             placeholder="Search  for users..."
//             onChangeText={(text) => setSearchQuery(text)}
//             style={{ padding: 1 }}
//             value={searchQuery}
//           />
//           {searchQuery.length >= 1 && searchData.length > 0 && (
//             <ScrollView
//               style={{
//                 position: "absolute",
//                 zIndex: 100,
//                 borderRadius: 10,
//                 left: 5,
//                 top: 50,
//                 paddingTop: 15,
//                 backgroundColor: "white",
//                 width: wp(97),
//                 padding: 10,
//               }}
//             >
//               {searchData.map((item, index) => {
//                 let Navpass;
//                 let conditions;
//                 if (item.type == "user") {
//                   Navpass = "OtherUserScreen";
//                   conditions = {
//                     user_id: item.id,
//                   };
//                 } else {
//                   Navpass = "Moviehome";
//                   conditions = {
//                     movieId: item.id,
//                   };
//                 }
//                 return (
//                   <LeftSearchCompoent searchPage={true} item={item} Navpass={Navpass} conditions={conditions} key={index} user={user}/>
//                 );
//               })}
//             </ScrollView>
//           )}
//         </View>
//       {suggestions && (
//         <View style={{ padding: 15, marginTop: 30 }}>
//           <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
//             Suggested for you
//           </Text>
//           <FlatList
//             data={suggestions}
//             keyExtractor={(item, index) => index}
//             showsHorizontalScrollIndicator={false}
//             horizontal
//             ItemSeparatorComponent={
//               <View>
//                 <View style={{ width: 5 }} />
//               </View>
//             }
//             renderItem={({ item, index }) => {
//               // console.log(item)
//               return <SuggestedComponent item={item} key={index} />;
//             }}
//           />
//         </View>
//       )}
//       {inviteData.length > 0 && (
//         <View style={{ padding: 15, marginTop: 30 }}>
//           <Text
//             style={{
//               fontFamily: "raleway-bold",
//               fontSize: hp(2),
//               marginVertical: 19,
//             }}
//           >
//             Invite
//           </Text>
//           <FlatList
//             data={inviteData}
//             keyExtractor={(item, index) => index}
//             showsHorizontalScrollIndicator={false}
//             ItemSeparatorComponent={
//               <View>
//                 {/* <View style={{ height: 5 }} /> */}
//                 <Divider />
//               </View>
//             }
//             renderItem={({ item, index }) => {
//               // console.log(item)
//               return <InviteComponent userData={userData} item={item} key={index} />;
//             }}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// export default SearchScreen;

// const styles = StyleSheet.create({});

import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Entypo, Feather } from "@expo/vector-icons";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseImgURL, baseURL } from "../backend/baseData";
import axios from "axios";
import LeftSearchCompoent from "./AppComponents/LeftSearchCompoent";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    const fetchUserAndFollow = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userObject = JSON.parse(userString);
          setUser(userObject);
        } else {
          navigation.replace("OtpVerification");
        }
      } catch (error) {
        console.error("Error fetching user from AsyncStorage:", error.message);
      }
    };
    fetchUserAndFollow();
  }, []);
  useEffect(() => {
    const fetchSearch = async () => {
      if (user && searchQuery?.length > 0) {
        try {
          const response = await axios.get(
            `${baseURL}/getSearchUser.php?q=${searchQuery}&user_id=${user.id}`
          );
                      // console.log(response.data);

          if (response.status === 200) {
            setSearchData(response.data);
            // console.log(response.data);
          } else {
            console.error("Failed to fetch search");
          }
        } catch (error) {
          console.error("Error while fetching friends:", error.message);
        }
      }
      if (searchQuery?.length <= 0) {
        setSearchData([]);
      }
    };

    fetchSearch();
  }, [user, searchQuery]);
  return (
    <SafeAreaView style={{ flex: 1 ,marginTop:Platform.OS=="android" ? 30:0}}>
      <View style={{ paddingHorizontal: 15 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: hp(2.3), fontFamily: "raleway-bold" }}>
            Search
          </Text>
          <View />
        </View>
        <View className="mt-3 w-full p-2 border border-gray-300 rounded-md flex-row focus:border-gray-500 items-center mb-4">
          <TextInput
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
            placeholder="Search for users or pages"
            className=" flex-1 py-2 "
            placeholderTextColor={"gray"}
          />
          <Feather name="search" size={20} color="black" />
        </View>
      </View>
      <FlatList
        data={searchData}
        renderItem={({ item, index }) => {
          let Navpass;
          let conditions;
          if (item.type == "user") {
            Navpass = "OtherUserScreen";
            conditions = {
              user_id: item.id,
            };
          } else {
            Navpass = "Moviehome";
            conditions = {
              movieId: item.id,
            };
          }
          return (
            <LeftSearchCompoent
              item={item}
              Navpass={Navpass}
              conditions={conditions}
              key={index}
              user={user}
            />
          );
        }}
        keyExtractor={(item, index) => index}
        contentContainerStyle={{ flex: 1, paddingHorizontal: 15 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={
          <View>
            <View style={{ height: 10 }} />
          </View>
        }
        ListEmptyComponent={()=>(
          searchQuery ? (
            <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
              No data found.
            </Text>
          </View>
          ) : (
<View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <Text style={{ fontFamily: "raleway-bold", fontSize: hp(2) }}>
              Search for users and pages.
            </Text>
          </View>
          )
        )}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({});
