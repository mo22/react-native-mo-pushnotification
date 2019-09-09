import * as React from 'react';
import { ScrollView, Clipboard, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
import { PushNotification } from 'react-native-mo-pushnotification';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { releaseOnWillUnmount } from 'react-mo-core';

PushNotification.setVerbose(true);

interface State {
  permissions?: string;
  token?: string;
  allowShowNotification?: boolean;
}

export default class Menu extends React.PureComponent<NavigationInjectedProps, State> {
  public state: State = {
  };

  public async componentDidMount() {
    this.setState({ permissions: await PushNotification.getPermissionStatus() });

    PushNotification.onShowNotification = (_event) => {
      return this.state.allowShowNotification || false;
    };

    releaseOnWillUnmount(this, PushNotification.onInteraction.subscribe((event) => {
      Alert.alert('Interaction', event.title + ' ' + event.action);
    }));
  }

  public render() {
    return (
      <ScrollView>

        <ListItem
          title="request permissions"
          subtitle={this.state.permissions || ''}
          onPress={async () => {
            const res = await PushNotification.requestPermission();
            this.setState({ permissions: res });
          }}
        />

        <ListItem
          title="open settings"
          onPress={async () => {
            await PushNotification.openSettings();
          }}
        />

        <ListItem
          title="push token"
          subtitle={this.state.token || ''}
          onPress={async () => {
            if (this.state.token) {
              console.log(JSON.parse(this.state.token));
              Clipboard.setString(this.state.token);
            } else {
              const res = await PushNotification.requestToken();
              console.log(res);
              Clipboard.setString(JSON.stringify(res));
              this.setState({ token: JSON.stringify(res) });
            }
          }}
        />

        <ListItem
          title="allowShowNotification"
          chevron={true}
          switch={{
            value: this.state.allowShowNotification || false,
            onValueChange: (value) => {
              this.setState({ allowShowNotification: value });
            },
          }}
        />

        <ListItem
          title="show notification"
          chevron={true}
          onPress={() => {
            this.props.navigation.dispatch(NavigationActions.navigate({ routeName: 'Local' }));
          }}
        />

      </ScrollView>
    );
  }
}
