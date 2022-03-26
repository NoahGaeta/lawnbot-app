import React, { PureComponent } from 'react';
import { View, Image } from 'react-native';
import { Subheading, Surface, Text } from 'react-native-paper';
import RobotInfoItem from './RobotInfoItem';

export default class RobotManager extends PureComponent {

    render() {
        return (
            <View>
                {this.props.robotActive ? (
                    <React.Fragment>
                    <View style={{flexDirection: 'row'}}>
                            <RobotInfoItem 
                                name={'Robot Coordinates'}
                                value={this.props.robotCoordinates ? this.props.robotCoordinates.map((coord) => coord.toFixed(4)).join(','): 'Not Available'}
                            />
                            <RobotInfoItem
                                name={'Robot Heading'}
                                value={this.props.robotRotation.toFixed(4)}
                            />
                        </View>
                        <View>
                            <RobotInfoItem
                                name={'Robot Status'}
                                value={this.props.robotStatus}
                            />
                        </View>
                    </React.Fragment>
                ) : (
                    <View>
                        <Subheading style={{color: 'white', margin: 20, marginTop: 40}}>
                            Unable to connect to robot, please ensure that you are on the robot's network.
                        </Subheading>
                    </View>
                )}
            </View>
        );
    }
}