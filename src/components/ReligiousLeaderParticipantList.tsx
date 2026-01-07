import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { Participant } from '../api/coreForms';
import { PhoneInput } from './PhoneInput';
import { CNICInput } from './CNICInput';

interface ReligiousLeaderParticipantListProps {
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
}

const emptyParticipant: Participant = {
  name: '',
  title_designation: '',
  address: '',
  contact_no: '',
  cnic: '',
  gender: 'Male', // Default to Male
};

export function ReligiousLeaderParticipantList({ participants, onChange }: ReligiousLeaderParticipantListProps) {
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant>(emptyParticipant);

  const openAddModal = () => {
    setCurrentParticipant({ ...emptyParticipant });
    setEditIndex(null);
    setModalVisible(true);
  };

  const openEditModal = (index: number) => {
    setCurrentParticipant({ ...participants[index] });
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!currentParticipant.name.trim()) return;
    
    const newParticipants = [...participants];
    if (editIndex !== null) {
      newParticipants[editIndex] = currentParticipant;
    } else {
      newParticipants.push(currentParticipant);
    }
    onChange(newParticipants);
    setModalVisible(false);
  };

  const handleDelete = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    onChange(newParticipants);
  };

  const updateField = (field: keyof Participant, value: string) => {
    setCurrentParticipant({ ...currentParticipant, [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Participants</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {participants.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            No participants added yet. Tap "+ Add" to add participants.
          </Text>
        </View>
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item, index) => `participant-${index}-${item.name || ''}`}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={[styles.participantCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.participantHeader}>
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <View style={styles.participantActions}>
                  <Pressable onPress={() => openEditModal(index)}>
                    <Text style={{ color: colors.primary }}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(index)}>
                    <Text style={{ color: '#ef4444' }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
              {item.title_designation && (
                <Text style={[styles.participantDetail, { color: colors.muted }]}>
                  {item.title_designation}
                </Text>
              )}
              {item.contact_no && (
                <Text style={[styles.participantDetail, { color: colors.muted }]}>
                  📞 {item.contact_no}
                </Text>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editIndex !== null ? 'Edit Participant' : 'Add Participant'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter name"
                placeholderTextColor={colors.muted}
                value={currentParticipant.name}
                onChangeText={(v) => updateField('name', v)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Title/Designation</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter title or designation"
                placeholderTextColor={colors.muted}
                value={currentParticipant.title_designation || ''}
                onChangeText={(v) => updateField('title_designation', v)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Complete Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Enter complete address"
                placeholderTextColor={colors.muted}
                value={currentParticipant.address || ''}
                onChangeText={(v) => updateField('address', v)}
                multiline
                numberOfLines={2}
              />

              <Text style={[styles.label, { color: colors.text }]}>Contact Number</Text>
              <PhoneInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholderTextColor={colors.muted}
                value={currentParticipant.contact_no || ''}
                onChangeText={(v) => updateField('contact_no', v)}
              />

              <Text style={[styles.label, { color: colors.text }]}>CNIC</Text>
              <CNICInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholderTextColor={colors.muted}
                value={currentParticipant.cnic || ''}
                onChangeText={(v) => updateField('cnic', v)}
              />

              <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.genderBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      currentParticipant.gender === g && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => updateField('gender', g)}
                  >
                    <Text style={{ color: currentParticipant.gender === g ? '#fff' : colors.text }}>
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalBtns}>
                <Pressable
                  style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    borderStyle: 'dashed',
  },
  emptyText: {
    textAlign: 'center',
  },
  participantCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  participantActions: {
    flexDirection: 'row',
    gap: 12,
  },
  participantDetail: {
    fontSize: 14,
    marginTop: 4,
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
    maxHeight: '90%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
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
    alignItems: 'center',
    borderWidth: 1,
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
