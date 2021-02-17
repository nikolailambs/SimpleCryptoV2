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
import { Text, GreyView, WhiteView, GreyScrollView } from '../components/Themed';

import { Overlay, SearchBar, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import SearchCoinCard from '../components/SearchCoinCard';
import CoinCard from '../components/CoinCard';

import { normalize } from '../Utils/Functions';




export default class SearchScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      isLoaded: false,
      search: '',
      refreshing: false,
      randCoinsLoaded: false,
    }
  };



  _onRefresh = () => {
    this.setState({refreshing: true});
    let random = getRandom(this.state.allSupportetCoinsData, 10)
    this.getRandomCryptos(random);
  }



  componentDidMount(){
    this.getAllSupportetCrypto();
  }



  async getAllSupportetCrypto(){
   fetch('https://api.coingecko.com/api/v3/coins/list')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        allSupportetCoinsData: responseJson,
        refreshing: false,
        isLoaded: true,
      });
      // get random cryptos for discovery
      let random = getRandom(responseJson, 10)
      this.getRandomCryptos(random);
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  async getRandomCryptos(coinIds) {
    let idString = coinIds.join('%2C');
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idString}&order=market_cap_desc&per_page=100&page=1&sparkline=true`)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          randCoins: responseJson,
          refreshing: false,
          randCoinsLoaded: true,
        });
      })
      .catch((error) =>{
        console.error(error);
      });
  }



  setScroll(bool) {
   this.setState({allowScroll: bool})
  }

  updateSearch = search => {
    this.setState({ search, searchData: true });
  }



  renderCoinCards() {
    const crypto = this.state.allSupportetCoinsData.filter((item) => item.name.toLowerCase().includes(this.state.search.toLowerCase()));

    return crypto.map((coin) =>
      <SearchCoinCard
        id={coin.id}
        key={coin.id}
        coinName={coin.name}
        symbol={coin.symbol}
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, backNavigation: 'Search', coinDataLoaded: false} )}
      />
    )
  }



  renderRandomCoinCards() {
    const crypto = this.state.randCoins;

    return crypto.map((coin) =>
      <CoinCard
        id={coin.id}
        key={coin.id}
        // index={ crypto.map(function(coin) { return coin.name }).indexOf(coin.name) }
        rank={coin.market_cap_rank}
        coinName={coin.name}
        symbol={coin.symbol}
        price={coin.current_price ? coin.current_price : 0}
        percentChange={coin.price_change_percentage_24h}
        marketCap={coin.market_cap}
        availableSupply={coin.circulating_supply}
        totalSupply={coin.total_supply}
        image={coin.image}
        // sparklines
        sparkLines={ groupAverage(coin.sparkline_in_7d.price.slice(Math.max(coin.sparkline_in_7d.price.length - Math.round(coin.sparkline_in_7d.price.length/7), 0)), 2) }
        sparkLinesLoaded={ true }
        // coin history
        // historyData={this.state.historyData}
        // historyLoaded={this.state.historyLoaded}
        // historyFetch={()=>this.getCryptoHistory(coin)}
        // methods
        setScroll={(bool)=>this.setScroll(bool)}
        onPress={() => this.props.navigation.navigate( 'ProfileScreen', {coin: coin, backNavigation: 'Search', coinDataLoaded: true} )}
        // scrollDown={this.state.scrollDown}
        // onPress={() => this.setState({overlay: true})}
        // fetchIndex={this.state.fetchIndex}
        // chartColorOnChange={this.state.chartColorOnChange}
      />
    )
  }



  render(){

    const searchArray = this.state.allSupportetCoinsData


// kann evt entfernt werden ?! -> TODO Test
    if(this.state.isLoading){
      return(
        <GreyView style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </GreyView>
        )
    }


    return (
      <GreyScrollView style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
              // title={Moment(global.updated_at*1000).format('MMMM Do YYYY, h:mm:ss a')}
            />
        }>
        <Text style={styles.headerTitle}>🔍 Search for Coin</Text>
        <GreyView style={{flex: 1, flexDirection: 'row'}}>
          <SearchBar
              placeholder="Search coin..."
              onChangeText={this.updateSearch}
              value={this.state.search}
              containerStyle={{backgroundColor: 'transparent', borderWidth: 0, shadowColor: 'white', borderBottomColor: 'transparent', borderTopColor: 'transparent', marginBottom: 10, width: '100%'}}
              inputContainerStyle={{backgroundColor: '#ffffff', borderRadius: 20}}
              autoCorrect={false}
              clearButtonMode={"never"}
              returnKeyType={"search"}
            />
          {
          // <TouchableOpacity
          //   onPress={() => this.setState({search: '', searchData: null}) } 
          //   style={{ width: '15%', alignItems: 'center', justifyContent: 'center', margin: 0 }}
          // >
          //   <Ionicons name={'ios-close-circle'} size={30} color="#3a3a3a" style={{marginBottom: 10}} />
          // </TouchableOpacity>
          }
        </GreyView>
        <GreyView style={{paddingBottom: 150}}>
          {this.state.search.length > 2 ?
            this.renderCoinCards()
            :
            this.state.randCoinsLoaded ?
              <GreyView>
                <Text style={styles.headerTitle}>🕹 Random Coin</Text>
                {this.renderRandomCoinCards()}
              </GreyView>
              :
              null
          }
        </GreyView>
      </GreyScrollView>
    );
  }
}


function getRandom(arr, n) {
  let idsArray = [];
  arr.map((item) => {
    idsArray.push(item.id)
  })
  console.log(idsArray)
  var result = new Array(n),
      len = idsArray.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = idsArray[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
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
    // backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: normalize(27),
    marginBottom: 10,
    // color: '#232323',
    textAlign: 'center',
    fontFamily: 'nunito',
    marginTop: 80,
  },
});
