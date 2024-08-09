import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Pedometer } from "expo-sensors";

const PedometerScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);

  const calculateDistance = (steps) => {
    // Assuming 1 step = 1 meter
    return steps / 1.3;
  };

  const startTracking = async () => {
    try {
      const newSubscription = Pedometer.watchStepCount((result) => {
        setSteps(result.steps || 0);
        setDistance(calculateDistance(result.steps || 0));
      });
      setSubscription(newSubscription);
      setIsTracking(true);
    } catch (error) {
      console.error("Error starting pedometer:", error);
    }
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsTracking(false);
  };

  const resumeTracking = () => {
    startTracking();
  };

  const finishTracking = () => {
    stopTracking();
    Alert.alert(
      "Tracking Summary",
      `You traveled ${distance.toFixed(2)} meters.`
    );
  };

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Tracker</Text>
      <View style={styles.dataContainer}>
        <Text style={styles.label}>Steps:</Text>
        <Text style={styles.value}>{steps}</Text>
      </View>
      <View style={styles.dataContainer}>
        <Text style={styles.label}>Distance (m):</Text>
        <Text style={styles.value}>{distance.toFixed(2)}</Text>
      </View>
      {!isTracking ? (
        <TouchableOpacity style={styles.button} onPress={startTracking}>
          <Text style={styles.buttonText}>Start Tracking Steps</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={stopTracking}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={resumeTracking}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={finishTracking}>
            <Text style={styles.buttonText}>Finish Tracking</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Background color
  },
  title: {
    fontSize: 28,
    fontFamily: "raleway-bold",
    marginBottom: 20,
    color: "#333", // Text color
  },
  dataContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
    color: "#555", // Label color
  },
  value: {
    fontSize: 18,
    fontFamily: "raleway-bold",
    color: "#000", // Value color
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#3498db", // Button color
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff", // Text color
    fontSize: 18,
    fontFamily: "raleway-bold",
  },
});

export default PedometerScreen;
