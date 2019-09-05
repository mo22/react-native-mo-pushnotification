import * as React from 'react';
import { PermissionsAndroid, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { PushNotification } from 'react-native-mo-pushnotification';

function keysOf<T extends {}>(obj: T): (keyof T)[] {
  const objany = obj as any;
  return Object.keys(obj).filter((i) => typeof objany[objany[i]] !== 'number') as any;
}

interface State {
  permissions?: string;
  token?: string;
}

export default class Menu extends React.PureComponent<{}, State> {
  public state: State = {
  };

  public async componentDidMount() {
    this.setState({ permissions: await PushNotification.getPermissionStatus() });
  }

  public render() {
    return (
      <ScrollView>

        {/*
          - permission status + request (geolocation)
          - get current token and show token / copy token to clipboard?

          - show local notification -> extra page ... after delay?
        */}

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
            const res = await PushNotification.requestToken();
            this.setState({ token: JSON.stringify(res) });
          }}
        />


        <ListItem
          title="nothing"
          chevron={true}
          onPress={() => {
          }}
        />

      </ScrollView>
    );
  }
}
