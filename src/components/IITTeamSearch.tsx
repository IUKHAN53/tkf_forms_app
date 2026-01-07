import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { bridgingTheGapApi, SearchedParticipant, IITTeamMember } from '../api/coreForms';

interface IITTeamSearchProps {
  uc: string;
  selectedMembers: IITTeamMember[];
  onMembersChange: (members: IITTeamMember[]) => void;
}

// Extended type for display purposes
interface SelectedMemberDisplay extends IITTeamMember {
  name: string;
  contact_no: string;
  source_label: string;
}

export function IITTeamSearch({ uc, selectedMembers, onMembersChange }: IITTeamSearchProps) {
  const { colors } = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMembersDisplay, setSelectedMembersDisplay] = useState<SelectedMemberDisplay[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Perform the search
  const performSearch = async (query: string, ucValue: string) => {
    if (!ucValue) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const result = await bridgingTheGapApi.searchParticipants(ucValue, query || undefined);
      setSearchResults(result.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search when query or UC changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (uc) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery, uc);
      }, 500);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, uc]);

  const isSelected = (participantId: number): boolean => {
    return selectedMembers.some((m) => m.participant_id === participantId);
  };

  const toggleSelection = (participant: SearchedParticipant) => {
    if (isSelected(participant.id)) {
      // Remove from selection
      const updated = selectedMembers.filter((m) => m.participant_id !== participant.id);
      onMembersChange(updated);
      setSelectedMembersDisplay((prev) => prev.filter((m) => m.participant_id !== participant.id));
    } else {
      // Add to selection
      const newMember: IITTeamMember = {
        participant_id: participant.id,
        source_type: participant.source_type,
        source_id: participant.source_id,
      };
      onMembersChange([...selectedMembers, newMember]);
      setSelectedMembersDisplay((prev) => [
        ...prev,
        {
          ...newMember,
          name: participant.name,
          contact_no: participant.contact_no,
          source_label: participant.source_label,
        },
      ]);
    }
  };

  const removeSelectedMember = (participantId: number) => {
    const updated = selectedMembers.filter((m) => m.participant_id !== participantId);
    onMembersChange(updated);
    setSelectedMembersDisplay((prev) => prev.filter((m) => m.participant_id !== participantId));
  };

  return (
    <View>
      {/* Search Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Participants</Text>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Search by name or phone number to find participants from FGDs-Community and FGDs-Health Workers forms in the same UC.
      </Text>

      {!uc ? (
        <View style={[styles.warningCard, { backgroundColor: colors.card, borderColor: '#f59e0b' }]}>
          <Text style={[styles.warningText, { color: '#f59e0b' }]}>
            Please select a UC in the Attendance tab first to search for participants.
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Search by name or phone number..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : hasSearched && searchResults.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No participants found in {uc}. Try a different search term or make sure participants have been added via FGDs-Community or FGDs-Health Workers forms.
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={[styles.resultsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                Search Results ({searchResults.length})
              </Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => `search-${item.id}`}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const selected = isSelected(item.id);
                  return (
                    <Pressable
                      style={[
                        styles.resultItem,
                        { borderColor: colors.border },
                        selected && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                      ]}
                      onPress={() => toggleSelection(item)}
                    >
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.resultDetail, { color: colors.muted }]}>
                          {item.contact_no} • {item.occupation || item.designation || 'N/A'}
                        </Text>
                        <Text style={[styles.resultSource, { color: colors.primary }]}>
                          From: {item.source_label}
                        </Text>
                      </View>
                      <View style={[styles.checkbox, selected && { backgroundColor: colors.primary }]}>
                        {selected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>
          ) : null}
        </>
      )}

      {/* Selected Team Members Section */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        Selected Team Members ({selectedMembersDisplay.length})
      </Text>

      {selectedMembersDisplay.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            No team members selected yet. Search and select participants above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={selectedMembersDisplay}
          keyExtractor={(item) => `selected-${item.participant_id}`}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.selectedInfo}>
                <Text style={[styles.selectedNumber, { color: colors.primary }]}>{index + 1}</Text>
                <View style={styles.selectedDetails}>
                  <Text style={[styles.selectedName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.selectedDetail, { color: colors.muted }]}>
                    {item.contact_no} • {item.source_label}
                  </Text>
                </View>
              </View>
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeSelectedMember(item.participant_id)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  warningCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  resultSource: {
    fontSize: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 24,
  },
  selectedDetails: {
    flex: 1,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
