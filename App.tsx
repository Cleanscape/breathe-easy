// Deep imports keep only the five weights we use in the bundle.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PremiumProvider } from './src/lib/premium';
import { StoreProvider, useStore } from './src/lib/store';
import { Home } from './src/screens/Home';
import { Onboarding } from './src/screens/Onboarding';
import { Paywall } from './src/screens/Paywall';
import { Progress } from './src/screens/Progress';
import { GoalEditor, Settings } from './src/screens/Settings';
import { Sos } from './src/screens/Sos';
import { colors } from './src/theme';

export type Screen = 'home' | 'sos' | 'progress' | 'paywall' | 'settings' | 'goal';
export type Go = (s: Screen) => void;

function Root() {
  const { state, loaded } = useStore();
  const [screen, setScreen] = useState<Screen>('home');
  // Starting over always lands back on home after onboarding.
  useEffect(() => {
    if (!state.onboarded) setScreen('home');
  }, [state.onboarded]);
  if (!loaded) return null;

  const dark = state.onboarded && screen === 'sos';
  let body;
  if (!state.onboarded) body = <Onboarding />;
  else if (screen === 'sos') body = <Sos go={setScreen} />;
  else if (screen === 'progress') body = <Progress go={setScreen} />;
  else if (screen === 'paywall') body = <Paywall go={setScreen} />;
  else if (screen === 'settings') body = <Settings go={setScreen} />;
  else if (screen === 'goal') body = <GoalEditor go={setScreen} />;
  else body = <Home go={setScreen} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: dark ? colors.pine : colors.freshAir }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {/* Phone-width column, centred on tablets and desktop browsers. */}
      <View style={styles.column}>{body}</View>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <PremiumProvider>
          <Root />
        </PremiumProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
