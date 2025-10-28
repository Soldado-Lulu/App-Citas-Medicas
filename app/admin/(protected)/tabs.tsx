// app/admin/(protected)/tabs.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { BottomNavigation, Appbar } from 'react-native-paper';

const Home = () => <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text>Home</Text></View>;
const Settings = () => <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text>Settings</Text></View>;

export default function AdminTabs() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    settings: Settings,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
