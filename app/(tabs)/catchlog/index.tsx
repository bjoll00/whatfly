import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const LogImage = require('@/assets/images/square_cutthroat.jpg');

export default function CatchLogScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Link href="/catchlog/newlog">
          <View style={styles.buttonContainer}>
            <Image source={LogImage} style={styles.image} />
            <Text style={styles.buttonLabel}>New Log</Text>
          </View>
        </Link>

        <Link href="/catchlog/history">
          <View style={styles.buttonContainer}>
            <Image source={LogImage} style={styles.image} />
            <Text style={styles.buttonLabel}>History</Text>
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
    justifyContent: 'space-around',
    paddingVertical: 60,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  buttonContainer:{
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  buttonLabel: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15,
  }
});