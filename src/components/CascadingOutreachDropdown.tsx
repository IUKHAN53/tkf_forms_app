import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../store/themeStore';
import { outreachSiteApi, OutreachSite } from '../api/outreachSites';

interface CascadingDropdownProps {
  onSelect: (values: {
    district: string;
    unionCouncil: string;
    fixSite: string;
    outreach: string;
  }) => void;
  showFixSite?: boolean;
}

interface DropdownItem {
  label: string;
  value: string;
}

export function CascadingOutreachDropdown({ onSelect, showFixSite = true }: CascadingDropdownProps) {
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(false);
  
  const [districts, setDistricts] = useState<DropdownItem[]>([]);
  const [unionCouncils, setUnionCouncils] = useState<DropdownItem[]>([]);
  const [fixSites, setFixSites] = useState<DropdownItem[]>([]);
  const [outreachSites, setOutreachSites] = useState<DropdownItem[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUC, setSelectedUC] = useState('');
  const [selectedFixSite, setSelectedFixSite] = useState('');
  const [selectedOutreach, setSelectedOutreach] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'district' | 'uc' | 'fixSite' | 'outreach' | 'new'>('district');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New outreach site form
  const [newSite, setNewSite] = useState<Partial<OutreachSite>>({});

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadUnionCouncils(selectedDistrict);
      setSelectedUC('');
      setSelectedFixSite('');
      setSelectedOutreach('');
      setUnionCouncils([]);
      setFixSites([]);
      setOutreachSites([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedUC) {
      loadFixSites(selectedDistrict, selectedUC);
      setSelectedFixSite('');
      setSelectedOutreach('');
      setFixSites([]);
      setOutreachSites([]);
    }
  }, [selectedUC]);

  useEffect(() => {
    if (selectedFixSite || (!showFixSite && selectedUC)) {
      loadOutreachSites(selectedDistrict, selectedUC, selectedFixSite);
      setSelectedOutreach('');
      setOutreachSites([]);
    }
  }, [selectedFixSite, selectedUC, showFixSite]);

  useEffect(() => {
    onSelect({
      district: selectedDistrict,
      unionCouncil: selectedUC,
      fixSite: selectedFixSite,
      outreach: selectedOutreach,
    });
  }, [selectedDistrict, selectedUC, selectedFixSite, selectedOutreach]);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const data = await outreachSiteApi.getDistricts();
      setDistricts(data.map((d: string) => ({ label: d, value: d })));
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnionCouncils = async (district: string) => {
    try {
      setLoading(true);
      const data = await outreachSiteApi.getUnionCouncils(district);
      setUnionCouncils(data.map((uc: string) => ({ label: uc, value: uc })));
    } catch (error) {
      console.error('Error loading union councils:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFixSites = async (district: string, uc: string) => {
    try {
      setLoading(true);
      const data = await outreachSiteApi.getFixSites(district, uc);
      setFixSites(data.map((fs: string) => ({ label: fs, value: fs })));
    } catch (error) {
      console.error('Error loading fix sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOutreachSites = async (district: string, uc: string, fixSite: string) => {
    try {
      setLoading(true);
      const data = await outreachSiteApi.getOutreachSites(district, uc, fixSite);
      setOutreachSites(data.map((os) => ({ label: os.outreach_site, value: os.outreach_site })));
    } catch (error) {
      console.error('Error loading outreach sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: typeof modalType) => {
    setModalType(type);
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleSelect = (value: string) => {
    switch (modalType) {
      case 'district':
        setSelectedDistrict(value);
        break;
      case 'uc':
        setSelectedUC(value);
        break;
      case 'fixSite':
        setSelectedFixSite(value);
        break;
      case 'outreach':
        setSelectedOutreach(value);
        break;
    }
    setModalVisible(false);
  };

  const getModalData = () => {
    let data: DropdownItem[] = [];
    let title = '';
    switch (modalType) {
      case 'district':
        data = districts;
        title = 'Select District';
        break;
      case 'uc':
        data = unionCouncils;
        title = 'Select Union Council';
        break;
      case 'fixSite':
        data = fixSites;
        title = 'Select Fix Site';
        break;
      case 'outreach':
        data = outreachSites;
        title = 'Select Outreach Site';
        break;
    }
    return { data, title };
  };

  const handleAddNewSite = async () => {
    try {
      setLoading(true);
      await outreachSiteApi.create({
        district: selectedDistrict,
        union_council: selectedUC,
        fix_site: selectedFixSite || newSite.fix_site || '',
        outreach_site: newSite.outreach_site || '',
        coordinates: null,
      });
      // Reload outreach sites
      await loadOutreachSites(selectedDistrict, selectedUC, selectedFixSite);
      setNewSite({});
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating outreach site:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = getModalData().data.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* District */}
      <Text style={[styles.label, { color: colors.text }]}>District *</Text>
      <Pressable
        style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openModal('district')}
      >
        <Text style={[styles.dropdownText, { color: selectedDistrict ? colors.text : colors.muted }]}>
          {selectedDistrict || 'Select District'}
        </Text>
      </Pressable>

      {/* Union Council */}
      <Text style={[styles.label, { color: colors.text }]}>Union Council *</Text>
      <Pressable
        style={[
          styles.dropdown,
          { backgroundColor: colors.card, borderColor: colors.border },
          !selectedDistrict && styles.disabled,
        ]}
        onPress={() => selectedDistrict && openModal('uc')}
        disabled={!selectedDistrict}
      >
        <Text style={[styles.dropdownText, { color: selectedUC ? colors.text : colors.muted }]}>
          {selectedUC || 'Select Union Council'}
        </Text>
      </Pressable>

      {/* Fix Site (optional) */}
      {showFixSite && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Fix Site *</Text>
          <Pressable
            style={[
              styles.dropdown,
              { backgroundColor: colors.card, borderColor: colors.border },
              !selectedUC && styles.disabled,
            ]}
            onPress={() => selectedUC && openModal('fixSite')}
            disabled={!selectedUC}
          >
            <Text style={[styles.dropdownText, { color: selectedFixSite ? colors.text : colors.muted }]}>
              {selectedFixSite || 'Select Fix Site'}
            </Text>
          </Pressable>
        </>
      )}

      {/* Outreach Site */}
      <Text style={[styles.label, { color: colors.text }]}>Outreach Site *</Text>
      <View style={styles.outreachRow}>
        <Pressable
          style={[
            styles.dropdown,
            styles.flex1,
            { backgroundColor: colors.card, borderColor: colors.border },
            (!selectedFixSite && showFixSite) || (!selectedUC && !showFixSite) ? styles.disabled : {},
          ]}
          onPress={() => (showFixSite ? selectedFixSite : selectedUC) && openModal('outreach')}
          disabled={showFixSite ? !selectedFixSite : !selectedUC}
        >
          <Text style={[styles.dropdownText, { color: selectedOutreach ? colors.text : colors.muted }]}>
            {selectedOutreach || 'Select Outreach Site'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setModalType('new');
            setModalVisible(true);
          }}
          disabled={!selectedUC}
        >
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Selection Modal */}
      <Modal visible={modalVisible && modalType !== 'new'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getModalData().title}</Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Search..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item, index) => item.value || `item-${index}`}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.modalItem, { borderColor: colors.border }]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[styles.modalItemText, { color: colors.text }]}>{item.label}</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.muted }]}>No items found</Text>
                }
              />
            )}
            <Pressable
              style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: colors.text }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* New Site Modal */}
      <Modal visible={modalVisible && modalType === 'new'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Outreach Site</Text>
            
            <Text style={[styles.label, { color: colors.text }]}>District: {selectedDistrict}</Text>
            <Text style={[styles.label, { color: colors.text }]}>Union Council: {selectedUC}</Text>
            
            {!showFixSite && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Fix Site</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter fix site name"
                  placeholderTextColor={colors.muted}
                  value={newSite.fix_site || ''}
                  onChangeText={(v) => setNewSite({ ...newSite, fix_site: v })}
                />
              </>
            )}
            
            <Text style={[styles.label, { color: colors.text }]}>Outreach Site Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter outreach site name"
              placeholderTextColor={colors.muted}
              value={newSite.outreach_site || ''}
              onChangeText={(v) => setNewSite({ ...newSite, outreach_site: v })}
            />
            
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddNewSite}
                disabled={!newSite.outreach_site}
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  dropdownText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  outreachRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  addBtn: {
    width: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  closeBtn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
