import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../src/store/themeStore';

type ContactItemProps = {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  onPress: () => void;
};

function ContactItem({ icon, title, subtitle, value, onPress }: ContactItemProps) {
  const { colors } = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.contactItem, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.contactSubtitle, { color: colors.muted }]}>{subtitle}</Text>
        <Text style={[styles.contactValue, { color: colors.primary }]}>{value}</Text>
      </View>
      <Text style={[styles.arrow, { color: colors.muted }]}>→</Text>
    </Pressable>
  );
}

export default function ContactSupportScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();

  const handleEmail = () => {
    Linking.openURL('mailto:iu.khan53@gmail.com?subject=Community Lead Engagement Support').catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/923013441991').catch(() => {
      Alert.alert('Error', 'Unable to open WhatsApp');
    });
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.iukhan.tech').catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Contact Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introIcon}>📞</Text>
          <Text style={[styles.introTitle, { color: colors.text }]}>Get in Touch</Text>
          <Text style={[styles.introSubtitle, { color: colors.muted }]}>
            We're here to help! Choose your preferred way to reach us.
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.contactList}>
          <ContactItem
            icon="📧"
            title="Email"
            subtitle="Send us an email"
            value="iu.khan53@gmail.com"
            onPress={handleEmail}
          />

          <ContactItem
            icon="💬"
            title="WhatsApp"
            subtitle="Chat with us on WhatsApp"
            value="+92 301 3441991"
            onPress={handleWhatsApp}
          />

          <ContactItem
            icon="🌐"
            title="Website"
            subtitle="Visit our website"
            value="www.iukhan.tech"
            onPress={handleWebsite}
          />
        </View>

        {/* Response Time */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Response Time</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            We typically respond within 24-48 hours during business days. For urgent matters, please use WhatsApp for faster response.
          </Text>
        </View>

        {/* Office Hours */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Office Hours</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Monday - Friday: 9:00 AM - 6:00 PM (PKT){'\n'}
            Saturday - Sunday: Closed
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  introIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
