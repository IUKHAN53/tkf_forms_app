import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../src/store/themeStore';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I submit a form?',
    answer: 'Navigate to Core Forms or Dynamic Forms from the home screen, select the form you want to fill, complete all required fields, and tap the Submit button at the bottom.',
  },
  {
    question: 'What happens if I lose internet connection?',
    answer: 'Your submissions are automatically saved to an offline queue. Once your internet connection is restored, they will be synced automatically to the server.',
  },
  {
    question: 'How do I check my pending submissions?',
    answer: 'Go to Settings > Sync & Data section to see the number of pending submissions waiting to be synced.',
  },
  {
    question: 'Can I edit a submitted form?',
    answer: 'Currently, submitted forms cannot be edited. Please ensure all information is correct before submitting.',
  },
  {
    question: 'How do I change my password?',
    answer: 'Go to Settings > Account > Change Password to update your password.',
  },
  {
    question: 'Why is my GPS location not working?',
    answer: 'Ensure location permissions are enabled for the app. Go to your device settings > Apps > Community Led Engagement > Permissions > Location and enable it.',
  },
  {
    question: 'How do I switch between light and dark mode?',
    answer: 'Go to Settings > Appearance and toggle the Dark Mode switch.',
  },
  {
    question: 'How can I contact support?',
    answer: 'Go to Settings > Support > Contact Support to find email, WhatsApp, and website contact options.',
  },
];

type AccordionItemProps = {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
};

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.accordionItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable onPress={onToggle} style={styles.accordionHeader}>
        <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
        <Text style={[styles.chevron, { color: colors.primary }]}>{isOpen ? '−' : '+'}</Text>
      </Pressable>
      {isOpen && (
        <View style={[styles.answerContainer, { borderTopColor: colors.border }]}>
          <Text style={[styles.answer, { color: colors.muted }]}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function HelpFAQScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introIcon}>❓</Text>
          <Text style={[styles.introTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          <Text style={[styles.introSubtitle, { color: colors.muted }]}>
            Find answers to common questions about using the app
          </Text>
        </View>

        {/* FAQ List */}
        <View style={styles.faqList}>
          {FAQ_DATA.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => toggleAccordion(index)}
            />
          ))}
        </View>

        {/* Still need help? */}
        <View style={[styles.helpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.helpIcon}>💬</Text>
          <Text style={[styles.helpTitle, { color: colors.text }]}>Still need help?</Text>
          <Text style={[styles.helpText, { color: colors.muted }]}>
            Can't find what you're looking for? Contact our support team for assistance.
          </Text>
          <Pressable
            onPress={() => router.push('/(app)/contact-support')}
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </Pressable>
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
  },
  faqList: {
    gap: 12,
  },
  accordionItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    paddingRight: 12,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  answer: {
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
  },
  helpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  helpIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
