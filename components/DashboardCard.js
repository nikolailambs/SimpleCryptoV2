import React from 'react';
import {
  StyleSheet,
  Image,
  TouchableHighlight,
  Animated,
  Easing,
  NativeModules,
  LayoutAnimation,
  Dimensions
} from 'react-native';
import { Text, GreyView, WhiteView } from '../components/Themed';

import { LineChart, YAxis, Grid, AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { images } from '../Utils/CoinIcons';
import { colors } from '../Utils/CoinColors';
import { renderPriceNumber, sendPushNotification, normalize } from '../Utils/Functions';

import CryptoChart from './CryptoChart';

const { UIManager } = NativeModules;

// UIManager.setLayoutAnimationEnabledExperimental &&
//   UIManager.setLayoutAnimationEnabledExperimental(true);

const { width } = Dimensions.get("window");



export default class DashboardCard extends React.Component {
  constructor(props){
    super(props)
  }




render(){


  // set the notification
  let notifications = [];
  if (this.props.symbol && this.props.notifications.length > 0) {
    this.props.notifications.map((obj) => {
      if (this.props.symbol.toLowerCase() == obj.coinSymbol.toLowerCase()) {
      notifications.push(obj)
      }
    });
  };


// send the notification
if (this.props.isFavorite && this.props.percentChange > 5) {
  // console.log(this.props.percentChange)
  // sendPushNotification(global.expoPushToken, `${this.props.coinName} is ${Math.round(this.props.percentChange*100)/100}% up to $${renderPriceNumber(getlength(this.props.price))} in the last 24h`);
  console.log(notifications)
}


// Visuals
  let logoExisting = images[this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')] ? images[this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')] : false;

  var color = colors[this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')]
    ? colors[this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')]
    : '#ffffff';

  var transparent = color + '33'

  var icon = logoExisting
    ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/e_colorize:10,co_rgb:${color.replace(/\#/, '')}/v1600413783/CryptoIcons/white/${this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')}.png`}
    : {uri: this.props.image};



  if (logoExisting == 'not transparent') {
    icon = logoExisting
      ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/v1600413783/CryptoIcons/color/${this.props.symbol.toLowerCase().replace(/(\W|^\d)/, '')}.png`}
      : {uri: this.props.image};
  }



    var areaFill = 'rgba(207, 207, 207, 0.2)';
    var sparkLine = 'rgba(207, 207, 207, 1)';
    if (this.props.sparklinesLoaded) {
      // if (this.props.chartColorOnChange) {
        areaFill = this.props.percentChange > 0 ? 'rgba(0, 191, 165, 0.1)' : 'rgba(221, 44, 0, 0.1)';
        sparkLine = this.props.percentChange > 0 ? 'rgba(0, 191, 165, 0.6)' : 'rgba(221, 44, 0, 0.6)';
      // }else{
        // areaFill = 'rgba(102, 122, 255, 0.2)';
        // sparkLine = 'rgba(102, 122, 255, 1)';
      // }
    }

    const Line = ({ line }) => (
      <Path
        key={'line'}
        d={line}
        stroke={ sparkLine }
        strokeWidth={2}
        fill={'none'}
      />
    )

    let linearGradientOffset = `${Math.abs(Math.round(this.props.percentChange)) > 100 ? 100 : Math.abs(Math.round(this.props.percentChange))}%`

    const Gradient = ({ index }) => (
      <Defs key={index}>
          <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'40%'}>
              <Stop offset={'0%'} stopColor={areaFill} stopOpacity={0.1}/>
              <Stop offset={ linearGradientOffset } stopColor={areaFill} stopOpacity={0}/>
          </LinearGradient>
      </Defs>
    )


    const tileDimensions = calcTileDimensions(width, 2)  // -> change this number and see!


    return (
      // const { rank, symbol, coinName, price, percent_change_1h, percentChange, percent_change_7d, onPress } = this.props
        <TouchableHighlight
          onPress={() => this.props.onPress()} 
          style={{borderRadius: 20}}
          underlayColor='#f4f4f4'
          >
          <WhiteView style={[styles.cardContainer, {width: tileDimensions.size, height: tileDimensions.size + 2, marginHorizontal: tileDimensions.margin}]}>

            <WhiteView style={styles.logoNameWrapper}>
              <Image
                style={[styles.image, {backgroundColor: logoExisting ? color : null}]}
                source={ icon }
              />
              <WhiteView style={{width: '60%'}}>
                <Text style={coinSymbol} numberOfLines={1}>{this.props.symbol.toUpperCase()}</Text>
                <Text style={coinName} numberOfLines={1}>{this.props.coinName}</Text>
              </WhiteView>
            </WhiteView>

            <WhiteView style={styles.pricePercWrapper}>
              <Text style={coinPrice}>{ renderPriceNumber(getlength(this.props.price)) }
                <Text style={moneySymbol}>$</Text>
              </Text>
              <Text style={this.props.percentChange < 0 ? coinPerce24Minus : coinPerce24Plus }> {Math.round(this.props.percentChange*100)/100}
                <Text style={[this.props.percentChange < 0 ? coinPerce24Minus : coinPerce24Plus, moneySymbol]}>%</Text>
              </Text>
            </WhiteView>



            <WhiteView style={styles.chartContainer}>
              <AreaChart
                  style={{ flex: 1 }}
                  data={ this.props.sparkLines }
                  curve={shape.curveNatural}
                  svg={{
                    fill: 'url(#gradient)',
                  }}
                  contentInset={ { top: 10, bottom: 10 } }
              >
                <Gradient/>
                <Line/>
              </AreaChart>
            </WhiteView>

          </WhiteView>
        </TouchableHighlight>
      );
    }

}



const calcTileDimensions = (deviceWidth, tpr) => {
  const margin = deviceWidth / (tpr * 10);
  const size = (deviceWidth - margin * (tpr * 2)) / tpr;
  return { size, margin };
};






function getlength(number) {
  let char = number.toString().length;
  if (char >= 7) {
    return Math.round(number*10000000)/10000000;
  }else{
    return number;
  }
}



const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    flex: 1,
    // backgroundColor: '#ffffff',
    // borderColor: '#ededed',
    borderWidth: 1,
    margin: 10,
    padding: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    zIndex: 2,
  },
  logoNameWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },
  coinSymbol: {
    fontSize: normalize(15),
    fontFamily: 'nunito',
    textAlign: 'right',
  },
  coinName: {
    color: '#919191',
    fontFamily: 'nunito',
    textAlign: 'right',
  },
  pricePercWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  coinPrice: {
    fontSize: normalize(15),
    marginRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Plus: {
    fontSize: normalize(15),
    color: "#00BFA5",
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Minus: {
    fontSize: normalize(15),
    color: "#DD2C00",
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 150 / 2,
    borderWidth: 1,
    borderColor: '#ffffff'
  },
  moneySymbol: {
    fontWeight: 'normal',
    fontFamily: 'nunito',
  },
  rankNumber: {
    fontSize: normalize(15),
    color: '#3a3a3a',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'nunito',
  },
  chartContainer: {
    height: '50%',
    flexDirection: 'row',
  }
})

const {
  cardContainer,
  image,
  moneySymbol,
  coinSymbol,
  coinName,
  coinPrice,
  seperator,
  percentChangePlus,
  percentChangeMinus,
  coinPerce24Minus,
  coinPerce24Plus,
  rankNumber,
  chartContainer
} = styles;
