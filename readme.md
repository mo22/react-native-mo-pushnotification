# react-native-mo-pushnotification

## Usage

```ts
import { Vibrate } from 'react-native-mo-vibrate';

Vibrate.vibrate(Vibrate.Type.TAP);
```

## Advanced

```ts
import { Vibrate } from 'react-native-mo-vibrate';

if (Vibrate.android.Module) {
  Vibrate.android.Module.vibratePattern({
    pattern: [ 500, 100, 500 ],
    amplitude; [ 255, 127, 255 ],
    repeat: 3,
  });
}
```
