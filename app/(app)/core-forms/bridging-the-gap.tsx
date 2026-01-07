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
import { BridgingTheGapParticipantList } from '../../../src/components/BridgingTheGapParticipantList';
import { IITTeamSearch } from '../../../src/components/IITTeamSearch';
import { FormIdBanner } from '../../../src/components/FormIdBanner';
import { DateTimePicker } from '../../../src/components/DateTimePicker';
import {
  bridgingTheGapApi,
  BridgingTheGap,
  BridgingTheGapParticipant,
  IITTeamMember,
  generateFormId,
} from '../../../src/api/coreForms';

type TabType = 'attendance' | 'iit';

export default function BridgingTheGapScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formIdLoading, setFormIdLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const { loading: locationLoading, getLocation } = useLocation();
  const { getDeviceInfo } = useDeviceInfo();
  const startedAt = useRef(new Date().toISOString());

  useEffect(() => {
    const fetchFormId = async () => {
      try {
        const id = await generateFormId('bridging_the_gap');
        setFormId(id);
      } catch (error) {
        console.error('Failed to generate form ID:', error);
        setFormId(`BG-${Date.now().toString(36).toUpperCase()}`);
      } finally {
        setFormIdLoading(false);
      }
    };
    fetchFormId();
  }, []);

  const [formData, setFormData] = useState<BridgingTheGap>({
    date: new Date().toISOString(),
    venue: '',
    district: '',
    uc: '',
    fix_site: '',
    participants_males: 0,
    participants_females: 0,
    participants: [],
    team_members: [],
  });

  const updateField = <K extends keyof BridgingTheGap>(field: K, value: BridgingTheGap[K]) => {
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
    }));
  };

  const handleSubmit = async () => {
    // Validation for Attendance tab
    if (!formData.district || !formData.uc || !formData.fix_site) {
      showWarningDialog('Validation Error', 'Please select all location fields (District, UC, Fix Site)');
      setActiveTab('attendance');
      return;
    }
    if (!formData.date || !formData.venue) {
      showWarningDialog('Validation Error', 'Please fill Date and Venue fields');
      setActiveTab('attendance');
      return;
    }
    if (formData.participants.length === 0) {
      showWarningDialog('Validation Error', 'Please add at least one participant in the Attendance tab');
      setActiveTab('attendance');
      return;
    }

    // IIT Team Members are optional but show a confirmation if none selected
    if (formData.team_members.length === 0) {
      showWarningDialog(
        'No Team Members',
        'You have not selected any IIT team members. The form will be submitted without IIT team members.'
      );
    }

    try {
      setLoading(true);
      const location = await getLocation();
      const submitData = {
        ...formData,
        unique_id: formId || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
        device_info: getDeviceInfo(),
        started_at: startedAt.current,
        submitted_at: new Date().toISOString(),
      };
      await bridgingTheGapApi.create(submitData);
      showSuccessDialog('Success', 'Bridging The Gap form saved successfully', () => router.back());
    } catch (error: any) {
      showErrorDialog(error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <Pressable
      style={[
        styles.tabButton,
        { borderColor: colors.border },
        activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: colors.text },
          activeTab === tab && { color: '#fff' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormIdBanner formId={formId} loading={formIdLoading} formTitle="Bridging The Gap" />

        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🌉 Bridging The Gap</Text>
          <Text style={[styles.headerDesc, { color: colors.muted }]}>
            Record attendance and build Immunization Improvement Teams
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton('attendance', 'Attendance')}
          {renderTabButton('iit', 'IIT (Immunization Team)')}
        </View>

        {/* Tab Content */}
        {activeTab === 'attendance' ? (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Session Details</Text>

            <Text style={[styles.label, { color: colors.text }]}>Date & Time *</Text>
            <DateTimePicker
              value={new Date(formData.date)}
              onChange={(date: Date) => updateField('date', date.toISOString())}
              mode="datetime"
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Venue *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={formData.venue}
              onChangeText={(text) => updateField('venue', text)}
              placeholder="Enter venue"
              placeholderTextColor={colors.muted}
            />

            <CascadingOutreachDropdown onSelect={handleDropdownSelect} showFixSite={true} />

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Participant Count
            </Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text }]}>Males</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={String(formData.participants_males)}
                  onChangeText={(text) => updateField('participants_males', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text }]}>Females</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={String(formData.participants_females)}
                  onChangeText={(text) => updateField('participants_females', parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              Participants List
            </Text>

            <BridgingTheGapParticipantList
              participants={formData.participants}
              onChange={(participants: BridgingTheGapParticipant[]) => updateField('participants', participants)}
            />
          </View>
        ) : (
          <View>
            <IITTeamSearch
              uc={formData.uc}
              selectedMembers={formData.team_members}
              onMembersChange={(members: IITTeamMember[]) => updateField('team_members', members)}
            />
          </View>
        )}

        <View style={styles.submitSection}>
          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.primary }, loading && styles.saveBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Submit Form</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  submitSection: {
    marginTop: 32,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
