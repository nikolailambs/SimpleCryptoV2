
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

import CryptoChart from './CryptoChart';

import { images } from '../Utils/CoinIcons';
import { colors } from '../Utils/CoinColors';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);




export default class SearchCoinCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      historyLoaded: false,
    }
  }



render(){
  var icon = images[this.props.symbol.toLowerCase().replace(/\W/, '')]
    ? images[this.props.symbol.toLowerCase().replace(/\W/, '')]
    : require("../node_modules/cryptocurrency-icons/128/white/generic.png");

  var color = colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
    ? colors[this.props.symbol.toLowerCase().replace(/\W/, '')]
    : '#d7d7d7';


  return (
    // const { rank, symbol, coinName, price, percent_change_1h, percentChange, percent_change_7d, onPress } = this.props
      <TouchableHighlight
        onPress={() => this.props.onPress()} 
        underlayColor='#f4f4f4'>
        <View style={cardContainer}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Image
              style={[styles.image, {backgroundColor: color}]}
              source={ icon }
            />
            <View>
              <Text style={coinSymbol}>{this.props.symbol.toUpperCase()}</Text>
              <Text style={coinName}>{this.props.coinName}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}






const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
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
  image: {
    marginTop: 5,
    marginBottom: 5,
    width: 45,
    height: 45,
    borderRadius: 150 / 2,
    borderWidth: 1,
    borderColor: '#ffffff',
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
})

const {
  cardContainer,
  coinSymbol,
  coinName,
  image,
} = styles;
