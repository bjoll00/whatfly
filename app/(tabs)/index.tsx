import { Text, View, StyleSheet } from 'react-native';
import {Link} from 'expo-router';
import {Image} from 'expo-image';

const WhatflyImage = require('@/assets/images/square_cutthroat.jpg');
const LogImage = require('@/assets/images/glowing_tent.jpeg');


export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer} >
        <Link href='/whatfly' >
          <View style={styles.buttonContainer}>
            <Image source={WhatflyImage} style={styles.image} />
            <Text style={styles.buttonLabel}>What Fly</Text>
          </View>
        </Link>
      
        <Link href='/catchlog' >
          <View style={styles.buttonContainer}>
            <Image source={LogImage} style={styles.image} />
            <Text style={styles.buttonLabel}>Catch Log</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  buttonContainer:{
    alignItems: 'center',
    margin: 10,
  },
  buttonLabel: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  }
});