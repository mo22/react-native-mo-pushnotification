import * as React from 'react';
import { PermissionsAndroid, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { Vibrate } from 'react-native-mo-vibrate';

function keysOf<T extends {}>(obj: T): (keyof T)[] {
  const objany = obj as any;
  return Object.keys(obj).filter((i) => typeof objany[objany[i]] !== 'number') as any;
}

export default class Menu extends React.PureComponent<{}> {
  public render() {
    return (
      <ScrollView>

        <ListItem
          title="nothing"
          chevron={true}
          onPress={() => {
          }}
        />

        {keysOf(Vibrate.Type).map((type) => (
          <ListItem
            key={type}
            title={type}
            chevron={true}
            onPress={() => {
              Vibrate.vibrate(Vibrate.Type[type]);
            }}
          />
        ))}

        {Vibrate.android.Module && (
          <ListItem
            title="android custom"
            chevron={true}
            onPress={async () => {
              await PermissionsAndroid.request('android.permission.VIBRATE' as any);
              Vibrate.android.Module!.vibratePattern({
                pattern: [ 1000, 100 ],
                amplitude: [ 255, 255 ],
                repeat: -1,
              });
            }}
          />
        )}

        {Vibrate.android.Module && keysOf(Vibrate.android.VibrateType).map((type) => (
          <ListItem
            key={type}
            title={'android ' + type}
            chevron={true}
            onPress={() => {
              Vibrate.android.Module!.vibrate(Vibrate.android.VibrateType[type]);
            }}
          />
        ))}

        {Vibrate.ios.Module && keysOf(Vibrate.ios.VibrateType).map((type) => (
          <ListItem
            key={type}
            title={'ios ' + type}
            chevron={true}
            onPress={() => {
              Vibrate.ios.Module!.vibrate(Vibrate.ios.VibrateType[type]);
            }}
          />
        ))}

      </ScrollView>
    );
  }
}
