import { Dimensions, Platform, PixelRatio } from 'react-native';


// Responsive font size
const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

// normalize method to export
export function normalize(size) {
  const newSize = size * scale
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
  }
}


// Notifications
// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/notifications
export async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: { data: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}


// Other
export const renderPriceNumber = (x) => {
  if(x >= 1000){
    return(numberWithCommas(parseFloat(x).toFixed(1)))
  }else if(x >= 100){
    return(numberWithCommas(parseFloat(x).toFixed(2)))
  }else if(x >= 10){
    return(numberWithCommas(parseFloat(x).toFixed(3)))
  }else if(x >= 1){
    return(numberWithCommas(parseFloat(x).toFixed(4)))
  }else if(x >= 0){
    return(numberWithCommas(parseFloat(x).toFixed(5)))
  }else{
    return(numberWithCommas(parseFloat(x).toFixed(6)))
  }
}


export const renderPricePrecentage = (x) => {
  if(x >= 1000){
    return(numberWithCommas(parseFloat(x).toFixed(0)))
  }else if(x >= 100){
    return(numberWithCommas(parseFloat(x).toFixed(1)))
  }else{
    return(numberWithCommas(parseFloat(x).toFixed(2)))
  }
}


function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}



export const nFormatter = (num, digits) => {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "B" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(num) >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
