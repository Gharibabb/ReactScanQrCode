import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet,Button,FlatList , Image } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, {Marker} from 'react-native-maps'


const AccueilScreen = ({ navigation }) => {
 
  return (
    <View style={styles.container}>
      <Button style={styles.buttonStyle} title='Camera' onPress={() => navigation.navigate('CameraScreen')}>
        </Button>
        <Button style={styles.buttonStyle} title='users' onPress={() => navigation.navigate('UsersScreen')}>
        </Button>
    </View>
  );
};

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    alert(`Code QR scanné : ${data}`);
    console.log(data);

    try {
      const response = await axios.get(data);
      console.log(response.data);

      const serverURL = 'http://10.74.0.242:3000';
      const postDataURL = `${serverURL}/api/data`;

      await axios.post(postDataURL, { data: response.data });
      
      console.log('Data sent to the server');
    } catch (error) {
      console.log(error);
    }
  };

  if (hasPermission === null) {
    return <Text>Demande d'autorisation de la caméra...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Pas d'accès à la caméra</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <View style={styles.overlay}>
          <Text style={styles.scanText}>Scanné !</Text>
          <Button title="Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );

};

const UsersScreen = ({navigation}) => {

  const [userVal, setUserVal] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.74.0.242:3000/data/scan');
        setUserVal(response.data);
        
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users Liste </Text>
      <FlatList
        data={userVal}
        renderItem={(item) => {
          console.log(item.item.data.results[0].location.coordinates)
          return(
           <View style={styles.container}> 
            <Image source={{uri: item.item.data.results[0].picture.medium}} style={styles.ImageStyle}/>
            <Text style={styles.livreItem}>{item.item.data.results[0].name.first} </Text>
            <Button style={styles.buttonStyle} title='check location' onPress={() => navigation.navigate('locationScreen' ,{ locationData: item.item.data.results[0].location.coordinates })}>
        </Button>
           </View>
             )
        }
      }   
      />
    </View>
  );

};

const LocationScreen = ({route}) => {
  console.log(route.params);
  const {locationData} = route.params;
  

  return (
    <View style={styles.container}>
      {locationData && locationData.latitude && locationData.longitude ? (
        <MapView
          style={{ flex: 1, width: '100%', height: 100 }}
          initialRegion={{
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            }}
            title="Votre position"
          />
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );

};

// Étape 2: Créer un navigateur et configurer les écrans

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={AccueilScreen} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} />
        <Stack.Screen name="UsersScreen" component={UsersScreen} />
        <Stack.Screen name="locationScreen" component={LocationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


////////////////////////////
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanText: {
    fontSize: 24,
    color: '#fff',
  },
  buttonStyle: {
    fontSize: 30,
    marginBottom: 20,
    backgroundColor:'blue',
    alignContent:'center',
    textAlign:'center',
    color: '#FFF',
  },
  ImageStyle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
});
export default App;