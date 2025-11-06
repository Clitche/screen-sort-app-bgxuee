
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/commonStyles";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          Platform.OS !== 'ios' && styles.contentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.fill" size={48} color={colors.card} />
          </View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your screenshot organizer</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <IconSymbol name="photo.on.rectangle" size={24} color={colors.primary} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Screenshot Organizer</Text>
                <Text style={styles.cardDescription}>
                  Automatically organize your screenshots by app and date
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <IconSymbol name="square.and.arrow.up" size={24} color={colors.primary} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Share</Text>
                <Text style={styles.cardDescription}>
                  Share screenshots with other apps
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <IconSymbol name="camera.viewfinder" size={24} color={colors.accent} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Google Lens</Text>
                <Text style={styles.cardDescription}>
                  Search and identify objects in screenshots
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <IconSymbol name="trash" size={24} color="#ef4444" />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Delete</Text>
                <Text style={styles.cardDescription}>
                  Remove unwanted screenshots easily
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>
              1. Grant media library access to the app
            </Text>
            <Text style={styles.infoText}>
              2. The app scans your photos for screenshots
            </Text>
            <Text style={styles.infoText}>
              3. Screenshots are grouped by app and date
            </Text>
            <Text style={styles.infoText}>
              4. Tap on a group to expand and view screenshots
            </Text>
            <Text style={styles.infoText}>
              5. Use the action buttons to share, search, or delete
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentWithTabBar: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
});
