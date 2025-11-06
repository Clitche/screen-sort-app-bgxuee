
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { 
  ScrollView, 
  Pressable, 
  StyleSheet, 
  View, 
  Text, 
  Alert, 
  Platform,
  Image,
  Linking,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { colors } from "@/styles/commonStyles";

interface Screenshot {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  width: number;
  height: number;
}

interface GroupedScreenshots {
  [appName: string]: Screenshot[];
}

export default function HomeScreen() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [screenshots, setScreenshots] = useState<GroupedScreenshots>({});
  const [loading, setLoading] = useState(false);
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadScreenshots();
  }, [permissionResponse]);

  const loadScreenshots = async () => {
    if (permissionResponse?.status !== 'granted') {
      return;
    }

    setLoading(true);
    try {
      // Get all photos from the device
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        sortBy: ['creationTime'],
        first: 1000, // Load first 1000 photos
      });

      // Filter for screenshots and group by app
      const grouped: GroupedScreenshots = {};
      
      for (const asset of media.assets) {
        // Get detailed info to check if it's a screenshot
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        
        // Check if the asset is a screenshot based on mediaSubtypes
        const isScreenshot = assetInfo.mediaSubtypes?.includes('screenshot');
        
        if (isScreenshot) {
          // Extract app name from filename (this is a simplified approach)
          // In reality, we can't reliably get the app name from metadata
          // So we'll use a placeholder approach based on filename patterns
          const appName = extractAppName(assetInfo.filename);
          
          if (!grouped[appName]) {
            grouped[appName] = [];
          }
          
          grouped[appName].push({
            id: asset.id,
            uri: asset.uri,
            filename: assetInfo.filename,
            creationTime: asset.creationTime,
            width: asset.width,
            height: asset.height,
          });
        }
      }

      setScreenshots(grouped);
    } catch (error) {
      console.error('Error loading screenshots:', error);
      Alert.alert('Error', 'Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const extractAppName = (filename: string): string => {
    // This is a simplified approach - in reality, we can't reliably determine
    // which app a screenshot was taken in from the filename alone
    // We'll group by date patterns or use "Screenshots" as default
    
    if (filename.toLowerCase().includes('whatsapp')) return 'WhatsApp';
    if (filename.toLowerCase().includes('instagram')) return 'Instagram';
    if (filename.toLowerCase().includes('twitter') || filename.toLowerCase().includes('x_')) return 'Twitter/X';
    if (filename.toLowerCase().includes('facebook')) return 'Facebook';
    if (filename.toLowerCase().includes('chrome') || filename.toLowerCase().includes('browser')) return 'Browser';
    if (filename.toLowerCase().includes('game')) return 'Games';
    
    // Default grouping by date
    const date = new Date(filename.match(/\d{8}/)?.[0] || Date.now());
    return `Screenshots ${date.toLocaleDateString()}`;
  };

  const handleShare = async (screenshot: Screenshot) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(screenshot.uri, {
        dialogTitle: 'Share Screenshot',
      });
    } catch (error) {
      console.error('Error sharing screenshot:', error);
      Alert.alert('Error', 'Failed to share screenshot');
    }
  };

  const handleDelete = async (screenshot: Screenshot, appName: string) => {
    Alert.alert(
      'Delete Screenshot',
      'Are you sure you want to delete this screenshot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await MediaLibrary.deleteAssetsAsync([screenshot.id]);
              
              // Update local state
              setScreenshots(prev => {
                const updated = { ...prev };
                updated[appName] = updated[appName].filter(s => s.id !== screenshot.id);
                if (updated[appName].length === 0) {
                  delete updated[appName];
                }
                return updated;
              });
              
              Alert.alert('Success', 'Screenshot deleted');
            } catch (error) {
              console.error('Error deleting screenshot:', error);
              Alert.alert('Error', 'Failed to delete screenshot');
            }
          },
        },
      ]
    );
  };

  const handleGoogleLens = async (screenshot: Screenshot) => {
    try {
      // Google Lens deep link format
      // Note: This may not work on all devices/platforms
      const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(screenshot.uri)}`;
      
      const canOpen = await Linking.canOpenURL(googleLensUrl);
      if (canOpen) {
        await Linking.openURL(googleLensUrl);
      } else {
        // Fallback to Google app or web search
        Alert.alert(
          'Google Lens',
          'Google Lens is not available. Would you like to open Google Images search instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Google',
              onPress: () => Linking.openURL('https://images.google.com/'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening Google Lens:', error);
      Alert.alert('Error', 'Failed to open Google Lens');
    }
  };

  const toggleAppExpansion = (appName: string) => {
    setExpandedApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appName)) {
        newSet.delete(appName);
      } else {
        newSet.add(appName);
      }
      return newSet;
    });
  };

  const requestPermissions = async () => {
    const result = await requestPermission();
    if (result.granted) {
      loadScreenshots();
    }
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={loadScreenshots}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="arrow.clockwise" color={colors.primary} />
    </Pressable>
  );

  if (!permissionResponse) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permissionResponse.status !== 'granted') {
    return (
      <>
        {Platform.OS === 'ios' && (
          <Stack.Screen
            options={{
              title: "Screenshot Organizer",
              headerRight: renderHeaderRight,
            }}
          />
        )}
        <View style={styles.container}>
          <IconSymbol name="photo.on.rectangle" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Media Library Access Required</Text>
          <Text style={styles.permissionText}>
            This app needs access to your photos to organize your screenshots.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const appNames = Object.keys(screenshots).sort();

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Screenshot Organizer",
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading screenshots...</Text>
          </View>
        ) : appNames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="photo.on.rectangle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Screenshots Found</Text>
            <Text style={styles.emptyText}>
              Take some screenshots and they will appear here, organized by app.
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headerText}>
              Found {appNames.reduce((sum, app) => sum + screenshots[app].length, 0)} screenshots in {appNames.length} groups
            </Text>
            
            {appNames.map(appName => {
              const appScreenshots = screenshots[appName];
              const isExpanded = expandedApps.has(appName);
              
              return (
                <View key={appName} style={styles.appGroup}>
                  <Pressable 
                    style={styles.appHeader}
                    onPress={() => toggleAppExpansion(appName)}
                  >
                    <View style={styles.appHeaderLeft}>
                      <IconSymbol 
                        name={isExpanded ? "chevron.down" : "chevron.right"} 
                        size={20} 
                        color={colors.text} 
                      />
                      <Text style={styles.appName}>{appName}</Text>
                      <View style={styles.countBadge}>
                        <Text style={styles.countText}>{appScreenshots.length}</Text>
                      </View>
                    </View>
                  </Pressable>
                  
                  {isExpanded && (
                    <View style={styles.screenshotsGrid}>
                      {appScreenshots.map(screenshot => (
                        <View key={screenshot.id} style={styles.screenshotCard}>
                          <Image 
                            source={{ uri: screenshot.uri }} 
                            style={styles.screenshotImage}
                            resizeMode="cover"
                          />
                          <View style={styles.screenshotActions}>
                            <Pressable 
                              style={[styles.actionButton, styles.shareButton]}
                              onPress={() => handleShare(screenshot)}
                            >
                              <IconSymbol name="square.and.arrow.up" size={18} color={colors.card} />
                            </Pressable>
                            
                            <Pressable 
                              style={[styles.actionButton, styles.lensButton]}
                              onPress={() => handleGoogleLens(screenshot)}
                            >
                              <IconSymbol name="camera.viewfinder" size={18} color={colors.card} />
                            </Pressable>
                            
                            <Pressable 
                              style={[styles.actionButton, styles.deleteButton]}
                              onPress={() => handleDelete(screenshot, appName)}
                            >
                              <IconSymbol name="trash" size={18} color={colors.card} />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </>
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
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButtonContainer: {
    padding: 6,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
    elevation: 4,
  },
  permissionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  headerText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  appGroup: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
    overflow: 'hidden',
  },
  appHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  screenshotsGrid: {
    padding: 12,
    paddingTop: 0,
    gap: 12,
  },
  screenshotCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.highlight,
    position: 'relative',
  },
  screenshotImage: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: colors.highlight,
  },
  screenshotActions: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  lensButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
});
