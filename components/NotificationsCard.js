
import React from 'react';
import {
  StyleSheet,
  Button
} from 'react-native';
import { Text, GreyView, WhiteView, GreyScrollView } from '../components/Themed';




export default class NotificationsCard extends React.Component {
  constructor(props){
    super(props)
    this.state = {

    }
  }



render(){
    if (this.props.active) {
      return (
          <WhiteView style={cardContainer}>
            <Text style={{}}>{this.props.coinSymbol}</Text>
            <Text style={{}}>{this.props.type}</Text>
            <Text style={{}}>{this.props.direction}</Text>
            <Text style={{}}>{this.props.value}</Text>
            <Text style={{}}>{this.props.active}</Text>
            <Button
              title="X"
              onPress={() => this.props.removeNotification()}
            />
          </WhiteView>
      );
    }else{
      return (
          <GreyView style={cardContainer}>
            <Text style={{}}>{this.props.coinSymbol}</Text>
            <Text style={{}}>{this.props.type}</Text>
            <Text style={{}}>{this.props.direction}</Text>
            <Text style={{}}>{this.props.value}</Text>
            <Text style={{}}>{this.props.active}</Text>
            <Button
              title="X"
              onPress={() => this.props.removeNotification()}
            />
          </GreyView>
        );
    } // end of if

  }
}






const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    display: "flex",
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 2,
  },
})

const {
  cardContainer,
} = styles;
