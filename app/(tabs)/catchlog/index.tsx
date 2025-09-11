import { Text, View, StyleSheet } from 'react-native';
import {Link} from 'expo-router';

export default function CatchLogScreen() {
  return (
    <View style={styles.container}>

      <Link href="/catchlog/newlog">
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>📝 New Log</Text>
        </View>
      </Link>

      <Link href="/catchlog/history">
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>📊 History</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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