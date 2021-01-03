import * as React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableHighlight,
  Animated,
  AsyncStorage,
} from 'react-native';
import { Text, GreyView, WhiteView } from '../components/Themed';

import { Overlay, SearchBar, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import DashboardCard from '../components/DashboardCard';





export default class DashboardScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      hotCoinsLoaded: false,
      sparklinesLoaded: false,
      refreshing: false,
      favCoinsHistoryLoaded: false,
      favoriteCoinsLoaded: false,
      favoriteCoins: [],
    }
  };



  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getCryptoHistory();
    this.getFavoriteCoins();
  }



  componentDidMount(){
    // this.firstTimeSetFavoriteCoins();
    this.getHotCoins();
    this.getFavoriteCoins();
    this.timer = setInterval(()=> {
      this.getFavoriteCoinsHistory();
      this.getCryptoHistory();
    }, 60000)
  }




// get the coin ids for the history later
  getFavoriteCoins = async () => {
    try {
      let favoriteCoins = await AsyncStorage.getItem('favoriteCoins');
      this.setState({
        favoriteCoins: favoriteCoins ? JSON.parse(favoriteCoins) : [],
        favoriteCoinsLoaded: true,
      });
      // if favorite coins is not empty, than fetch the history
      if (favoriteCoins) {
        this.getFavoriteCoinsHistory();
      };

    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  }


  async getHotCoins(){
   fetch('https://api.coingecko.com/api/v3/search/trending')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        hotCoins: responseJson.coins,
        hotCoinsLoaded: true,
      });
      this.getCryptoHistory();

    })
    .catch((error) =>{
      console.error(error);
    });

  }



// get all coins history
  getCryptoHistory = async () => {
    let idArray = [];
    this.state.hotCoins.map((coin) => {
      if (coin.item) {
        idArray.push(coin.item.id)
      }else{
        idArray.push(coin.id)
      }
    });
    let idString = idArray.join('%2C');

   fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idString}&order=market_cap_desc&per_page=100&page=1&sparkline=true`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        hotCoins: responseJson,
        refreshing: false,
        sparklinesLoaded: true,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  getFavoriteCoinsHistory = async () => {
    let idString = this.state.favoriteCoins.join('%2C');
   fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idString}&order=market_cap_desc&per_page=100&page=1&sparkline=true`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        favCoins: responseJson,
        refreshing: false,
        favCoinsHistoryLoaded: true,
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  setScroll(bool) {
   this.setState({allowScroll: bool})
  }





// Render the coin cards
  renderFavoriteCoinCards() {
    const favCoins = this.state.favCoins;

    return favCoins.map((coin) =>
      <DashboardCard
        // index={ favCoins.map(function(coin) { return coin.name }).indexOf(coin.name) }
        rank={ coin.market_cap_rank }
        coinName={ coin.name }
        symbol={ coin.symbol }
        price={ coin.current_price }
        percentChange={ coin.price_change_percentage_24h }
        marketCap={ coin.market_cap }
        availableSupply={ coin.circulating_supply }
        totalSupply={ coin.total_supply }
        image={coin.image}
        // sparklines
        sparkLines={ groupAverage(coin.sparkline_in_7d.price.slice(Math.max(coin.sparkline_in_7d.price.length - Math.round(coin.sparkline_in_7d.price.length/7), 0)), 2) }
        sparklinesLoaded={ true }
        // coin history
        // historyData={this.state.historyData}
        // historyLoaded={this.state.historyLoaded}
        // historyFetch={()=>this.getCryptoHistory(coin)}
        // methods
        setScroll={(bool)=>this.setScroll(bool)}
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, allCryptosData: this.state.favCoins, backNavigation: 'Dashboard', coinDataLoaded: true} )}
        // scrollDown={this.state.scrollDown}
        // onPress={() => this.setState({overlay: true})}
        // fetchIndex={this.state.fetchIndex}
        // chartColorOnChange={this.state.chartColorOnChange}
      />
    )
  }

