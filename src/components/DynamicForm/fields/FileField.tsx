import React, { useState } from 'react';
import { Pressable, Text, View, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureCanvas from 'react-native-signature-canvas';
import { useThemeColors } from '../../../store/themeStore';

interface Props {
  value?: any;
  onChange?: (value: any) => void;
  label: string;
  name: string;
  mode?: 'image' | 'signature';
}

export const FileField: React.FC<Props> = ({ value, onChange, mode = 'image' }) => {
  const [showPad, setShowPad] = useState(false);
  const { colors } = useThemeColors();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      const asset = result.assets[0];
      onChange?.({ uri: asset.uri, name: asset.fileName ?? 'upload.jpg', type: asset.mimeType ?? 'image/jpeg' });
    }
  };

  const onSignature = (dataUrl: string) => {
    onChange?.({ uri: dataUrl, name: 'signature.png', type: 'image/png' });
    setShowPad(false);
  };

  return (
    <View style={styles.container}>
      {value?.uri ? (
        <Image source={{ uri: value.uri }} style={styles.preview} />
      ) : null}
      {mode === 'signature' ? (
        <View style={styles.signatureContainer}>
          {showPad ? (
            <View style={[styles.signaturePad, { borderColor: colors.border }]}>
              <SignatureCanvas
                onOK={onSignature}
                onEmpty={() => setShowPad(false)}
                webStyle=".m-signature-pad--footer {display: none;}"
                descriptionText="Sign"
                clearText="Reset"
                confirmText="Save"
                backgroundColor="#ffffff"
              />
            </View>
          ) : null}
          <Pressable
            onPress={() => setShowPad((prev) => !prev)}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>
              {showPad ? 'Close signature pad' : 'Open signature pad'}
            </Text>
          </Pressable>
          <Pressable
            onPress={pick}
            style={[styles.button, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Upload signature image
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          style={[styles.button, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {value ? 'Replace file' : 'Choose file'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  signatureContainer: {
    gap: 10,
  },
  signaturePad: {
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
