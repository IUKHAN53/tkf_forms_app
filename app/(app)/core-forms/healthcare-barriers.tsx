import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showErrorDialog, showSuccessDialog, showWarningDialog } from '../../../src/utils/errorDialogs';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../../src/store/themeStore';
import { useLocation } from '../../../src/hooks/useLocation';
import { useDeviceInfo } from '../../../src/hooks/useDeviceInfo';
import { CascadingOutreachDropdown } from '../../../src/components/CascadingOutreachDropdown';
import { HealthcareParticipantList } from '../../../src/components/HealthcareParticipantList';
import { FormIdBanner } from '../../../src/components/FormIdBanner';
import { healthcareBarrierApi, HealthcareBarrier, Participant, generateFormId } from '../../../src/api/coreForms';

const GROUP_TYPES = ['Medics', 'Non-Medics', 'Both'];

export default function HealthcareBarriersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formIdLoading, setFormIdLoading] = useState(true);
  const { loading: locationLoading, getLocation } = useLocation();
  const { getDeviceInfo } = useDeviceInfo();
  const startedAt = useRef(new Date().toISOString());

  useEffect(() => {
    const fetchFormId = async () => {
      try {
        const id = await generateFormId('healthcare_barrier');
        setFormId(id);
      } catch (error) {
        console.error('Failed to generate form ID:', error);
        setFormId(`HB-${Date.now().toString(36).toUpperCase()}`);
      } finally {
        setFormIdLoading(false);
      }
    };
    fetchFormId();
  }, []);

  const [formData, setFormData] = useState<HealthcareBarrier>({
    date: new Date().toISOString(),
    hfs: '',
    address: '',
    uc: '',
    participants_males: 0,
    participants_females: 0,
    group_type: '',
    facilitator_tkf: '',
    participants: [],
  });

  const [selectedDistrict, setSelectedDistrict] = useState('');

  const updateField = <K extends keyof HealthcareBarrier>(field: K, value: HealthcareBarrier[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownSelect = (values: {
    district: string;
    unionCouncil: string;
    fixSite: string;
    outreach: string;
  }) => {
    setSelectedDistrict(values.district);
    setFormData((prev) => ({
      ...prev,
      uc: values.unionCouncil,
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
    if (!formData.uc) {
      showWarningDialog('Validation Error', 'Please select Union Council');
      return;
    }
    if (!formData.date || !formData.hfs || !formData.group_type || !formData.facilitator_tkf) {
      showWarningDialog('Validation Error', 'Please fill all required fields');
      return;
    }
    if (formData.participants.length === 0) {
      showWarningDialog('Validation Error', 'Please add at least one participant');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        unique_id: formId || undefined,
        device_info: getDeviceInfo(),
        started_at: startedAt.current,
        submitted_at: new Date().toISOString(),
      };
      await healthcareBarrierApi.create(submitData);
      showSuccessDialog('Success', 'Healthcare Workers Explore Immunization Barriers activity saved successfully', () => router.back());
    } catch (error: any) {
      showErrorDialog(error);
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
        <FormIdBanner formId={formId} loading={formIdLoading} formTitle="Healthcare Workers Explore Immunization Barriers" />

        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🏥 Healthcare Workers Explore Immunization Barriers</Text>
          <Text style={[styles.headerDesc, { color: colors.muted }]}>
            Document healthcare workers immunization barrier analysis activities
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Details</Text>

        <Text style={[styles.label, { color: colors.text }]}>Date & Time *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          editable={false}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={formData.date}
          onChangeText={(v) => updateField('date', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Health Facility/Site (HFS) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter health facility name"
          placeholderTextColor={colors.muted}
          value={formData.hfs}
          onChangeText={(v) => updateField('hfs', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter facility address"
          placeholderTextColor={colors.muted}
          multiline
          value={formData.address}
          onChangeText={(v) => updateField('address', v)}
        />

        <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={false} />

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

        <HealthcareParticipantList
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
