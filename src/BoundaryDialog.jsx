import React, { PureComponent } from 'react';
import { Dialog, TextInput, HelperText, Button } from 'react-native-paper';
import { View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


export default class BoundaryDialog extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            error: false
        }
    }

    render() {
        return (
            <Dialog 
                visible={this.props.visible} 
                style={{backgroundColor: '#48525C', marginBottom: '80%', width: '80%', alignSelf: 'center'}}
                dismissable
                onDismiss={this.props.onClose}
            >

                <View style={{alignItems: 'center', padding: 10, paddingTop: 50 }}>
                    <View style={{width: '80%', alignItems: 'center'}}>
                        <TextInput
                            label={'Name'}
                            value={this.state.name}
                            mode={'outlined'}
                            onChangeText={(name) => this.setState({ name })}
                            style={{width: '100%', backgroundColor: '#5e6c79'}}
                            error={this.state.error}
                        />

                        <HelperText type={'error'} visible={this.state.error}>
                            Error: Name Already Exists
                        </HelperText>
                    </View>

                    <View style={{flexDirection: 'row'}}>
                        <Button 
                            color={Colors.white}
                            onPress={this.props.onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            color={Colors.white}
                            onPress={async () => {
                                const canSave = await this.props.onPress(this.state.name);
                                if(canSave) {
                                    this.props.onClose();
                                    this.setState({ name: '', error: false });
                                } else {
                                    this.setState({ error: true });
                                }
                            }}
                        >
                            Save
                        </Button>
                    </View>
                </View>
            </Dialog>
        );
    }
}