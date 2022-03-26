import React, { PureComponent } from 'react';
import { LineString, Marker } from 'react-native-maps';

export default class PointEditable extends PureComponent {
    
    constructor(props) {
        super(props);

        this.state = {
            coordinate: this.props.coordinate
        }
    }

    render() {
        return (
            <Marker 
                coordinate={this.state.coordinate}
                draggable
                onDragEnd={(e) => {
                    const coordinate = e.nativeEvent.coordinate;
                    this.setState({ coordinate });
                    if(this.props.onCoordinateUpdate) {
                        this.props.onCoordinateUpdate(coordinate);
                    }
                }}
                image={this.props.image ? this.props.image: require('../../static/circle.png')}
                onPress={(e) => {
                    if(this.props.markerPress) {
                        this.props.markerPress(e);
                    }
                }}
            />
        )
    }
}