import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../../src/store/themeStore';
import { useLocation } from '../../../src/hooks/useLocation';
import { CascadingOutreachDropdown } from '../../../src/components/CascadingOutreachDropdown';
import { ParticipantList } from '../../../src/components/ParticipantList';
import { communityBarrierApi, CommunityBarrier, Participant } from '../../../src/api/coreForms';

const GROUP_TYPES = ['Community Leaders', 'Women Groups', 'Youth Groups', 'Elders', 'Mixed Community', 'Other'];

export default function CommunityBarriersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  const { loading: locationLoading, getLocation } = useLocation();

  const [formData, setFormData] = useState<CommunityBarrier>({
    date: new Date().toISOString().split('T')[0],
    venue: '',
    uc: '',
    district: '',
    fix_site: '',
    outreach: '',
    community: '',
    group_type: '',
    participants_males: 0,
    participants_females: 0,
    facilitator_tkf: '',
    participants: [],
  });

  const updateField = <K extends keyof CommunityBarrier>(field: K, value: CommunityBarrier[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownSelect = (values: {
    district: string;
    unionCouncil: string;
    fixSite: string;
    outreach: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      district: values.district,
      uc: values.unionCouncil,
      fix_site: values.fixSite,
      outreach: values.outreach,
    }));
  };

  const handleParticipantsChange = (participants: Participant[]) => {
    setFormData((prev) => ({ ...prev, participants }));
  };

  const handleGetLocation = async () => {
    const coords = await getLocation();
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.district || !formData.uc || !formData.outreach) {
      Alert.alert('Validation Error', 'Please select all location fields');
      return;
    }
    if (!formData.date || !formData.venue || !formData.group_type || !formData.facilitator_tkf) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }
    if (formData.participants.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one participant');
      return;
    }

    try {
      setLoading(true);
      await communityBarrierApi.create(formData);
      Alert.alert('Success', 'Community barrier activity saved successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>👥 Community Barrier Activity</Text>
          <Text style={[styles.headerDesc, { color: colors.muted }]}>
            Record community barrier analysis sessions and participant details
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Details</Text>

        <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={formData.date}
          onChangeText={(v) => updateField('date', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Venue *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter venue name"
          placeholderTextColor={colors.muted}
          value={formData.venue}
          onChangeText={(v) => updateField('venue', v)}
        />

        <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={true} />

        <Text style={[styles.label, { color: colors.text }]}>Community</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter community name"
          placeholderTextColor={colors.muted}
          value={formData.community}
          onChangeText={(v) => updateField('community', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Group Type *</Text>
        <View style={styles.chipRow}>
          {GROUP_TYPES.map((g) => (
            <Pressable
              key={g}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.group_type === g && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => updateField('group_type', g)}
            >
              <Text style={{ color: formData.group_type === g ? '#fff' : colors.text, fontSize: 13 }}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Participant Count
        </Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Males</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.participants_males.toString()}
              onChangeText={(v) => updateField('participants_males', parseInt(v) || 0)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Females</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.participants_females.toString()}
              onChangeText={(v) => updateField('participants_females', parseInt(v) || 0)}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>TKF Facilitator *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter facilitator name"
          placeholderTextColor={colors.muted}
          value={formData.facilitator_tkf}
          onChangeText={(v) => updateField('facilitator_tkf', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          GPS Coordinates
        </Text>

        <Pressable
          style={[styles.locationBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleGetLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={{ color: colors.primary }}>📍 Capture Current Location</Text>
          )}
        </Pressable>

        {formData.latitude && formData.longitude && (
          <Text style={[styles.locationText, { color: colors.muted }]}>
            Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
          </Text>
        )}

        <ParticipantList
          participants={formData.participants}
          onChange={handleParticipantsChange}
        />

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Activity</Text>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  locationText: {
    marginTop: 8,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 32,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
