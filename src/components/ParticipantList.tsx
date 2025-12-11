import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Modal } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { Participant } from '../api/coreForms';

interface ParticipantListProps {
  participants: Participant[];
  onChange: (participants: Participant[]) => void;
}

const emptyParticipant: Participant = {
  name: '',
  title_designation: '',
  occupation: '',
  address: '',
  contact_no: '',
  cnic: '',
  gender: '',
};

export function ParticipantList({ participants, onChange }: ParticipantListProps) {
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant>(emptyParticipant);

  const openAddModal = () => {
    setCurrentParticipant({ ...emptyParticipant, sr_no: participants.length + 1 });
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
    // Re-number sr_no
    newParticipants.forEach((p, i) => {
      p.sr_no = i + 1;
    });
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
          keyExtractor={(_, index) => index.toString()}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={[styles.participantCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.participantHeader}>
                <Text style={[styles.participantName, { color: colors.text }]}>
                  {item.sr_no}. {item.name}
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editIndex !== null ? 'Edit Participant' : 'Add Participant'}
            </Text>

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
              placeholder="e.g., Imam, Teacher, Doctor"
              placeholderTextColor={colors.muted}
              value={currentParticipant.title_designation || ''}
              onChangeText={(v) => updateField('title_designation', v)}
            />

            <Text style={[styles.label, { color: colors.text }]}>Occupation</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter occupation"
              placeholderTextColor={colors.muted}
              value={currentParticipant.occupation || ''}
              onChangeText={(v) => updateField('occupation', v)}
            />

            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter address"
              placeholderTextColor={colors.muted}
              value={currentParticipant.address || ''}
              onChangeText={(v) => updateField('address', v)}
            />

            <Text style={[styles.label, { color: colors.text }]}>Contact No.</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter contact number"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={currentParticipant.contact_no || ''}
              onChangeText={(v) => updateField('contact_no', v)}
            />

            <Text style={[styles.label, { color: colors.text }]}>CNIC</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="XXXXX-XXXXXXX-X"
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
          </View>
        </View>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
