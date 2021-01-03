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
  Button,
  Animated,
  Easing,
  AsyncStorage,
} from 'react-native';
import { Text, GreyView, WhiteView } from '../components/Themed';

import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { images } from '../Utils/CoinIcons';
import { colors } from '../Utils/CoinColors';
import { history } from '../Utils/HistoryHolder';
import { renderPriceNumber, nFormatter, renderPricePrecentage } from '../Utils/Functions';


import CoinCard from '../components/CoinCard';
import CryptoChart from '../components/CryptoChart';




export default class ProfileScreen extends React.Component {

static navigationOptions = ({navigation}) => {
      return {
        headerLeft: () => (
          <TouchableOpacity
            style={{alignItems:'center',justifyContent:'center', width: 50, marginLeft: 10}}
            onPress={() => navigation.navigate(navigation.route.params.backNavigation) }
          >
            <Ionicons name="ios-arrow-back" size={30} color="#a1a1a1" />
          </TouchableOpacity>
        ),
      };
  }


  constructor(props){
    super(props);
    this.state = {
      historyLoaded: false,
      allowScroll: true,
      chartRange: '1Y',
      historyData: [[1,1], [2,2], [3,3], [4,2], [5,1], [6,1], [7,2], [8,3]],
      scrollDown: 0,
      refreshing: false,
      favoriteCoinsLoaded: false,
      coinDataLoaded: this.props.route.params.coinDataLoaded,
    }
    this.animatedScrollValue = new Animated.Value(0);
    // console.log(this.props)
  };



  _onRefresh = () => {
    this.setState({refreshing: true, chartRange: '1Y'});
    // this.startAnimation();
    this.mainFetch();
    this.fetchAdditionalInfos();
  }



  componentDidMount(){
    this.mainFetch();
    this.fetchAdditionalInfos();
    this.getFavoriteCoins();
    if (!this.props.route.params.coinDataLoaded) {
      this.getCoinsIfNotExisting();
    };
  }


// Fetching Coin Data, if coming from the Search Screen
  getCoinsIfNotExisting = () => {
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${this.props.route.params.coin.id}&order=market_cap_desc&per_page=100&page=1&sparkline=true`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        coinData: responseJson[0],
        coinDataLoaded: true,
      });
    })
    .catch((error) =>{
        console.error(error);
    });
  }



  getFavoriteCoins = async () => {
    try {
      let favoriteCoins = await AsyncStorage.getItem('favoriteCoins');
      this.setState({
        favoriteCoins: favoriteCoins ? JSON.parse(favoriteCoins) : [],
        favoriteCoinsLoaded: true,
      });
    } catch (error) {
      // Error retrieving data
    }
  }


  toggleFavoriteCoins = async () => {
    let favCoinsArray = this.state.favoriteCoins;
    let thisCoin = this.props.route.params.coin.id;
    if ( favCoinsArray.includes(thisCoin) ) {
      favCoinsArray.splice(favCoinsArray.indexOf(thisCoin), 1);
    }else{
      favCoinsArray.push(thisCoin);
    }

    // habtic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let favoriteCoins = await AsyncStorage.setItem('favoriteCoins', JSON.stringify(favCoinsArray));
      this.setState({
        favoriteCoins: favCoinsArray
      });
    } catch (error) {
      // Error retrieving data
    }
  }



  mainFetch = () => {
    fetch(`https://api.coingecko.com/api/v3/coins/${this.props.route.params.coin.id}/market_chart?vs_currency=usd&days=max`)
    .then((response) => response.json())
    .then((responseJson) => {

      let results = responseJson.prices;
      var d = new Date();
      d.setMonth(d.getMonth() - 12);

        this.setState({
          historyData: returnHistoryRangeArray(results, d),
          originalHistoryData: results,
          historyLoaded: true,
          refreshing: false,
        });
    })
    .catch((error) =>{
        console.error(error);
    });
  }



  fetchWeek = () => {
    if (this.props.route.params.coin.sparkline_in_7d) { // if already loaded sparklines
      let week = this.props.route.params.coin.sparkline_in_7d.price;
      week = addTimeToWeekArray(week);
      this.setState({ historyData: week })
    }else{
      this.setState({fetchingAddData: true})
      fetch(`https://api.coingecko.com/api/v3/coins/${this.props.route.params.coin.id}/market_chart?vs_currency=usd&days=7`)
      .then((response) => response.json())
      .then((responseJson) => {

        let results = responseJson.prices;

        this.setState({
          historyData: results,
          fetchingAddData: false,
        })
      })
      .catch((error) =>{
        console.error(error);
      });
    } // end of if already loaded
  }



