import React, { PureComponent } from 'react';
import { View, AsyncStorage, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import { IconButton, Colors, Card, Button } from 'react-native-paper';
import { Draw, DRAW_TYPES } from './react-native-maps-draw/Draw';
import PolygonEditable from './react-native-maps-draw/PolygonEditable';
import BoundaryDialog from './BoundaryDialog';
import * as turf from '@turf/turf';



export default class MapViewer extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            activeDialog: null,
            showSave: false,
            newBoundaryCoords: [],
            boundaries: [],
            zoomLevel: 0,
            activeBoundary: null,
            boundingBox: null
        }

        this.selectPolyRecord = this.selectPolyRecord.bind(this);
        this.selectPolyEdit = this.selectPolyEdit.bind(this);
        this.saveBoundary = this.saveBoundary.bind(this);
        this.deleteBoundary = this.deleteBoundary.bind(this);
        this.onRegionChange = this.onRegionChange.bind(this);
        this.zoomToRobot = this.zoomToRobot.bind(this);
        this.zoomToCenter = this.zoomToCenter.bind(this);

        this.mapRef = React.createRef();
    }

    componentDidMount() {
        this.getBoundaries();
    }

    onRegionChange(region) {

        const getBoundingBox = (region) => ([
            region.longitude - region.longitudeDelta, // westLng - min lng
            region.latitude - region.latitudeDelta, // southLat - min lat
            region.longitude + region.longitudeDelta, // eastLng - max lng
            region.latitude + region.latitudeDelta // northLat - max lat
        ]);

        const boundingBox = getBoundingBox(region);
        const bboxPolygon = turf.bboxPolygon(boundingBox);

        // buffer polygon, check if buffered polygon contains the bounding box

        const screenWidth = Dimensions.get('screen').width;
        const zoomLevel = Math.log2(360 * (screenWidth / 256 / region.longitudeDelta)) + 1;
        this.setState({ zoomLevel, boundingBox: bboxPolygon });
    }

    selectPolyRecord() {
        if(this.state.activeDialog === 'poly') {
            this.setState({ activeDialog: null, newBoundaryCoords: [] });
        } else {
            this.setState({ activeDialog: 'poly' });
        }
    }

    selectPolyEdit() {
        if(this.state.activeDialog === 'edit') {
            this.setState({ activeDialog: null });
        } else {
            this.setState({ activeDialog: 'edit' });
        }
    }

    zoomToRobot() {
        if(this.map) {
            const region = {
                latitude: this.props.robotCoordinates[1],
                longitude: this.props.robotCoordinates[0],
                latitudeDelta: .005,
                longitudeDelta: .005
            };
            this.map.animateToRegion(region)
        }
    }

    zoomToCenter(center) {
        if(this.map) {
            const region = {
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: center.latitudeDelta,
                longitudeDelta: center.longitudeDelta
            };
            this.map.animateToRegion(region)
        }
    }
    

    async getBoundaries() {
        const boundariesString = await AsyncStorage.getItem('boundaries') || '[]';
        const boundaries = JSON.parse(boundariesString);
        if(boundaries.length) {
            this.setState({ boundaries });
        }
    }

    async saveBoundary(name) {
        const coordinates = this.state.newBoundaryCoords;
        const currentBoundaries = this.state.boundaries;
        const nameExists = currentBoundaries.find((bound) => bound.name === name);
        if(nameExists) {
            return false;
        } else {
            const newBoundary = {
                name,
                coordinates
            }
            const newBoundaries = [...this.state.boundaries, newBoundary];
            await AsyncStorage.setItem('boundaries', JSON.stringify(newBoundaries));
            this.setState({ boundaries: newBoundaries, newBoundaryCoords: [], showSave: false });
            return true;
        }
    }

    async deleteBoundary(name) {
        const currentBoundaries = this.state.boundaries.slice();
        const boundaryIndex = currentBoundaries.findIndex((bound) => bound.name === name);
        currentBoundaries.splice(boundaryIndex, 1);
        await AsyncStorage.setItem('boundaries', JSON.stringify(currentBoundaries));
        this.setState({ boundaries: currentBoundaries });
    }

    render() {
        return (
            <View style={{flex: 1}}>

                <IconButton 
                    style={{
                        position: 'absolute', 
                        marginTop: 80, 
                        right: 5, 
                        zIndex: 100, 
                        backgroundColor: '#48525C', 
                        minHeight: 48,
                        width: 48,
                        padding: 0, 
                        alignContent: 'center', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                        borderColor: '#FFFFFF80',
                        borderWidth: 1
                    }} 
                    icon={'pencil'}
                    labelStyle={{fontSize: 24}}
                    rippleColor={'#48525C'}
                    onPress={this.selectPolyEdit}
                    color={this.state.activeDialog === 'edit' ? Colors.orange500: Colors.white}
                />

                <IconButton 
                    style={{
                        position: 'absolute', 
                        marginTop: 140, 
                        right: 5, 
                        zIndex: 100, 
                        backgroundColor: '#48525C', 
                        minHeight: 48,
                        width: 48,
                        padding: 0, 
                        alignContent: 'center', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                        borderColor: '#FFFFFF80',
                        borderWidth: 1
                    }}
                    icon={'shape-polygon-plus'}
                    size={30}
                    rippleColor={'#48525C'}
                    onPress={this.selectPolyRecord}
                    color={this.state.activeDialog === 'poly' ? Colors.orange500: Colors.white}
                    animated={true}
                />

                <MapView
                    style={{flex: 1}}
                    initialRegion={{
                        latitude: this.props.robotCoordinates ? this.props.robotCoordinates[1]: 0,
                        longitude: this.props.robotCoordinates ? this.props.robotCoordinates[0]: 0,
                        latitudeDelta: 0,
                        longitudeDelta: 0
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    onPress={(e) => {
                        this.cb(e);
                        if(!this.feauturePressed) {
                            this.setState({ activeBoundary: null });
                        }

                        this.feauturePressed = false;

                    }}
                    ref={(ref) => this.map = ref}
                    onRegionChangeComplete={this.onRegionChange}
                    rotateEnabled={false}
                    mapType={'satellite'}
                >
                    {this.props.robotCoordinates && (
                        <MapView.Marker
                            coordinate={{latitude: this.props.robotCoordinates[1], longitude: this.props.robotCoordinates[0]}}
                            style={{transform: [{rotate: `${this.props.robotRotation}deg`}, {rotateX: this.props.robotRotation <= 270 && this.props.robotRotation >= 90 ? '180deg': '0deg'}]}}
                            image={require('../static/robot.png')}
                        />
                    )}

                    {this.state.newBoundaryCoords.length > 0 && (
                        <PolygonEditable
                            coordinates={this.state.newBoundaryCoords}
                        />
                    )}


                    {this.state.newBoundaryCoords.length > 0 && (
                            <MapView.Marker
                                coordinate={this.state.newBoundaryCoords[0]}
                                stopPropagation={true}
                                zIndex={400000}
                            >
                                    <View style={{width: 180, height: 50, backgroundColor: '#48525C', alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                        <Button 
                                            style={{width: 90, height: 30}}
                                            labelStyle={{fontSize: 12}}
                                            color={Colors.white}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                this.setState({ newBoundaryCoords: [] });
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            style={{width: 80, height: 30}}
                                            labelStyle={{fontSize: 12}}
                                            color={Colors.white}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                this.setState({ showSave: true })
                                            }}
                                        >
                                            Save
                                        </Button>

                                    </View>
                            </MapView.Marker>
                        )}

                    {this.state.boundaries.map((boundary) => {

                        const Feature = this.state.activeDialog === 'edit' ? PolygonEditable: MapView.Polygon;

                        const anchorPoint = boundary.coordinates.slice().sort((a, b) => {
                          return a.latitude - b.latitude
                        })[0];

                        const robotBoundary = this.props.robotBoundary === boundary.name;

                        let showMarker = false;
                        let centerPoint = null;

                        if(boundary.coordinates.length && this.state.boundingBox) {
                            const coordinates = boundary.coordinates.map((coord) => [coord.longitude, coord.latitude]);
                            coordinates.push(coordinates[0]);
                            if(coordinates) {
                                const turfPoly = turf.polygon([coordinates]);
                                const turfBbox = turf.bbox(turfPoly);

                                const getDelta = (bbox) => {

                                    const minX = bbox[0];
                                    const maxX = bbox[2];
                                    const minY = bbox[1];
                                    const maxY = bbox[3];
                                    
                                    const deltaX = (maxX - minX);
                                    const deltaY = (maxY - minY);

                                    return [deltaX, deltaY];
                                }

                                const [centerDeltaX, centerDeltaY] = getDelta(turfBbox);
                                const [currentDeltaX, currentDeltaY] = getDelta(turf.bbox(this.state.boundingBox));

                                if(currentDeltaX  > (centerDeltaX * 40) || currentDeltaY > (centerDeltaY * 40)) {
                                    showMarker = true;
                                    const turfCenter = turf.center(turfPoly);

                                    centerPoint = {longitude: turfCenter.geometry.coordinates[0], latitude: turfCenter.geometry.coordinates[1], latitudeDelta: centerDeltaX * 5, longitudeDelta: centerDeltaY * 5};
                                }
                            }
                        }

                        return (
                            <React.Fragment>

                                {!showMarker && (
                                    <Feature
                                        coordinates={boundary.coordinates}
                                        onCoordinateUpdate={(coordinates) => {
                                            boundary.coordinates = coordinates;
                                            this.setState({ boundaries: this.state.boundaries.slice() });
                                        }}
                                        tappable
                                        onPress={(e) => {
                                            this.feauturePressed = true;                                      
                                            e.stopPropagation();
                                            if(this.state.activeBoundary === boundary.name) {
                                                this.setState({ activeBoundary: null });
                                            } else {
                                                this.setState({ activeBoundary: boundary.name });
                                            }
                                        }}
                                        stopPropagation={true}
                                        key={`${boundary.name}-Boundary`}
                                        strokeWidth={robotBoundary ? 4: 2}
                                        strokeColor={'#654ba9'}
                                        fillColor={'rgba(101, 75, 169, 0.5)'}
                                        zIndex={100}
                                    />
                                )}


                                {showMarker && (
                                    <MapView.Marker
                                        coordinate={centerPoint}
                                        onPress={() => this.zoomToCenter(centerPoint)}
                                        image={require('../static/grass.png')}
                                        key={`${boundary.name}-Center`}
                                    />
                                )}

                                {this.state.activeBoundary === boundary.name && !showMarker && (
                                    <MapView.Marker
                                        key={`${boundary.name}-Marker`}
                                        coordinate={anchorPoint}
                                    >
                                        <View>
                                            <Card style={{width: 200, backgroundColor: '#48525C'}}>
                                                <Card.Title
                                                    title={boundary.name}
                                                    titleStyle={{color: 'white', fontSize: 15}}
                                                    right={() => 
                                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                            <IconButton
                                                                onPress={() => this.props.postBoundary(boundary)}
                                                                icon={'robot-mower-outline'}
                                                                size={20}
                                                                color={'white'}
                                                                disabled={!this.props.robotActive}
                                                            />
                                                            <IconButton
                                                                onPress={() => this.deleteBoundary(boundary.name)}
                                                                icon={'trash-can-outline'}
                                                                size={20}
                                                                color={'white'}
                                                            />
                                                        </View>
                                                    }
                                                />

                                            </Card>
                                        </View>
                                    </MapView.Marker>
                                )}

                                {this.props.generatedPath.length > 0 && (
                                    <MapView.Polyline
                                        coordinates={this.props.generatedPath.map((coord) => {
                                            return {latitude: coord[1], longitude: coord[0]}
                                        })}
                                    />
                                )}



                            </React.Fragment>
                        )
                    })}

                    <Draw
                        drawType={DRAW_TYPES.POLYGON}
                        active={this.state.activeDialog === 'poly'}
                        getOnPressCallback={(cb) => this.cb = cb}
                        onDrawStart={() => {
                            if(this.state.newBoundaryCoords.length > 0) {
                                this.setState({ newBoundaryCoords: [] });
                            }
                        }}
                        onDrawEnd={(coords) => {
                            this.setState({ newBoundaryCoords: coords });
                        }}
                        keepFeatures={false}
                    />

                </MapView>

                <BoundaryDialog 
                    visible={this.state.showSave}
                    onClose={() => this.setState({ showSave: false, activeDialog: null })}
                    onPress={this.saveBoundary}
                />
            </View>
        );
    }
}