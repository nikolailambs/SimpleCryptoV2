import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
// import animated third party tab bar
import { AnimatedTabBarNavigator } from "react-native-animated-nav-tab-bar";

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import DashboardScreen from '../screens/DashboardScreen';
import AllScreen from '../screens/AllScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { BottomTabParamList, DashboardParamList, AllParamList, SearchParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  let colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Dashboard"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => <TabBarIcon focused={focused} name={`ios-pie-chart${focused ? '' : '-outline'}`} color={color} size={"25px"} />,
        }}
      />
      <BottomTab.Screen
        name="All"
        component={AllNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => <TabBarIcon focused={focused} name={`ios-apps${focused ? '' : '-outline'}`} color={color} size={"25px"} />,
        }}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => <TabBarIcon focused={focused} name={`ios-search${focused ? '' : '-outline'}`} color={color} size={"25px"} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const DashboardStack = createStackNavigator<DashboardParamList>();

function DashboardNavigator() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </DashboardStack.Navigator>
  );
}

const AllStack = createStackNavigator<AllParamList>();

function AllNavigator() {
  return (
    <AllStack.Navigator>
      <AllStack.Screen
        name="AllScreen"
        component={AllScreen}
        options={{ headerShown: false }}
      />
      <AllStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </AllStack.Navigator>
  );
}

const SearchStack = createStackNavigator<SearchParamList>();

function SearchNavigator() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <SearchStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </SearchStack.Navigator>
  );
}
