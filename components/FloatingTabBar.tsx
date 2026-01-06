
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth * 0.9,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, colors } = useAppTheme();
  const animatedValue = useSharedValue(0);

  // Improved active tab detection
  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route as string)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      } else if (tab.route.includes('/(tabs)/') && pathname.includes(tab.route.split('/(tabs)/')[1])) {
        score = 40;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 120,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: Href) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  const tabWidthPercent = ((100 / tabs.length) - 1).toFixed(2);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 16) / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { width: containerWidth, marginBottom: bottomMargin ?? spacing.md }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 70}
          style={[styles.blurContainer, { borderRadius: borderRadius.xl }]}
        >
          <View style={[
            styles.background,
            { 
              backgroundColor: isDark ? colors.surface + 'F0' : colors.surface + 'F5',
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: colors.border,
            }
          ]} />
          
          {/* Animated Indicator */}
          <Animated.View style={[styles.indicatorWrapper, indicatorStyle]}>
            <View style={[
              styles.indicator,
              { 
                width: `${tabWidthPercent}%` as `${number}%`,
                backgroundColor: colors.accent + '15',
              }
            ]} />
          </Animated.View>

          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <Pressable
                  key={`tab-${index}`}
                  style={({ pressed }) => [
                    styles.tab,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleTabPress(tab.route)}
                >
                  <View style={styles.tabContent}>
                    <IconSymbol
                      android_material_icon_name={tab.icon}
                      ios_icon_name={tab.icon}
                      size={isActive ? 24 : 22}
                      color={isActive ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: isActive ? colors.accent : colors.textSecondary },
                        isActive && { fontWeight: '600' },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: spacing.lg,
    alignSelf: 'center',
    ...shadows.lg,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  indicatorWrapper: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    bottom: spacing.xs,
  },
  indicator: {
    height: '100%',
    borderRadius: borderRadius.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabLabel: {
    ...typography.micro,
  },
});