uni = 4.8100

  renderHotCoinCards() {
    const hotCoins = this.state.hotCoins;

    return hotCoins.map((coin) =>
      <DashboardCard
        // index={ hotCoins.map(function(coin) { return coin.name }).indexOf(coin.name) }
        rank={ this.state.sparklinesLoaded ? coin.market_cap_rank : coin.item.market_cap_rank }
        coinName={ this.state.sparklinesLoaded ? coin.name : coin.item.name }
        symbol={ this.state.sparklinesLoaded ? coin.symbol : coin.item.symbol }
        price={ this.state.sparklinesLoaded ? coin.current_price : 0 }
        percentChange={ this.state.sparklinesLoaded ? coin.price_change_percentage_24h : 0 }
        marketCap={ this.state.sparklinesLoaded ? coin.market_cap : 0 }
        availableSupply={ this.state.sparklinesLoaded ? coin.circulating_supply : 0 }
        totalSupply={ this.state.sparklinesLoaded ? coin.total_supply : 0 }
        image={coin.image}
        // sparklines
        sparkLines={ this.state.sparklinesLoaded ? groupAverage(coin.sparkline_in_7d.price.slice(Math.max(coin.sparkline_in_7d.price.length - Math.round(coin.sparkline_in_7d.price.length/7), 0)), 2) : [1, 3, 2, 2, 3] }
        sparklinesLoaded={ this.state.sparklinesLoaded }
        // methods
        setScroll={(bool)=>this.setScroll(bool)}
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, allCryptosData: this.state.hotCoins, backNavigation: 'Dashboard'} )}
        // scrollDown={this.state.scrollDown}
        // onPress={() => this.setState({overlay: true})}
        // fetchIndex={this.state.fetchIndex}
        // chartColorOnChange={this.state.chartColorOnChange}
      />
    )
  }






  render(){


    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
            // title={Moment(global.updated_at*1000).format('MMMM Do YYYY, h:mm:ss a')}
          />
        }>
        <Text style={[styles.homeHeaderTitle, {marginTop: 50}]}>⭐️ Favorite Cryptos</Text>
        <GreyView style={styles.homeHeader}>
          {this.state.favoriteCoins.length > 0 ?
            this.state.favCoinsHistoryLoaded ?
              this.renderFavoriteCoinCards()
              :
              <GreyView style={{flex: 1, paddingTop: 100, paddingBottom: 100}}>
                <ActivityIndicator/>
              </GreyView>
            :
            <GreyView style={{flex: 1, alignItems: 'center'}}>
              <Text>No favorites</Text>
            </GreyView>

          }
        </GreyView>
        <Text style={[styles.homeHeaderTitle, {marginTop: 50}]}>🔥 Hottest Cryptos</Text>
        <GreyView style={[styles.homeHeader, {paddingBottom: 150}]}>
          { this.state.hotCoinsLoaded ?
            this.renderHotCoinCards()
            :
            <GreyView style={{flex: 1, paddingTop: 100, paddingBottom: 100}}>
              <ActivityIndicator/>
            </GreyView>
          }
        </GreyView>
      </ScrollView>
    );
  }
}





function groupAverage(arr, n) {
  var result = [];
  for (var i = 0; i < arr.length;) {
    var sum = 0;
    for(var j = 0; j< n; j++){
      // Check if value is numeric. If not use default value as 0
      sum += +arr[i++] || 0
    }
    result.push(sum/n);
  }
  return result
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#f8f8f8',
  },
  homeHeaderTitle: {
    fontSize: 35,
    // marginBottom: 10,
    color: '#232323',
    textAlign: 'center',
    fontFamily: 'nunito',
  },
  homeHeader: {
     justifyContent: "flex-start",
     flexDirection: "row",
     flexWrap: "wrap",
     marginTop: 30
  },
});
