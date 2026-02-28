import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

export async function findNearestHospital(
  setLoading: (v: boolean) => void
) {
  setLoading(true);
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow location access so we can find hospitals near you."
      );
      return;
    }

    // 10-second GPS timeout
    const loc = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("GPS timeout")), 10000)
      ),
    ]);

    const { latitude, longitude } = (loc as Location.LocationObject).coords;

    const androidUrl = `geo:${latitude},${longitude}?q=hospital`;
    const iosUrl     = `maps://?q=hospital&ll=${latitude},${longitude}`;
    const webUrl     = `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`;

    const nativeUrl = Platform.OS === "ios" ? iosUrl : androidUrl;

    const canOpen = await Linking.canOpenURL(nativeUrl);
    Linking.openURL(canOpen ? nativeUrl : webUrl).catch(() =>
      Alert.alert("Cannot open Maps", "Please install Google Maps or Apple Maps.")
    );
  } catch (e: any) {
    if (e?.message === "GPS timeout") {
      const fallback = `https://www.google.com/maps/search/hospitals/`;
      Linking.openURL(fallback);
    } else {
      Alert.alert("Error", "Could not get your location. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}
