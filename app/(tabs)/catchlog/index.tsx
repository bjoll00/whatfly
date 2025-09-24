import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../lib/AuthContext';

const NewLogImage = require('@/assets/images/mountain_lake.jpg');
const HistoryImage = require('@/assets/images/brady_tent.jpg');

export default function CatchLogScreen() {
  const { user } = useAuth();

  const handleNewLogPress = () => {
    if (user) {
      router.push('/catchlog/newlog');
    } else {
      router.push('/auth');
    }
  };

  const handleHistoryPress = () => {
    if (user) {
      router.push('/catchlog/history');
    } else {
      router.push('/auth');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleNewLogPress}>
          <View style={styles.buttonContainer}>
            <Image source={NewLogImage} style={styles.image} />
            <Text style={styles.buttonLabel}>New Log</Text>
            {!user && <Text style={styles.signInPrompt}>Sign in to save logs</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHistoryPress}>
          <View style={styles.buttonContainer}>
            <Image source={HistoryImage} style={styles.image} />
            <Text style={styles.buttonLabel}>History</Text>
            {!user && <Text style={styles.signInPrompt}>Sign in to view history</Text>}
          </View>
        </TouchableOpacity>
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
  },
  signInPrompt: {
    color: '#ffd33d',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});