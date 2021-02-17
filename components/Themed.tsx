import * as React from 'react';
import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
  TouchableOpacity as DefaultTouchableOpacity } from 'react-native';

import { Path as DefaultPath } from 'react-native-svg';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}


// Views
export function GreyView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: '#f8f8f8', dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function WhiteView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#131313' }, 'background');
  const borderColor = useThemeColor({ light: '#ededed', dark: '#000000' }, 'borderColor');

  return <DefaultView style={[{ backgroundColor, borderColor }, style]} {...otherProps} />;
}


// Scroll Views
export function GreyScrollView(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: '#f8f8f8', dark: darkColor }, 'background');

  return <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}

// TouchableOpacity
export function WhiteTouchableOpacity(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#131313' }, 'background');

  return <DefaultTouchableOpacity style={[{ backgroundColor }, style]} {...otherProps} />;
}


// Path
// Funktioniert noch nicht
export function Path(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const stroke = useThemeColor({ light: null, dark: '#131313' }, 'stroke');

  return <DefaultPath stroke={ stroke } {...otherProps} />;
}
