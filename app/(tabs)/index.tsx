import { Text, View, StyleSheet } from 'react-native';
import {Link} from 'expo-router';
import {Image} from 'expo-image';
import ImageViewer from '@/.expo/components/ImageViewer';
import Button from '@/.expo/components/Button';

const WhatflyImage = require('@/assets/images/square_cutthroat.jpg');
const LogImage = require('@/assets/images/glowing_tent.jpeg');


export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer} >
        <Link href='/whatfly' >
          <View style={styles.buttonContainer}>
            <ImageViewer imgSource={WhatflyImage} />
            <Text style={styles.buttonLabel}>What Fly</Text>
          </View>
        </Link>
      
        <Link href='/catchlog' >
          <View style={styles.buttonContainer}>
            <ImageViewer imgSource={LogImage} />
            <Text style={styles.buttonLabel}>Catch Log</Text>
          </View>
        </Link>
      </View>
      {/* <View style={styles.footerContainer}>
        <Button theme='primary' label="Choose a photo" />
      </View> */}
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
  }
});