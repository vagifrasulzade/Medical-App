import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import useTheme from "@/hooks/use-theme";
import { BottomTabBar } from "../components/BottomTabBar";
import { HOSPITALS } from "../data/hospital";

const STATUS_BAR_H =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 44;

const BAKU_REGION: Region = {
  latitude: 40.4093,
  longitude: 49.8671,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

type Hospital = {
  id: number;
  name: string;
  category: string;
  address: string;
  phone?: string;
  photo?: string;
  rating?: number;
  reviewCount?: number;
  type?: string;
  openHours?: string;
  departments?: string[];
  lat: number;
  lng: number;
};

type HospitalWithDist = Hospital & { distanceKm: number };

function toRadians(v: number) {
  return (v * Math.PI) / 180;
}
function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const formatDist = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "Public", label: "Public" },
  { id: "Private", label: "Private" },
];

export default function MapScreen() {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === "dark";
  const screenBg = isDark ? "#0F172A" : "#F5F7FF";
  const panelBg = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#1A1A2E";
  const textSecondary = isDark ? "#9CA3AF" : "#9EA3B8";

  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>(BAKU_REGION);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Slide panel
  const [showPanel, setShowPanel] = useState(false);
  const [sortedHospitals, setSortedHospitals] = useState<HospitalWithDist[]>([]);
  const slideAnim = useRef(new Animated.Value(500)).current;

  const displayed = (HOSPITALS as Hospital[]).filter((h) => {
    if (activeFilter !== "all" && h.category !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        (h.address || "").toLowerCase().includes(q) ||
        (h.type || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Location permission denied.");
          setTimeout(() => setErrorMsg(null), 3000);
          return;
        }
        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
        const { latitude, longitude } = (loc as Location.LocationObject).coords;
        setUserLocation({ latitude, longitude });
        const r: Region = { latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 };
        setRegion(r);
        mapRef.current?.animateToRegion(r, 800);
      } catch {
        // fallback to Baku
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const openPanel = () => {
    if (!userLocation) {
      setErrorMsg("Location not available yet.");
      setTimeout(() => setErrorMsg(null), 2500);
      return;
    }
    const pool = displayed.length > 0 ? displayed : (HOSPITALS as Hospital[]);
    const withDist: HospitalWithDist[] = pool
      .map((h) => ({
        ...h,
        distanceKm: calcDistanceKm(userLocation.latitude, userLocation.longitude, h.lat, h.lng),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    setSortedHospitals(withDist);
    setShowPanel(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 58,
      friction: 11,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setShowPanel(false));
  };

  const selectFromPanel = (h: HospitalWithDist) => {
    closePanel();
    const r: Region = {
      latitude: h.lat,
      longitude: h.lng,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };
    setRegion(r);
    mapRef.current?.animateToRegion(r, 700);
    setSelectedHospital(h);
  };

  const goToMyLocation = () => {
    if (!userLocation) return;
    const r: Region = { ...userLocation, latitudeDelta: 0.06, longitudeDelta: 0.06 };
    mapRef.current?.animateToRegion(r, 600);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setSelectedHospital(null);
    if (userLocation) {
      const r: Region = { ...userLocation, latitudeDelta: 0.1, longitudeDelta: 0.1 };
      mapRef.current?.animateToRegion(r, 400);
    }
  };

  return (
    <View style={[s.root, { backgroundColor: screenBg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#3D5AFE", "#6979F8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.header, { paddingTop: STATUS_BAR_H + 12 }]}
      >
        <Text style={s.headerTitle}>🏥 Nearby Hospitals</Text>

        <View style={[s.searchBar, { backgroundColor: panelBg }]}>
          <Ionicons name="search-outline" size={17} color="#8A8A9B" />
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search hospital, area…"
            placeholderTextColor="#A0A0B5"
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={17} color="#8A8A9B" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => { setActiveFilter(tab.id); setSelectedHospital(null); }}
                style={[s.filterChip, active && s.filterChipActive, active && isDark ? { backgroundColor: panelBg } : null]}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive, active && isDark ? { color: "#93C5FD" } : null]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <View style={s.countBadge}>
            <Text style={s.countText}>{displayed.length} found</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={s.mapWrap}>
        {loadingLocation && (
          <View style={[s.loadingOverlay, { backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.7)" }]}>
            <ActivityIndicator size="large" color="#3D5AFE" />
            <Text style={s.loadingText}>Finding location…</Text>
          </View>
        )}

        <MapView
          ref={mapRef}
          style={s.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass
          showsScale
          onPress={() => { if (showPanel) closePanel(); }}
        >
          {displayed.map((h) => (
            <Marker
              key={h.id}
              coordinate={{ latitude: h.lat, longitude: h.lng }}
              pinColor={h.category === "Private" ? "#3D5AFE" : "#00C896"}
              onPress={() => setSelectedHospital(h)}
            >
              <Callout tooltip>
                <View style={[s.callout, { backgroundColor: panelBg }]}>
                  <Text style={[s.calloutTitle, { color: textPrimary }]}>{h.name}</Text>
                  <Text style={s.calloutSub}>{h.type}</Text>
                  {h.rating != null && (
                    <Text style={[s.calloutRating, { color: textSecondary }]}>⭐ {h.rating} · {h.openHours}</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* My location button */}
        <TouchableOpacity onPress={goToMyLocation} style={[s.locateBtn, { backgroundColor: panelBg }]}>
          <Ionicons name="locate" size={22} color="#3D5AFE" />
        </TouchableOpacity>

        {/* Nearest → opens slide panel */}
        <TouchableOpacity onPress={openPanel} style={s.nearestBtn}>
          <Ionicons name="navigate" size={16} color="#fff" />
          <Text style={s.nearestText}>Nearest</Text>
        </TouchableOpacity>

        {/* Selected hospital info card */}
        {selectedHospital && !showPanel && (
          <View style={[s.infoCard, { backgroundColor: panelBg }]}>
            {selectedHospital.photo && (
              <Image source={{ uri: selectedHospital.photo }} style={s.infoPhoto} resizeMode="cover" />
            )}
            <View style={[s.infoCardRow, { marginTop: selectedHospital.photo ? 10 : 0 }]}>
              <View style={s.infoLeft}>
                <View style={[s.categoryDot, { backgroundColor: selectedHospital.category === "Private" ? "#3D5AFE" : "#00C896" }]} />
                <Text style={[s.infoCategory, { color: textSecondary }]}>{selectedHospital.category}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedHospital(null)}>
                <Ionicons name="close" size={18} color="#9EA3B8" />
              </TouchableOpacity>
            </View>
            <Text style={[s.infoName, { color: textPrimary }]}>{selectedHospital.name}</Text>
            <Text style={[s.infoAddress, { color: textSecondary }]} numberOfLines={1}>📍 {selectedHospital.address}</Text>
            <View style={s.infoMeta}>
              {selectedHospital.rating != null && <Text style={[s.infoMetaText, { color: isDark ? "#D1D5DB" : "#4A4A6A" }]}>⭐ {selectedHospital.rating}</Text>}
              {selectedHospital.openHours && <Text style={[s.infoMetaText, { color: isDark ? "#D1D5DB" : "#4A4A6A" }]}>🕐 {selectedHospital.openHours}</Text>}
              {selectedHospital.type && <Text style={[s.infoMetaText, { color: isDark ? "#D1D5DB" : "#4A4A6A" }]}>🏥 {selectedHospital.type}</Text>}
            </View>
            {selectedHospital.departments && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {selectedHospital.departments.map((d) => (
                  <View key={d} style={[s.deptChip, isDark ? { backgroundColor: "#1F2937" } : null]}>
                    <Text style={s.deptText}>{d}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ── Slide-up Nearest Panel ── */}
        {showPanel && (
          <>
            <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={closePanel} />
            <Animated.View
              style={[
                s.slidePanel,
                { backgroundColor: panelBg, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Handle bar */}
              <View style={s.panelHandle} />

              {/* Header */}
              <View style={s.panelHeader}>
                <View>
                  <Text style={[s.panelTitle, { color: textPrimary }]}>🏥 Nearest Hospitals</Text>
                  <Text style={[s.panelSub, { color: textSecondary }]}>Sorted by distance from you</Text>
                </View>
                <TouchableOpacity onPress={closePanel} style={s.panelCloseBtn}>
                  <Ionicons name="close" size={20} color={textSecondary} />
                </TouchableOpacity>
              </View>

              {/* List */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.panelList}>
                {sortedHospitals.map((h, index) => (
                  <TouchableOpacity
                    key={h.id}
                    style={[s.panelCard, { backgroundColor: isDark ? "#1F2937" : "#F8F9FF" }]}
                    onPress={() => selectFromPanel(h)}
                    activeOpacity={0.75}
                  >
                    {/* Rank number */}
                    <View
                      style={[
                        s.rankBadge,
                        {
                          backgroundColor:
                            index === 0 ? "#3D5AFE" :
                            index === 1 ? "#6979F8" :
                            index === 2 ? "#00C896" :
                            isDark ? "#374151" : "#E8EAFE",
                        },
                      ]}
                    >
                      <Text style={[s.rankText, { color: index < 3 ? "#fff" : isDark ? "#9CA3AF" : "#3D5AFE" }]}>
                        {index + 1}
                      </Text>
                    </View>

                    {/* Photo */}
                    {h.photo ? (
                      <Image source={{ uri: h.photo }} style={s.panelCardPhoto} resizeMode="cover" />
                    ) : (
                      <View style={[s.panelCardPhoto, { backgroundColor: isDark ? "#374151" : "#E8EAFE", alignItems: "center", justifyContent: "center" }]}>
                        <Ionicons name="business" size={22} color="#3D5AFE" />
                      </View>
                    )}

                    {/* Info */}
                    <View style={s.panelCardInfo}>
                      <Text style={[s.panelCardName, { color: textPrimary }]} numberOfLines={1}>{h.name}</Text>
                      <Text style={[s.panelCardAddress, { color: textSecondary }]} numberOfLines={1}>📍 {h.address}</Text>
                      <View style={s.panelCardMeta}>
                        {h.rating != null && <Text style={s.panelCardMetaItem}>⭐ {h.rating}</Text>}
                        {h.openHours && <Text style={s.panelCardMetaItem}>🕐 {h.openHours}</Text>}
                      </View>
                      <View style={s.panelCardBadgeRow}>
                        <View style={[s.catBadge, { backgroundColor: h.category === "Private" ? "#EEF1FF" : "#E6FAF5" }]}>
                          <Text style={[s.catBadgeText, { color: h.category === "Private" ? "#3D5AFE" : "#00A676" }]}>
                            {h.category}
                          </Text>
                        </View>
                        <View style={s.distBadge}>
                          <Ionicons name="walk-outline" size={11} color="#3D5AFE" />
                          <Text style={s.distText}>{formatDist(h.distanceKm)}</Text>
                        </View>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color={isDark ? "#4B5563" : "#CBD5E1"} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </>
        )}

        {errorMsg && (
          <View style={s.errorToast}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        )}
      </View>

      <BottomTabBar activeTab="map" />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F7FF" },
  header: { paddingBottom: 14, paddingHorizontal: 20 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 12 },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 13.5, color: "#1A1A2E" },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 2 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  filterChipActive: { backgroundColor: "#fff" },
  filterChipText: { fontSize: 12.5, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  filterChipTextActive: { color: "#3D5AFE" },
  countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)" },
  countText: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#3D5AFE", marginTop: 8, fontWeight: "600", fontSize: 14 },
  locateBtn: {
    position: "absolute",
    bottom: 120,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  nearestBtn: {
    position: "absolute",
    bottom: 120,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3D5AFE",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 6,
    shadowColor: "#3D5AFE",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  nearestText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  infoCard: {
    position: "absolute",
    bottom: 76,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    elevation: 8,
    shadowColor: "#3D5AFE",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  infoPhoto: { width: "100%", height: 140, borderRadius: 14, marginBottom: 2 },
  infoCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  infoCategory: { fontSize: 11.5, fontWeight: "700", color: "#9EA3B8" },
  infoName: { fontSize: 15, fontWeight: "800", color: "#1A1A2E", marginBottom: 4 },
  infoAddress: { fontSize: 12, color: "#9EA3B8", marginBottom: 6 },
  infoMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  infoMetaText: { fontSize: 12, color: "#4A4A6A", fontWeight: "500" },
  deptChip: { backgroundColor: "#EEF1FF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginRight: 6 },
  deptText: { fontSize: 11, color: "#3D5AFE", fontWeight: "600" },
  callout: { backgroundColor: "#fff", borderRadius: 12, padding: 10, minWidth: 160, elevation: 4, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6 },
  calloutTitle: { fontSize: 13, fontWeight: "700", color: "#1A1A2E", marginBottom: 2 },
  calloutSub: { fontSize: 11, color: "#3D5AFE", marginBottom: 2 },
  calloutRating: { fontSize: 11, color: "#9EA3B8" },
  errorToast: { position: "absolute", top: 16, left: 24, right: 24, backgroundColor: "#1A1A2E", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  errorText: { color: "#fff", fontSize: 13 },

  // ── Slide panel styles ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 20,
  },
  slidePanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    maxHeight: "76%",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
  },
  panelHandle: {
    width: 44,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  panelTitle: { fontSize: 16, fontWeight: "800" },
  panelSub: { fontSize: 12, marginTop: 2 },
  panelCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(158,163,184,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  panelList: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  panelCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankText: { fontSize: 12, fontWeight: "800" },
  panelCardPhoto: { width: 56, height: 56, borderRadius: 14, flexShrink: 0 },
  panelCardInfo: { flex: 1 },
  panelCardName: { fontSize: 13.5, fontWeight: "700", marginBottom: 2 },
  panelCardAddress: { fontSize: 11.5, marginBottom: 4 },
  panelCardMeta: { flexDirection: "row", gap: 10, marginBottom: 5 },
  panelCardMetaItem: { fontSize: 11, color: "#6B7280", fontWeight: "500" },
  panelCardBadgeRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  catBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText: { fontSize: 10.5, fontWeight: "700" },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EEF1FF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  distText: { fontSize: 10.5, color: "#3D5AFE", fontWeight: "700" },
});
