import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';


// Notifications test start
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';


import { Dimensions } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
// Notifications test end


export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();


// Notifications test start
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
// Notifications test end


  if (!isLoadingComplete) {
    return null;
  } else {
console.log(Dimensions.get('window'))
    global.expoPushToken = expoPushToken;
    return (
      <SafeAreaProvider style={styles.container}>
        <Navigation
          colorScheme={colorScheme}
          // expoPushToken={expoPushToken}
        />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}


// Notifications test start
async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
// Notifications test end


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginBottom: 159.632, // for creating iphone 8 screenshots
    // backgroundColor: '#f8f8f8',
  },
});
