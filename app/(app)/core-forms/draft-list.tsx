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
import { draftListApi, DraftList } from '../../../src/api/coreForms';

const CHILD_TYPES = ['Zero Dose', 'Defaulter', 'Refusal'];
const VACCINES = ['BCG', 'OPV0', 'OPV1', 'OPV2', 'OPV3', 'Penta1', 'Penta2', 'Penta3', 'Measles1', 'Measles2', 'PCV1', 'PCV2', 'PCV3'];
const GENDERS = ['Male', 'Female'];

export default function DraftListScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  const { loading: locationLoading, getLocation } = useLocation();

  const [formData, setFormData] = useState<DraftList>({
    division: '',
    district: '',
    town: '',
    uc: '',
    outreach: '',
    child_name: '',
    father_name: '',
    gender: '',
    date_of_birth: '',
    age_in_months: 0,
    address: '',
    type: '',
    missed_vaccines: [],
    reasons_of_missing: '',
    plan_for_coverage: '',
  });

  const updateField = <K extends keyof DraftList>(field: K, value: DraftList[K]) => {
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
      outreach: values.outreach,
    }));
  };

  const toggleVaccine = (vaccine: string) => {
    setFormData((prev) => {
      const current = prev.missed_vaccines || [];
      if (current.includes(vaccine)) {
        return { ...prev, missed_vaccines: current.filter((v) => v !== vaccine) };
      }
      return { ...prev, missed_vaccines: [...current, vaccine] };
    });
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
    if (!formData.child_name || !formData.father_name || !formData.gender || !formData.date_of_birth) {
      Alert.alert('Validation Error', 'Please fill child details');
      return;
    }
    if (!formData.type || formData.missed_vaccines.length === 0) {
      Alert.alert('Validation Error', 'Please select child type and missed vaccines');
      return;
    }

    try {
      setLoading(true);
      await draftListApi.create(formData);
      Alert.alert('Success', 'Draft list entry saved successfully', [
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Details</Text>
        
        <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={false} />

        <Text style={[styles.label, { color: colors.text }]}>Division</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter division"
          placeholderTextColor={colors.muted}
          value={formData.division}
          onChangeText={(v) => updateField('division', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Town</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter town name"
          placeholderTextColor={colors.muted}
          value={formData.town}
          onChangeText={(v) => updateField('town', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Child Details
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Child Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter child name"
          placeholderTextColor={colors.muted}
          value={formData.child_name}
          onChangeText={(v) => updateField('child_name', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Father Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter father name"
          placeholderTextColor={colors.muted}
          value={formData.father_name}
          onChangeText={(v) => updateField('father_name', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Gender *</Text>
        <View style={styles.chipRow}>
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.gender === g && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => updateField('gender', g)}
            >
              <Text style={{ color: formData.gender === g ? '#fff' : colors.text }}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Date of Birth *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={formData.date_of_birth}
          onChangeText={(v) => updateField('date_of_birth', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Age in Months</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="0"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={formData.age_in_months.toString()}
          onChangeText={(v) => updateField('age_in_months', parseInt(v) || 0)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Father CNIC</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="XXXXX-XXXXXXX-X"
          placeholderTextColor={colors.muted}
          value={formData.father_cnic || ''}
          onChangeText={(v) => updateField('father_cnic', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>House Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter house number"
          placeholderTextColor={colors.muted}
          value={formData.house_number || ''}
          onChangeText={(v) => updateField('house_number', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Address *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter full address"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={2}
          value={formData.address}
          onChangeText={(v) => updateField('address', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Guardian Phone</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter phone number"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          value={formData.guardian_phone || ''}
          onChangeText={(v) => updateField('guardian_phone', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Vaccination Status
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Child Type *</Text>
        <View style={styles.chipRow}>
          {CHILD_TYPES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.type === t && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => updateField('type', t)}
            >
              <Text style={{ color: formData.type === t ? '#fff' : colors.text }}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Missed Vaccines *</Text>
        <View style={styles.chipGrid}>
          {VACCINES.map((v) => (
            <Pressable
              key={v}
              style={[
                styles.vaccineChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.missed_vaccines.includes(v) && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => toggleVaccine(v)}
            >
              <Text style={{ color: formData.missed_vaccines.includes(v) ? '#fff' : colors.text, fontSize: 12 }}>
                {v}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Reasons for Missing *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter reasons"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          value={formData.reasons_of_missing}
          onChangeText={(v) => updateField('reasons_of_missing', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Plan for Coverage *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter coverage plan"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          value={formData.plan_for_coverage}
          onChangeText={(v) => updateField('plan_for_coverage', v)}
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

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Draft List Entry</Text>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vaccineChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
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
