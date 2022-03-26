import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const styles = StyleSheet.create({
    surface: {
      padding: 8,
      margin: 1,
      height: 80,
      width: '50%',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      backgroundColor: '#48525D'
    },
    nameStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    valueStyle: {
      fontSize: 14,
      color: 'white',
    },
});

export default class RobotInfoItem extends PureComponent {

  render() {
    return (
        <Surface style={styles.surface}>
            <Text style={styles.nameStyle}>{this.props.name}</Text>
            <Text style={styles.valueStyle}>{this.props.value}</Text>
        </Surface>
    );
  }
}