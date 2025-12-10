import React, { useState } from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureCanvas from 'react-native-signature-canvas';

interface Props {
  value?: any;
  onChange?: (value: any) => void;
  label: string;
  name: string;
  mode?: 'image' | 'signature';
}

export const FileField: React.FC<Props> = ({ value, onChange, mode = 'image' }) => {
  const [showPad, setShowPad] = useState(false);

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
    <View className="space-y-2">
      {value?.uri ? <Image source={{ uri: value.uri }} style={{ width: '100%', height: 180, borderRadius: 12 }} /> : null}
      {mode === 'signature' ? (
        <View className="space-y-2">
          {showPad ? (
            <View style={{ height: 240 }} className="rounded-xl overflow-hidden border border-slate-800">
              <SignatureCanvas
                onOK={onSignature}
                onEmpty={() => setShowPad(false)}
                webStyle=".m-signature-pad--footer {display: none;}"
                descriptionText="Sign"
                clearText="Reset"
                confirmText="Save"
              />
            </View>
          ) : null}
          <Pressable onPress={() => setShowPad((prev) => !prev)} className="px-4 py-2 bg-primary rounded-lg items-center">
            <Text className="text-white font-semibold">{showPad ? 'Close signature pad' : 'Open signature pad'}</Text>
          </Pressable>
          <Pressable onPress={pick} className="px-4 py-2 bg-slate-800 rounded-lg items-center border border-slate-700">
            <Text className="text-white font-semibold">Upload signature image</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={pick} className="px-4 py-2 bg-primary rounded-lg items-center">
          <Text className="text-white font-semibold">{value ? 'Replace file' : 'Choose file'}</Text>
        </Pressable>
      )}
    </View>
  );
};
