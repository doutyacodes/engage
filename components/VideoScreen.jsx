import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Video, ResizeMode } from "expo-av";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseURL } from "../backend/baseData";

const VideoScreen = ({ route }) => {
  const { tasks, pageId, challenge,userSId } = route.params;
  const [taskData, setTaskData] = useState({
    task_id: tasks.task_id,
    user_id: "", // Initialize with an empty string
    entry_points: tasks.entry_points,
  });
// console.log(tasks.duration)
  const videoRef = useRef(null);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const navigation = useNavigation();
  let navRoute;
  if (tasks.task_type === "map") {
    navRoute = "MapScreen";
  } else if (tasks.task_type === "stepCounter") {
    navRoute = "AcceleroMeterScreen";
  }else if (tasks.task_type === "mediaCapture") {
    navRoute = "SelfieScreen";
  } else if (tasks.task_type === "videoCapture") {
    navRoute = "VideoTesting";
  } else {
    navRoute = "";
  }
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const userObject = JSON.parse(user);
          const userId = userObject.id;
          setTaskData((prevData) => ({
            ...prevData,
            user_id: userId,
          }));
        }
      } catch (error) {
        console.error("Error fetching user ID from AsyncStorage:", error);
      }
    };

    fetchUserId();

    (async () => {
      await videoRef.current.loadAsync(
        {
          uri: "https://videos.pexels.com/video-files/26222953/11940395_1080_1920_30fps.mp4",
        },
        { shouldPlay: true }
      );
    })();
  }, []);


  // console.log(taskData)

  const continueToNextScreen = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/createUserTasks.php`,
        taskData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      // console.log(response)
      const userTaskId = response.data.task.userTaskId;
      navigation.replace(navRoute, {
        taskData: taskData,
        tasks: tasks,
        pageId: pageId,
        challenge: challenge,
        maxSteps: tasks.steps,
        userTaskId: userTaskId,
        userSId:userSId,
        direction:tasks.direction,
        Title:tasks.task_name,
        latitudes:tasks?.map_info?.latitude ? tasks?.map_info?.latitude : null,
        longitudes:tasks?.map_info?.longitude ? tasks?.map_info?.longitude : null,
        reach_distance:tasks?.map_info?.reach_distance ? tasks?.map_info?.reach_distance : null,
        duration:tasks?.duration ? tasks.duration : 0,

      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePlayPause = () => {
    if (playbackStatus.isPlaying) {
      videoRef.current.pauseAsync();
    } else {
      videoRef.current.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        onPlaybackStatusUpdate={(status) => setPlaybackStatus(status)}
        isLooping={true}
      />
      <View style={styles.overlay}>
        
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={continueToNextScreen}
        >
          <Text style={styles.acceptText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  video: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  acceptBtn: {
    backgroundColor: "#E32636",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  acceptText: {
    fontSize: hp(2),
    color: "white",
    fontFamily: "raleway-bold",
  },
});

export default VideoScreen;