  fetchDay = () => {
    if (this.props.route.params.coin.sparkline_in_7d) { // if already loaded sparklines
      let week = this.props.route.params.coin.sparkline_in_7d.price;
      // var today = new Date();
      var yesterday = new Date(new Date().setDate(new Date().getDate()-1));

      day = returnHistoryRangeArray( addTimeToWeekArray(week), yesterday )
      this.setState({ historyData: day })

    }else{
      fetch(`https://api.coingecko.com/api/v3/coins/${this.props.route.params.coin.id}/market_chart?vs_currency=usd&days=1`)
      .then((response) => response.json())
      .then((responseJson) => {
        let results = responseJson.prices;
        this.setState({
          historyData: results,
        })
      })
      .catch((error) =>{
        console.error(error);
      });
    } // end of if already loaded
  }



  fetchAdditionalInfos = () => {
    fetch(`https://data.messari.io/api/v2/assets/${this.props.route.params.coin.symbol}/profile`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        messariData: responseJson,
      })
    })
    .catch((error) =>{
      console.error(error);
    });
  }



  setScroll(bool) {
   this.setState({allowScroll: bool})
  }



  updateRange = (range) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    this.parseDataRange(range)
    this.setState({chartRange: range})
  }


  startAnimation () {
    // this.state.rotateAnim.setValue(0)
    Animated.timing(
      this.state.scrollDown,
      {
        toValue: 0,
        duration: 800,
        easing: Easing.linear
      }
    ).start(() => {
      this.startAnimation()
    })
  }



  parseDataRange = (range) => {

      // if from coingecko API
      let objArr = this.state.originalHistoryData;
      var d = new Date();

        switch(range) {
        case "1Y":
          d.setMonth(d.getMonth() - 12);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "6M":
          // code block
          d.setMonth(d.getMonth() - 6);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "3M":
          // code block
          d.setMonth(d.getMonth() - 3);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "1M":
          // code block
          d.setMonth(d.getMonth() - 1);
          this.setState({historyData: returnHistoryRangeArray(objArr, d) })
          break;
        case "1W":
          // code block
          this.fetchWeek()
          break;
        case "1D":
          // code block
          this.fetchDay()
          break;
        default:
          this.setState({historyData: objArr })
        }

  }


    // handleScroll = (event: Object) => {
    //   if (event.nativeEvent.contentOffset.y < 0) {
    //     this.setState({scrollDown: event.nativeEvent.contentOffset.y});
    //   }
    // }




  render() {

    if (!this.state.coinDataLoaded) {
      return(
        <GreyView style={{flex: 1, paddingTop: 200}}>
          <ActivityIndicator/>
        </GreyView>
      )
    }




    let coin = this.props.route.params.coinDataLoaded ? this.props.route.params.coin : this.state.coinData;
    // let allCryptosData = this.props.route.params.allCryptosData;


    // select next and previous coin
    // let coinArrayIndex = allCryptosData.map(function(e) { return e.symbol; }).indexOf(coin.symbol)

    // let nextCoinIndex = coinArrayIndex == allCryptosData.length - 1 ? 0 : coinArrayIndex + 1;
    // let nextCoin = allCryptosData[nextCoinIndex];


    // let prevCoinIndex = coinArrayIndex == 0 ? allCryptosData.length - 1 : coinArrayIndex - 1;
    // let prevCoin = allCryptosData[prevCoinIndex];



    let coinChange = this.state.tooltipChange ? this.state.tooltipChange : Math.round(coin.price_change_percentage_24h*100)/100;
    if (this.state.tooltipChange === 0) {
      coinChange = 0
    }


    let logoExisting = images[coin.symbol.toLowerCase().replace(/\W/, '')] ? images[coin.symbol.toLowerCase().replace(/\W/, '')] : false;

    var color = colors[coin.symbol.toLowerCase().replace(/\W/, '')]
        ? colors[coin.symbol.toLowerCase().replace(/\W/, '')]
        : '#000000';

    var transparent = color + '33'

    var icon = logoExisting
      ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/e_colorize:10,co_rgb:${color.replace(/\#/, '')}/v1600413783/CryptoIcons/white/${coin.symbol.toLowerCase().replace(/\W/, '')}.png`}
      : {uri: coin.image};


    if (logoExisting == 'not transparent') {
      icon = logoExisting
      ? {uri: `https://res.cloudinary.com/dcmqib0ib/image/upload/v1600413783/CryptoIcons/color/${coin.symbol.toLowerCase().replace(/\W/, '')}.png`}
      : {uri: this.props.image};
    }




    // messari data
    let governance = '-';
    let consensus = '-';
    let description = '-';


    if (this.state.messariData) {
      if (!this.state.messariData.status.error_code) {
      // governance
        if ( this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type == null ) {
          governance = "Off-Chain";
        }else if( this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type.startsWith("No") ){
          governance = "Off-Chain";
        }else{
          governance = this.state.messariData.data.profile.governance.onchain_governance.onchain_governance_type;
        }
      // governance
        if ( this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism == null ) {
          consensus = "n/a";
        }else if( this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism == "" ){
          consensus = "n/a";
        }else{
          consensus = this.state.messariData.data.profile.economics.consensus_and_emission.consensus.general_consensus_mechanism;
        }

      // description
      if (this.state.messariData.data.profile.general.overview.project_details) {
        description = this.state.messariData.data.profile.general.overview.project_details.split(' ');


        for(var i=0; i < description.length; i++) {
          description[i] = description[i].replace(/<a/g, '');
          description[i] = description[i].replace(/href.*\">/g, '');
          description[i] = description[i].replace(/<\/a>/g, '');
        }
        description = description.join(' ').replace(/\s+/g, ' ');
      }
      // end of if description exists

      }
    }


    let coinExisting = false;
    if (this.state.favoriteCoinsLoaded) {
      if (this.state.favoriteCoins.includes(coin.id)) {
        coinExisting = true;
      }
    }


    return(
      <ScrollView
        scrollEnabled={this.state.allowScroll}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        // onScroll={this.handleScroll}
        // scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />}
      >
        <GreyView style={styles.headerWrapper}>
          <GreyView style={styles.headerContent}>

            <GreyView style={styles.imageContainer}>
              <Image
                style={[styles.image, {backgroundColor: logoExisting ? color : null}]}
                source={ icon }
              />
            </GreyView>

            <GreyView style={styles.headerTextWrapper}>
              <Text style={styles.nameText}>{coin.name}</Text>
              <Text style={styles.symbolText}>{coin.symbol.toUpperCase()}</Text>
            </GreyView>

            <GreyView style={styles.starWrapper}>
              <Ionicons
                name={`ios-star${coinExisting ? '' : '-outline'}`}
                size={35}
                color={coinExisting ? "#ffe400" : "#a1a1a1"}
                style={styles.starIcon}
                onPress={() => { this.toggleFavoriteCoins() }}
              />
            </GreyView>

          </GreyView>
        </GreyView>


        <GreyView style={styles.coinPriceWrapper}>

          <Text style={styles.coinPrice}><Text style={styles.dollar}>$</Text>{
            this.state.tooltipValue ?
            this.state.tooltipValue
            :
            renderPriceNumber(coin.current_price)
          }</Text>
            <Text style={this.state.tooltipValue && !this.state.tooltipChange || coinChange == 0 ? styles.coinPerceGray : coinChange < 0 ? styles.coinPerce24Minus : styles.coinPerce24Plus}>{renderPricePrecentage(coinChange)} %</Text>

        </GreyView>

            <GreyView>
              <CryptoChart
                historyData={ this.state.historyData }
                symbol={ coin.symbol }
                updateRange={(range) => this.updateRange(range) }
                chartRange={ this.state.chartRange }
                // interact with this screen
                setScroll={(bool)=>this.setScroll(bool)}
                setPriceValue={(val) => this.setState({tooltipValue: val})}
                setChangeValue={(val) => this.setState({tooltipChange: val})}
                // change chart color
                fetchingAddData={this.state.fetchingAddData || !this.state.historyLoaded}
              />

            </GreyView>




        <GreyView style={styles.infoCardsWrapper}>

          <WhiteView style={[styles.infoCards, styles.infoBorderBottom]}>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockFirst]}>
                <Text style={styles.infoTitle}>SYMBOL</Text>
                <Text style={styles.infoValue}>{coin.symbol.toUpperCase()}</Text>
            </WhiteView>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockSecond]}>
                <Text style={styles.infoTitle}>RANK</Text>
                <Text style={styles.infoValue}>{coin.market_cap_rank}</Text>
            </WhiteView>
          </WhiteView>

          <WhiteView style={[styles.infoCards, styles.infoBorderBottom]}>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockFirst]}>
                <Text style={styles.infoTitle}>MARKET CAP</Text>
                <Text style={styles.infoValue}>$ {nFormatter(coin.market_cap, 2)}</Text>
            </WhiteView>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockSecond]}>
                <Text style={styles.infoTitle}>AVAILABLE SUPPLY</Text>
                <Text style={styles.infoValue}>{nFormatter(coin.circulating_supply, 2)}</Text>
            </WhiteView>
          </WhiteView>



          <WhiteView style={[styles.infoCards, styles.infoBorderBottom]}>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockFirst]}>
                <Text style={styles.infoTitle}>TOTAL SUPPLY</Text>
                <Text style={styles.infoValue}>{nFormatter(coin.total_supply, 2)}</Text>
            </WhiteView>
            {
          // messari data
            }
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockSecond]}>
                <Text style={styles.infoTitle}>CONSENSUS</Text>
                <Text style={styles.infoValue}>{consensus}</Text>
            </WhiteView>
          </WhiteView>



          <WhiteView style={[styles.infoCards, styles.infoBorderBottom]}>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockFirst]}>
                <Text style={styles.infoTitle}>TOKEN TYPE</Text>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.economics.token.token_type : '-'}</Text>
            </WhiteView>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockSecond]}>
                <Text style={styles.infoTitle}>TOKEN USAGE</Text>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.economics.token.token_usage : '-'}</Text>
            </WhiteView>
          </WhiteView>



          <WhiteView style={styles.infoCards}>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockFirst]}>
                <Text style={styles.infoTitle}>GOVERNANCE</Text>
                <Text style={styles.infoValue}>{governance}</Text>
            </WhiteView>
            <WhiteView style={[styles.infoBlockWrapper, styles.infoBlockSecond]}>
                <Text style={styles.infoTitle}>CATEGORY</Text>
                <Text style={styles.infoValue}>{this.state.messariData && !this.state.messariData.status.error_code ? this.state.messariData.data.profile.general.overWhiteView.category : '-'}</Text>
            </WhiteView>
          </WhiteView>
        </GreyView>

          <WhiteView style={styles.coinDescription}>
            <Text style={{fontSize: 20, fontFamily: 'nunito'}}>{description}</Text>
          </WhiteView>

      </ScrollView>
    )

  }

}


