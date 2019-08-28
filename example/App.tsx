import * as React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';

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
