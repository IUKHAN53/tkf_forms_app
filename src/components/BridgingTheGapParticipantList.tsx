import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { BridgingTheGapParticipant } from '../api/coreForms';
import { PhoneInput } from './PhoneInput';

interface BridgingTheGapParticipantListProps {
  participants: BridgingTheGapParticipant[];
  onChange: (participants: BridgingTheGapParticipant[]) => void;
}

const emptyParticipant: BridgingTheGapParticipant = {
  name: '',
  occupation: '',
  contact_no: '',
};

export function BridgingTheGapParticipantList({ participants, onChange }: BridgingTheGapParticipantListProps) {
  const { colors } = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<BridgingTheGapParticipant>(emptyParticipant);

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

  const closeModal = () => {
    setModalVisible(false);
    setCurrentParticipant(emptyParticipant);
    setEditIndex(null);
  };

  const saveParticipant = () => {
    if (!currentParticipant.name.trim() || !currentParticipant.occupation.trim() || !currentParticipant.contact_no.trim()) {
      return;
    }

    if (editIndex !== null) {
      const updated = [...participants];
      updated[editIndex] = currentParticipant;
      onChange(updated);
    } else {
      onChange([...participants, { ...currentParticipant, sr_no: participants.length + 1 }]);
    }
    closeModal();
  };

  const deleteParticipant = (index: number) => {
    const updated = participants.filter((_, i) => i !== index);
    // Renumber sr_no
    const renumbered = updated.map((p, i) => ({ ...p, sr_no: i + 1 }));
    onChange(renumbered);
  };

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Participants ({participants.length})</Text>
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAddModal}>
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
                  {item.sr_no}. {item.name}
                </Text>
                <View style={styles.participantActions}>
                  <Pressable onPress={() => openEditModal(index)}>
                    <Text style={{ color: colors.primary }}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => deleteParticipant(index)}>
                    <Text style={{ color: '#ef4444', marginLeft: 12 }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={[styles.participantDetail, { color: colors.muted }]}>
                Occupation: {item.occupation}
              </Text>
              <Text style={[styles.participantDetail, { color: colors.muted }]}>
                Contact: {item.contact_no}
              </Text>
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
                value={currentParticipant.name}
                onChangeText={(text) => setCurrentParticipant({ ...currentParticipant, name: text })}
                placeholder="Enter name"
                placeholderTextColor={colors.muted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Occupation *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={currentParticipant.occupation}
                onChangeText={(text) => setCurrentParticipant({ ...currentParticipant, occupation: text })}
                placeholder="Enter occupation"
                placeholderTextColor={colors.muted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Contact Number *</Text>
              <PhoneInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={currentParticipant.contact_no}
                onChangeText={(text) => setCurrentParticipant({ ...currentParticipant, contact_no: text })}
                placeholderTextColor={colors.muted}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.card }]} onPress={closeModal}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={saveParticipant}
                disabled={!currentParticipant.name.trim() || !currentParticipant.occupation.trim() || !currentParticipant.contact_no.trim()}
              >
                <Text style={{ color: '#fff' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  participantCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  participantActions: {
    flexDirection: 'row',
  },
  participantDetail: {
    fontSize: 13,
    marginTop: 2,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
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
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
