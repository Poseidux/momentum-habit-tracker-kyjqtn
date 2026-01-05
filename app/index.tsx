
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to home tab on app launch (no auth required for freemium)
  return <Redirect href="/(tabs)/(home)/" />;
}
