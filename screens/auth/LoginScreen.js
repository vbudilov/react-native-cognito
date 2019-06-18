import React, {Component} from 'react';
import {KeyboardAvoidingView, TextInput} from 'react-native';
import {Button, Container, Content, Header, Icon, Item, Left, Right, Text} from 'native-base';
import {Auth, Logger} from 'aws-amplify';
import {authStyle} from "./style";
import DropdownAlert from 'react-native-dropdownalert';
import validator from 'validator';


export default class LoginScreen extends Component {

    state = {
        username: "",
        password: ""
    };

    logger = new Logger('LoginScreen');

    componentWillMount() {
        this.logger.info("In componentWillMount. ");

        Auth.currentAuthenticatedUser()
            .then(user => {
                this.logger.info("Redirecting to activities");
                this.props.navigation.navigate('Secure');
            })
            .catch(err => {
                this.logger.info("Not logged in");
            });
    }

    login = async () => {

        if (validator.isEmpty(this.state.username) || !validator.isEmail(this.state.username)) {
            this.logger.info("Email validation error");
            this.dropdown.alertWithType('error', 'Error', "A valid email is required");
            return null;
        }
        if (validator.isEmpty(this.state.password) || this.state.password.length < 2) {
            this.logger.info("Password validation error");
            this.dropdown.alertWithType('error', 'Error', "A password is required");
            return null;
        }

        const {username, password} = this.state;

        Auth.signIn(username, password)
            .then(user => {
                this.setState({user});

                this.logger.info('successful sign in!');
                // this.logger.info('Auth: ', Auth);

                this.setState({
                    loggingIn: false
                });

                this.props.navigation.navigate('Secure')
            })
            .catch(err => {
                this.logger.info('error signing in!: ', err);
                this.setState({
                    loggingIn: false
                });
                if (err.code === "UserNotConfirmedException") {
                    this.logger.info("The activity hasn't been confirmed yet. Sending over to the confirmation page");

                    this.props.navigation.navigate('RegisterConfirm', {
                        username: this.state.username,
                        password: this.state.password,
                        sendConfirmationCode: true
                    });
                }

                this.dropdown.alertWithType('error', 'Error', err.message);

            })
    };

    render() {
        const {navigate} = this.props.navigation;


        return (
            <Container>
                <Header transparent>
                    <Left>
                        <Button transparent onPress={() => navigate('Main')}>
                            <Icon style={{color: "#0f0007"}} name="arrow-back"/>
                        </Button>
                    </Left>
                    <Right>
                        {/*<Button transparent>*/}
                        {/*    <Text  style={{color: "#0f0007"}}>Cancel</Text>*/}
                        {/*</Button>*/}
                    </Right>
                </Header>
                <Content padder>
                    <Text style={{fontSize: 25, marginTop: 20}}>
                        Please login
                    </Text>
                    <Item style={{marginTop: 20}}>
                        <TextInput style={authStyle.textInput}
                                   onChangeText={(text) => this.setState({username: text})}
                                   autoCapitalize="none"
                                   onSubmitEditing={() => this.passwordInput.focus()}
                                   autoCorrect={false}
                                   underlineColorAndroid='transparent'
                                   keyboardType='email-address'
                                   returnKeyType="next"
                                   placeholder='email'
                                   value={this.state.username}
                        />
                    </Item>
                    <Item style={{marginTop: 20}}>
                        <TextInput style={authStyle.textInput}
                                   placeholder="password"
                                   type={"password"}
                                   onChangeText={(text) => this.setState({password: text})}
                                   ref={(input) => this.passwordInput = input}
                                   secureTextEntry
                                   value={this.state.password}
                        />
                    </Item>
                    <Button transparent onPress={() => navigate('ForgotPassword')}>
                        <Text>Forgot Password</Text>
                    </Button>

                </Content>

                <Content style={{position: "absolute", width: "100%", bottom: 0, alignSelf: "center"}}>
                    <Button full light style={{height: 50}}
                            onPress={() => this.login()}>
                        <Text>LOGIN</Text>
                    </Button>
                </Content>
                <KeyboardAvoidingView behavior={'padding'}/>
                <DropdownAlert ref={ref => this.dropdown = ref}/>

            </Container>
        );
    }
}
