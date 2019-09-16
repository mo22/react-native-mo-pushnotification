import * as React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { PushNotification, IosCategoryOptions, IosCategoryActionOptions } from 'react-native-mo-pushnotification';

PushNotification.iosSetupCategories([
  {
    identifier: 'type1',
    options: IosCategoryOptions.AllowInCarPlay + IosCategoryOptions.CustomDismissAction,
    intentIdentifiers: [],
    actions: [
      { identifier: 'action1', title: 'Action 1', options: IosCategoryActionOptions.Foreground },
      { identifier: 'action2', title: 'Action 2', options: IosCategoryActionOptions.Destructive },
      { identifier: 'action3', title: 'Action 3', options: 0 },
    ],
  },
]);

PushNotification.androidSetupChannels([
  { id: 'channel1', name: 'Channel 1' },
]);

const AppNavigator = createStackNavigator({
  Menu: {
    screen: require('./Menu').default,
    navigationOptions: {
      title: 'Menu',
    },
  },
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.PureComponent<{}> {
  public render() {
    return (
      <AppContainer />
    );
  }
}