function returnHistoryRangeArray(arrayOfArrays, date){

  let d = date
  d.setHours(0, 0, 0);
  d.setMilliseconds(0);
  let millis = d
  let newArrayOfArrays = []

  arrayOfArrays.forEach(function(array) {
    if (array[0] >= millis) {
      newArrayOfArrays.push(array)
    };
  });
  return newArrayOfArrays;
}



function addTimeToWeekArray(arrayPrices) {
  let result = []

  let oneWeek = 60 * 60 * 24 * 7 * 1000;
  let oneHour = 60 * 60 * 1000;

  let now = Date.now();
  let millisSum = 0;

  let timeArray = [];

  arrayPrices.forEach(function(price) {
    let time = now - millisSum;
    timeArray.push(time);
    millisSum += oneHour;
  });

  let reversedTime = timeArray.reverse();

  let i = 0;

  arrayPrices.forEach(function(price) {
    result.push( [reversedTime[i], price] );
    i += 1;
  });

  return result;
}



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
  },
  headerWrapper: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection:'row',
    height: 120,
    marginTop: 20,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '30%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextWrapper: {
    width: '50%',
  },
  starWrapper: {
    flex: 1,
    alignItems: 'center',
    width: '20%',
  },
  starIcon: {
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#f8f8f8',
  },
  nameText: {
    fontSize: 25,
    fontFamily: 'nunito',
  },
  symbolText: {
    fontSize: 25,
    fontFamily: 'nunito',
    color: '#626262',
  },
  coinPriceWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinPrice: {
    fontSize: 45,
    fontFamily: 'nunito',
  },
  dollar: {
    fontSize: 25,
    color: '#979797',
    fontFamily: 'nunito',
  },
  coinPerce24Plus: {
    fontSize: 35,
    marginTop: 10,
    color: "#00BFA5",
    fontFamily: 'nunito',
  },
  coinPerce24Minus: {
    fontSize: 35,
    marginTop: 10,
    color: "#DD2C00",
    fontFamily: 'nunito',
  },
  coinPerceGray: {
    fontSize: 35,
    marginTop: 10,
    color: "#c9c9c9",
    fontFamily: 'nunito',
  },
  selected: {
    color: '#fc0018',
  },
  infoCardsWrapper: {
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffff',
    marginTop: 0,
    margin: 10,
    borderRadius: 20,
    borderColor: '#ededed',
    borderWidth: 1,
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // shadowColor: '#d1d1d1',
    // shadowOffset: { height: 5, width: 3 },
  },
  infoCards: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 20,
    marginRight: 20,
  },
  infoBorderBottom: {
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 0.5,
  },
  infoBlockWrapper: {
    width: '50%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: -10,
    marginLeft: -10,
  },
  infoBlockFirst: {
    marginRight: 10,
  },
  infoBlockFirst: {
    marginRight: 10,
  },
  infoBlockSecond: {
    marginLeft: 10,
  },
  infoTitle: {
    textAlign: 'left',
    fontSize: 15,
    color: '#515151',
    fontFamily: 'nunito',
    width: '45%',
  },
  infoValue: {
    fontSize: 20,
    // width: '80%',
    color: '#000000',
    textAlignVertical: 'center',
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'nunito',
    width: '55%',
  },
  // infoIcon: {
  //   width: '20%',
  //   textAlign: 'center',
  //   textAlignVertical: 'center',
  // },
  coinDescription: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 20,
    borderColor: '#f0f0f0',
    borderWidth: 1,
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // shadowColor: '#d1d1d1',
    // shadowOffset: { height: 5, width: 3 },
    marginBottom: 150,
  },
})

