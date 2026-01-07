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
  Modal,
} from 'react-native';
import { showErrorDialog, showSuccessDialog, showWarningDialog } from '../../../src/utils/errorDialogs';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../../src/store/themeStore';
import { useLocation } from '../../../src/hooks/useLocation';
import { useDeviceInfo } from '../../../src/hooks/useDeviceInfo';
import { CascadingOutreachDropdown } from '../../../src/components/CascadingOutreachDropdown';
import { ParticipantList } from '../../../src/components/ParticipantList';
import { FormIdBanner } from '../../../src/components/FormIdBanner';
import { DateTimePicker } from '../../../src/components/DateTimePicker';
import { fgdsCommunityApi, FgdsCommunity, Participant, generateFormId } from '../../../src/api/coreForms';

const COMMUNITIES = ['Pathan', 'Punjabi', 'Sindhi', 'Saraiki', 'Urdu speaking'];

export default function FgdsCommunityScreen() {
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
        const id = await generateFormId('fgds_community');
        setFormId(id);
      } catch (error) {
        console.error('Failed to generate form ID:', error);
        setFormId(`FC-${Date.now().toString(36).toUpperCase()}`);
      } finally {
        setFormIdLoading(false);
      }
    };
    fetchFormId();
  }, []);

  const [formData, setFormData] = useState<FgdsCommunity>({
    date: new Date().toISOString(),
    venue: '',
    uc: '',
    district: '',
    fix_site: '',
    outreach: '',
    community: [],
    participants_males: 0,
    participants_females: 0,
    facilitator_tkf: '',
    participants: [],
  });

  // State for custom community entry
  const [showCustomCommunityModal, setShowCustomCommunityModal] = useState(false);
  const [customCommunity, setCustomCommunity] = useState('');

  const updateField = <K extends keyof FgdsCommunity>(field: K, value: FgdsCommunity[K]) => {
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

  const handleAddCustomCommunity = () => {
    if (customCommunity.trim()) {
      const current = Array.isArray(formData.community) ? formData.community : [];
      if (!current.includes(customCommunity.trim())) {
        updateField('community', [...current, customCommunity.trim()]);
      }
      setCustomCommunity('');
      setShowCustomCommunityModal(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.district || !formData.uc || !formData.outreach) {
      showWarningDialog('Validation Error', 'Please select all location fields');
      return;
    }
    if (!formData.date || !formData.venue || !formData.facilitator_tkf) {
      showWarningDialog('Validation Error', 'Please fill all required fields');
      return;
    }
    if (formData.community.length === 0) {
      showWarningDialog('Validation Error', 'Please select at least one community');
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
      await fgdsCommunityApi.create(submitData);
      showSuccessDialog('Success', 'FGDs-Community activity saved successfully', () => router.back());
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
        <FormIdBanner formId={formId} loading={formIdLoading} formTitle="FGDs-Community" />

        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>FGDs-Community</Text>
          <Text style={[styles.headerDesc, { color: colors.muted }]}>
            Focus Group Discussions with community members on immunization barriers
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Details</Text>

        <Text style={[styles.label, { color: colors.text }]}>Date & Time *</Text>
        <DateTimePicker
          value={new Date(formData.date)}
          onChange={(date: Date) => updateField('date', date.toISOString())}
          mode="datetime"
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

        <Text style={[styles.label, { color: colors.text }]}>Community * (Select multiple or add custom)</Text>
        <View style={styles.chipRow}>
          {COMMUNITIES.map((c) => {
            const isSelected = Array.isArray(formData.community) && formData.community.includes(c);
            return (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => {
                  const current = Array.isArray(formData.community) ? formData.community : [];
                  if (isSelected) {
                    updateField('community', current.filter(item => item !== c));
                  } else {
                    updateField('community', [...current, c]);
                  }
                }}
              >
                <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 13 }}>{c}</Text>
              </Pressable>
            );
          })}
          {/* Show custom communities that are not in COMMUNITIES */}
          {formData.community
            .filter(c => !COMMUNITIES.includes(c))
            .map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => {
                  const current = formData.community.filter(item => item !== c);
                  updateField('community', current);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13 }}>{c} x</Text>
              </Pressable>
            ))}
          {/* Add Other button */}
          <Pressable
            style={[
              styles.chip,
              { backgroundColor: colors.card, borderColor: colors.primary, borderStyle: 'dashed' },
            ]}
            onPress={() => setShowCustomCommunityModal(true)}
          >
            <Text style={{ color: colors.primary, fontSize: 13 }}>+ Add Other</Text>
          </Pressable>
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
            <Text style={{ color: colors.primary }}>Capture Current Location</Text>
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

      {/* Custom Community Modal */}
      <Modal visible={showCustomCommunityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Custom Community</Text>
            <Text style={[styles.label, { color: colors.text }]}>Community Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter community name"
              placeholderTextColor={colors.muted}
              value={customCommunity}
              onChangeText={setCustomCommunity}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  setShowCustomCommunityModal(false);
                  setCustomCommunity('');
                }}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomCommunity}
              >
                <Text style={styles.saveBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
