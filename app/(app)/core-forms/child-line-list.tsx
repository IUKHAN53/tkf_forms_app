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
import { FormIdBanner } from '../../../src/components/FormIdBanner';
import { DateTimePicker } from '../../../src/components/DateTimePicker';
import { PhoneInput } from '../../../src/components/PhoneInput';
import { childLineListApi, ChildLineList, generateFormId } from '../../../src/api/coreForms';

const CHILD_TYPES = ['Zero Dose', 'Defaulter'] as const;
const GENDERS = ['male', 'female'] as const;
const VACCINES = ['BCG', 'OPV0', 'OPV1', 'OPV2', 'OPV3', 'Penta1', 'Penta2', 'Penta3', 'PCV1', 'PCV2', 'PCV3', 'IPV1', 'IPV2', 'Measles1', 'Measles2', 'HepB'];
const REASONS = ['Refusal', 'Not Aware', 'Fear of Side Effects', 'Health Facility Far', 'No Vaccinator Available', 'Child Sick', 'Out of Station', 'Other'];

export default function ChildLineListScreen() {
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
        const id = await generateFormId('child_line_list');
        setFormId(id);
      } catch (error) {
        console.error('Failed to generate form ID:', error);
        setFormId(`CL-${Date.now().toString(36).toUpperCase()}`);
      } finally {
        setFormIdLoading(false);
      }
    };
    fetchFormId();
  }, []);

  const [formData, setFormData] = useState<ChildLineList>({
    division: '',
    district: '',
    town: '',
    uc: '',
    outreach: '',
    child_name: '',
    father_name: '',
    gender: 'male',
    date_of_birth: new Date().toISOString(),
    age_in_months: 0,
    father_cnic: '',
    house_number: '',
    address: '',
    guardian_phone: '',
    type: 'Zero Dose',
    missed_vaccines: [],
    reasons_of_missing: '',
    plan_for_coverage: '',
  });

  const updateField = <K extends keyof ChildLineList>(field: K, value: ChildLineList[K]) => {
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

  const calculateAgeInMonths = (dob: Date) => {
    const today = new Date();
    const months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    return Math.max(0, months);
  };

  const handleDateOfBirthChange = (date: Date) => {
    const ageInMonths = calculateAgeInMonths(date);
    setFormData((prev) => ({
      ...prev,
      date_of_birth: date.toISOString(),
      age_in_months: ageInMonths,
    }));
  };

  const toggleVaccine = (vaccine: string) => {
    const current = formData.missed_vaccines;
    if (current.includes(vaccine)) {
      updateField('missed_vaccines', current.filter(v => v !== vaccine));
    } else {
      updateField('missed_vaccines', [...current, vaccine]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.district || !formData.uc || !formData.outreach) {
      showWarningDialog('Validation Error', 'Please select all location fields');
      return;
    }
    if (!formData.child_name || !formData.father_name) {
      showWarningDialog('Validation Error', 'Please enter child and father names');
      return;
    }
    if (!formData.address) {
      showWarningDialog('Validation Error', 'Please enter address');
      return;
    }
    if (formData.missed_vaccines.length === 0) {
      showWarningDialog('Validation Error', 'Please select at least one missed vaccine');
      return;
    }
    if (!formData.reasons_of_missing) {
      showWarningDialog('Validation Error', 'Please select reason for missing');
      return;
    }
    if (!formData.plan_for_coverage) {
      showWarningDialog('Validation Error', 'Please enter plan for coverage');
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
      await childLineListApi.create(submitData);
      showSuccessDialog('Success', 'Child Line List entry saved successfully', () => router.back());
    } catch (error: any) {
      showErrorDialog(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormIdBanner formId={formId} loading={formIdLoading} formTitle="Child Line List" />

        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Child Line List</Text>
          <Text style={[styles.headerDesc, { color: colors.muted }]}>
            Record zero dose and defaulter children for follow-up and coverage planning
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Details</Text>

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
          placeholder="Enter town"
          placeholderTextColor={colors.muted}
          value={formData.town}
          onChangeText={(v) => updateField('town', v)}
        />

        <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={false} />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Child Information</Text>

        <Text style={[styles.label, { color: colors.text }]}>Child Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter child's name"
          placeholderTextColor={colors.muted}
          value={formData.child_name}
          onChangeText={(v) => updateField('child_name', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Father Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter father's name"
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
              <Text style={{ color: formData.gender === g ? '#fff' : colors.text, fontSize: 13, textTransform: 'capitalize' }}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Date of Birth *</Text>
        <DateTimePicker
          value={new Date(formData.date_of_birth)}
          onChange={handleDateOfBirthChange}
          mode="date"
        />

        <Text style={[styles.label, { color: colors.text }]}>Age in Months</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Auto-calculated"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={formData.age_in_months.toString()}
          onChangeText={(v) => updateField('age_in_months', parseInt(v) || 0)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Father's CNIC / B-Form</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter CNIC or B-Form number"
          placeholderTextColor={colors.muted}
          value={formData.father_cnic}
          onChangeText={(v) => updateField('father_cnic', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Address Details</Text>

        <Text style={[styles.label, { color: colors.text }]}>House Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter house number"
          placeholderTextColor={colors.muted}
          value={formData.house_number}
          onChangeText={(v) => updateField('house_number', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Address / Location *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }, { minHeight: 80 }]}
          placeholder="Enter full address"
          placeholderTextColor={colors.muted}
          multiline
          value={formData.address}
          onChangeText={(v) => updateField('address', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Guardian Phone Number</Text>
        <PhoneInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={formData.guardian_phone || ''}
          onChangeText={(v) => updateField('guardian_phone', v)}
          placeholderTextColor={colors.muted}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Vaccination Details</Text>

        <Text style={[styles.label, { color: colors.text }]}>Type *</Text>
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
              <Text style={{ color: formData.type === t ? '#fff' : colors.text, fontSize: 13 }}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Missed Vaccines * (Select all that apply)</Text>
        <View style={styles.chipRow}>
          {VACCINES.map((v) => {
            const isSelected = formData.missed_vaccines.includes(v);
            return (
              <Pressable
                key={v}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => toggleVaccine(v)}
              >
                <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 12 }}>{v}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Reason for Missing *</Text>
        <View style={styles.chipRow}>
          {REASONS.map((r) => (
            <Pressable
              key={r}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                formData.reasons_of_missing === r && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => updateField('reasons_of_missing', r)}
            >
              <Text style={{ color: formData.reasons_of_missing === r ? '#fff' : colors.text, fontSize: 12 }}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Plan for Coverage *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }, { minHeight: 80 }]}
          placeholder="Enter plan for coverage (e.g., Follow-up visit scheduled, Refer to health facility)"
          placeholderTextColor={colors.muted}
          multiline
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
            <Text style={{ color: colors.primary }}>Capture Current Location</Text>
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
            <Text style={styles.submitBtnText}>Submit Entry</Text>
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
