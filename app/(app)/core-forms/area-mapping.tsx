import React, { useState, useEffect, useRef } from 'react';
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
import { useDeviceInfo } from '../../../src/hooks/useDeviceInfo';
import { CascadingOutreachDropdown } from '../../../src/components/CascadingOutreachDropdown';
import { FormIdBanner } from '../../../src/components/FormIdBanner';
import { PhoneInput } from '../../../src/components/PhoneInput';
import { areaMappingApi, AreaMapping, generateFormId } from '../../../src/api/coreForms';

export default function AreaMappingScreen() {
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
        const id = await generateFormId('area_mapping');
        setFormId(id);
      } catch (error) {
        console.error('Failed to generate form ID:', error);
        // Generate a local fallback ID
        setFormId(`AM-${Date.now().toString(36).toUpperCase()}`);
      } finally {
        setFormIdLoading(false);
      }
    };
    fetchFormId();
  }, []);
  
  const [formData, setFormData] = useState<AreaMapping>({
    district: '',
    town: '',
    uc_name: '',
    fix_site: '',
    outreach_name: '',
    area_name: '',
    assigned_aic: '',
    assigned_cm: '',
    total_population: 0,
    total_under_2_years: 0,
    total_zero_dose: 0,
    total_defaulter: 0,
    total_refusal: 0,
  });

  const updateField = <K extends keyof AreaMapping>(field: K, value: AreaMapping[K]) => {
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
      uc_name: values.unionCouncil,
      fix_site: values.fixSite,
      outreach_name: values.outreach,
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

  const handleSubmit = async () => {
    // Validation
    if (!formData.district || !formData.uc_name || !formData.fix_site || !formData.outreach_name) {
      Alert.alert('Validation Error', 'Please select all location fields');
      return;
    }
    if (!formData.area_name || !formData.assigned_aic || !formData.assigned_cm) {
      Alert.alert('Validation Error', 'Please fill all required fields');
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
      await areaMappingApi.create(submitData);
      Alert.alert('Success', 'Area mapping saved successfully', [
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormIdBanner formId={formId} loading={formIdLoading} formTitle="Area Mapping Form" />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Details</Text>
        
        <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={true} />

        <Text style={[styles.label, { color: colors.text }]}>Town</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter town name"
          placeholderTextColor={colors.muted}
          value={formData.town}
          onChangeText={(v) => updateField('town', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Area Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter area name"
          placeholderTextColor={colors.muted}
          value={formData.area_name}
          onChangeText={(v) => updateField('area_name', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Assigned Personnel
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Assigned AIC *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter AIC name"
          placeholderTextColor={colors.muted}
          value={formData.assigned_aic}
          onChangeText={(v) => updateField('assigned_aic', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>AIC Contact</Text>
        <PhoneInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholderTextColor={colors.muted}
          value={formData.aic_contact || ''}
          onChangeText={(v) => updateField('aic_contact', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Assigned CM *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Enter CM name"
          placeholderTextColor={colors.muted}
          value={formData.assigned_cm}
          onChangeText={(v) => updateField('assigned_cm', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>CM Contact</Text>
        <PhoneInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholderTextColor={colors.muted}
          value={formData.cm_contact || ''}
          onChangeText={(v) => updateField('cm_contact', v)}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Population Statistics
        </Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Total Population</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.total_population.toString()}
              onChangeText={(v) => updateField('total_population', parseInt(v) || 0)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Under 2 Years</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.total_under_2_years.toString()}
              onChangeText={(v) => updateField('total_under_2_years', parseInt(v) || 0)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Boys Under 2</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={(formData.total_boys_under_2 || 0).toString()}
              onChangeText={(v) => updateField('total_boys_under_2', parseInt(v) || 0)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Girls Under 2</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={(formData.total_girls_under_2 || 0).toString()}
              onChangeText={(v) => updateField('total_girls_under_2', parseInt(v) || 0)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.thirdInput}>
            <Text style={[styles.label, { color: colors.text }]}>Zero Dose</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.total_zero_dose.toString()}
              onChangeText={(v) => updateField('total_zero_dose', parseInt(v) || 0)}
            />
          </View>
          <View style={styles.thirdInput}>
            <Text style={[styles.label, { color: colors.text }]}>Defaulter</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.total_defaulter.toString()}
              onChangeText={(v) => updateField('total_defaulter', parseInt(v) || 0)}
            />
          </View>
          <View style={styles.thirdInput}>
            <Text style={[styles.label, { color: colors.text }]}>Refusal</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={formData.total_refusal.toString()}
              onChangeText={(v) => updateField('total_refusal', parseInt(v) || 0)}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Additional Information
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Major Ethnicity</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Pathan, Sindhi"
          placeholderTextColor={colors.muted}
          value={formData.major_ethnicity || ''}
          onChangeText={(v) => updateField('major_ethnicity', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Major Languages</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Urdu, Pashto"
          placeholderTextColor={colors.muted}
          value={formData.major_languages || ''}
          onChangeText={(v) => updateField('major_languages', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>Nearest PHF</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Nearest Public Health Facility"
          placeholderTextColor={colors.muted}
          value={formData.nearest_phf || ''}
          onChangeText={(v) => updateField('nearest_phf', v)}
        />

        <Text style={[styles.label, { color: colors.text }]}>HF In-charge Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Health Facility In-charge name"
          placeholderTextColor={colors.muted}
          value={formData.hf_incharge_name || ''}
          onChangeText={(v) => updateField('hf_incharge_name', v)}
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
            <Text style={styles.submitBtnText}>Submit Area Mapping</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
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
