import React, { Component } from 'react';
import { Image, StatusBar, TouchableOpacity, Text, SafeAreaView, BackHandler, Alert } from 'react-native';
import { Container, View, DeckSwiper, Card, CardItem} from 'native-base';  
import Icon from 'react-native-vector-icons/AntDesign'; 
import Geolocation from '@react-native-community/geolocation';
import axios from "axios";
import styles from '../styles/Main';

const cards = [ 
  { 
    id : 34,
    name: 'Monica Geller',
    sexo: 'feminino',
    idade: 20,
    image: require('../assets/monica.jpeg'),
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.orem Ipsum is simply dummy text of the printing and typesetting industry."
  },
 
  {
    id : 36,
    name: 'Rachel Green',
    sexo: 'feminino',
    idade: 20,
    image: require('../assets/rachel.jpeg'),
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
  },

  {
    id : 37,
    name: 'Phoebe Buffay',
    sexo: 'feminino',
    idade: 20,
    image: require('../assets/phoebe.jpeg'),
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
  },
];

var cardsAPI = [];
var isLike = true;

export default class Main extends Component {

  state = {
    latitude: '',
    longitude: '',
    id: this.props.navigation.state.params.id
  };

  watchID = null;

  like = (target_id) => {
    axios.post("http://192.168.100.10:1337/v1/like", { data : { user_id : this.state.id, target_id : target_id }})
    .then( resp => console.warn(resp) )//Retorna { match : true } caso tenha ocorrido um match.
    .catch( err => console.warn(err) )
  }

  deslike = (target_id) => {
    axios.post("http://192.168.100.10:1337/v1/deslike", { data : { user_id : this.state.id, target_id : target_id }})
    .then( resp => console.warn(resp) )
    .catch( err => console.warn(err) )
  }

  superLike = (target_id) => {
    axios.post("http://192.168.100.10:1337/v1/superLike", { data : { user_id : this.state.id, target_id : target_id }})
    .then( resp => console.warn(resp) )//Retorna { match : true } caso tenha ocorrido um match.
    .catch( err => console.warn(err) )
  }

  setCards = () => { //Inicializa a lista de resultados retornada pelo API.
    axios.get("http://192.168.100.10:1337/v1/pairing",{params : { id : this.state.id }})
    .then( resp => {
      for( let i = 0, rows = resp.data.rows; i< resp.data.rowCount; i++ ) {
        cardsAPI.push({ id : rows[i].id, name : rows[i].nome, idade : rows[i].idade, image : rows[i].picture })
      }
    })
    .catch( err => console.error(err) )
  }

  componentDidMount() {

    Geolocation.getCurrentPosition(
      position => {
        const latitude = JSON.stringify(position.coords.latitude);
        const longitude = JSON.stringify(position.coords.longitude);
        this.setState({latitude});
        this.setState({longitude});

        axios.put("http://192.168.100.10:1337/v1/callback",{ data : { lat : latitude, long : longitude, id : this.state.id }})//Grava as coordenadas do usuário no banco.
        .then( resp => { 
            this.setCards();
        })
        .catch( err => {
          console.warn(err);
          this.setCards();
        })
        
      },
      error => console.warn('Error', JSON.stringify(error.message)),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
    );
  }

  componentWillUnmount() {
    this.watchID != null && Geolocation.clearWatch(this.watchID);
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', () => { return true; });
  }

  render() {

    const { navigation } = this.props;
    return ( 
      <View style={styles.container}>   
        <StatusBar backgroundColor='#87d383'/>
        
        <View style={{flex: 1}}>
          <DeckSwiper
            looping={false}
            ref={(c) => this._deckSwiper = c}
            dataSource={cards}   
            onSwipeLeft={ (e) => this.deslike(e.id)  }
            onSwipeRight={ (e) => this.like(e.id)  }   
            renderEmpty={() => 
              <View style={{ alignSelf: "center", marginBottom: 8000}}>
                <Text style={styles.empty}>Acabou :( </Text>
              </View>
            } 
            renderItem={item => 
              <Card style={styles.cardsContainer}>   
                <CardItem cardBody style={styles.card}>
                  <TouchableOpacity onPress={() => navigation.navigate('Info')} activeOpacity={1} style={{flex: 1}}> 
                  <Image style={styles.imagem} source={item.image} />
                  </TouchableOpacity>
                    <CardItem style={styles.textos}> 
                      <Text style={styles.nome}>{item.name}</Text> 
                      </CardItem> 

                </CardItem>
              </Card>
            }
          />
        </View>

         
        <View style={styles.buttonView}>

          <TouchableOpacity style={styles.button} onPress={() => {
            this.deslike(this._deckSwiper._root.state.selectedItem.id);
            this._deckSwiper._root.swipeLeft()
          }}>
            <Icon name="dislike1" size={40} color="red"/>        
          </TouchableOpacity> 
  
          <TouchableOpacity style={styles.button} onPress={() => {
               this.superLike(this._deckSwiper._root.state.selectedItem.id);
               this._deckSwiper._root.swipeRight();
            }}>
            <Icon name="heart" size={40} color="pink"/> 
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.button} onPress={() => {
              this.like(this._deckSwiper._root.state.selectedItem.id);
              this._deckSwiper._root.swipeRight();
            }}>
            <Icon name="like1" size={40} color="green"/>
          </TouchableOpacity>

        </View>
      </View> 
    );
  }
}