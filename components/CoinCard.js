
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableHighlight,
  Animated,
  Easing,
  NativeModules,
  LayoutAnimation,
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

import { LineChart, YAxis, Grid, AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { images } from '../Utils/CoinIcons';
import { colors } from '../Utils/CoinColors';
import { renderPriceNumber } from '../Utils/Functions';

import CryptoChart from './CryptoChart';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);





export default class CoinCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      historyLoaded: false,
    }
  }


  async getCryptoHistory() {
    let oneday = 60 * 60 * 24 * 1000;
    let coinName = this.props.id;

   fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=h1&start=${Date.now() - oneday}&end=${Date.now()}`)
    .then((response) => response.json())
    .then((responseJson) => {

      if (responseJson.data) {
        if (responseJson.data.length != 0) {
          this.setState({
            historyData: responseJson,
            historyLoaded: true,
          })
        }
      }
    })
    .catch((error) =>{
      console.error(error);
    });

  }



render(){

  // if (!this.state.historyLoaded) {
  //   if (this.props.index < this.props.fetchIndex) {
  //     this.getCryptoHistory()
  //   }
  // }


  let logoExisting = images[this.props.symbol.toLowerCase().replace(/\W/, '')] ? true : false;

  var color = logoExisting
    ? colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
    : '#ffffff';

  var transparent = color + '33'

  var icon = logoExisting
    // ? images[this.props.symbol.toLowerCase().replace(/\W/, '')]
    ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/e_colorize:10,co_rgb:${color.replace(/\#/, '')}/v1600413783/CryptoIcons/white/${this.props.symbol.toLowerCase().replace(/\W/, '')}.png`}
    : {uri: this.props.image};


  if (logoExisting == 'not transparent') {
    icon = logoExisting
    ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/v1600413783/CryptoIcons/color/${this.props.symbol.toLowerCase().replace(/\W/, '')}.png`}
    : {uri: this.props.image};
  }



  var areaFill = 'rgba(207, 207, 207, 0.2)';
  var sparkLine = 'rgba(207, 207, 207, 1)';
  if (this.props.sparkLinesLoaded) {
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
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
            <Stop offset={'0%'} stopColor={areaFill} stopOpacity={0.1}/>
            <Stop offset={ '10%' } stopColor={areaFill} stopOpacity={0}/>
        </LinearGradient>
    </Defs>
  )



  return (
    // const { rank, symbol, coinName, price, percent_change_1h, percentChange, percent_change_7d, onPress } = this.props
      <TouchableHighlight
        onPress={() => this.props.onPress()} 
        style={{borderRadius: 20}}
        underlayColor='#f4f4f4'>
        <View style={cardContainer}>

          <View style={{flex: 1, flexDirection: 'row'}}>
            <Image
              style={[styles.image, {backgroundColor: logoExisting ? color : null}]}
              source={ icon }
            />
            <View style={{width: '75%'}}>
              <Text style={coinSymbol} numberOfLines={1}>{this.props.symbol.toUpperCase()}</Text>
              <Text style={coinName} numberOfLines={1}>{this.props.coinName}</Text>
            </View>
          </View>

              <View style={styles.chartContainer}>
                <AreaChart
                    style={{ flex: 1, marginLeft: 10, marginRight: 10 }}
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
              </View>

              <View style={{width: 100}}>
                <Text style={coinPrice}>{renderPriceNumber(getlength(this.props.price))}
                  <Text style={moneySymbol}>$</Text>
                </Text>
                <Text style={this.props.percentChange < 0 ? coinPerce24Minus : coinPerce24Plus }> {Math.round(this.props.percentChange*100)/100}
                  <Text style={moneySymbol}> %</Text>
                </Text>
              </View>


        </View>
      </TouchableHighlight>
    );
  }
}



// prices
function parseObjectToDataArray(crypto) {
  let data = crypto.data
  let dataArray = []
  data.forEach(function(obj) {
    dataArray.push( parseFloat(obj["priceUsd"]) )
  });
  return dataArray;
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
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    margin: 10,
    padding: 10,
    borderRadius: 20,
    borderColor: '#ededed',
    borderWidth: 1,
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // shadowColor: '#d1d1d1',
    // shadowOffset: { height: 5, width: 3 },
    zIndex: 2,
    // borderBottomWidth: 1,
    // borderColor: '#f4f4f4'
  },
  upperRow: {
    display: "flex",
    marginBottom: 10,
  },
  coinSymbol: {
    fontSize: 20,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 5,
    fontFamily: 'nunito',
  },
  coinName: {
    marginLeft: 20,
    color: '#919191',
    fontFamily: 'nunito',
  },
  coinPrice: {
    fontSize: 20,
    marginTop: 10,
    // marginBottom: 5,
    // marginLeft: "auto",
    marginRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Plus: {
    fontSize: 20,
    color: "#00BFA5",
    marginBottom: 5,
    marginRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  coinPerce24Minus: {
    fontSize: 20,
    color: "#DD2C00",
    marginBottom: 5,
    marginRight: 5,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunitoBold',
  },
  image: {
    marginTop: 5,
    marginBottom: 5,
    width: 45,
    height: 45,
    borderRadius: 150 / 2,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  moneySymbol: {
    fontWeight: 'normal',
    fontFamily: 'nunito',
  },
  rankNumber: {
    fontSize: 20,
    color: '#3a3a3a',
    textAlign: 'center',
    flex: 1,
    fontFamily: 'nunito',
  },
  chartContainer: {
    height: '100%',
    marginRight: 10,
    width: 100,
    flexDirection: 'row',
  }
})

const {
  cardContainer,
  image,
  moneySymbol,
  upperRow,
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
