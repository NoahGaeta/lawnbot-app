import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { Polygon, Marker } from 'react-native-maps';

export default class PolygonEditable extends PureComponent {
    
    constructor(props) {
        super(props);

        this.state = {
            coordinates: this.props.coordinates
        }
    }


    componentDidUpdate(prevProps) {
        if(prevProps.coordinates !== this.props.coordinates) {
            this.setState({ coordinates: this.props.coordinates });
        }
    }

    render() {
        return (
            <React.Fragment>
                <Polygon
                    {...this.props}
                    coordinates={this.state.coordinates}
                    key={this.props.key}
                />
                {this.state.coordinates.map((coord, idx) => 
                    <Marker 
                        coordinate={coord}
                        key={idx}
                        draggable
                        fillColor={'rgba(101,75,169,0.5)'}
                        onDragEnd={(e) => {
                            const coordinates = this.state.coordinates.slice();
                            coordinates[idx] = e.nativeEvent.coordinate;
                            this.setState({ coordinates });
                            if(this.props.onCoordinateUpdate) {
                                this.props.onCoordinateUpdate(coordinates);
                            }
                        }}
                        onPress={(e) => {
                            if(this.props.markerPress) {
                                this.props.markerPress(e);
                            }
                        }}
                    >
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                backgroundColor: 'rgba(101,75,169,0.75)',
                                borderRadius: 10,
                                borderColor: 'black',
                                borderWidth: 1
                            }}
                        />
                    </Marker>
                )}
            </React.Fragment>
        )
    }
}