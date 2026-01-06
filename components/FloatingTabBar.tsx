
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { useAppTheme } from '@/contexts/ThemeContext';

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
  containerWidth = screenWidth * 0.85,
  borderRadius = 28,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTheme } = useAppTheme();
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
        damping: 25,
        stiffness: 150,
        mass: 0.8,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: Href) => {
    router.push(route);
  };

  const tabWidthPercent = ((100 / tabs.length) - 2).toFixed(2);

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
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? 16
        }
      ]}>
        <View style={[styles.outerGlow, { borderRadius }]}>
          <LinearGradient
            colors={[
              currentTheme.colors.primary + '20',
              currentTheme.colors.secondary + '20'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBorder, { borderRadius }]}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 90 : 80}
              style={[styles.blurContainer, { borderRadius: borderRadius - 2 }]}
            >
              <View style={[
                styles.background,
                {
                  backgroundColor: currentTheme.colors.surface + 'D9',
                }
              ]} />
              
              {/* Animated Indicator with Gradient */}
              <Animated.View style={[styles.indicatorWrapper, indicatorStyle]}>
                <LinearGradient
                  colors={[
                    currentTheme.colors.primary + '30',
                    currentTheme.colors.secondary + '30'
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.indicator,
                    { 
                      width: `${tabWidthPercent}%` as `${number}%`,
                      borderColor: currentTheme.colors.primary + '50'
                    }
                  ]}
                />
              </Animated.View>

              <View style={styles.tabsContainer}>
                {tabs.map((tab, index) => {
                  const isActive = activeTabIndex === index;

                  return (
                    <React.Fragment key={index}>
                      <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleTabPress(tab.route)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.tabContent}>
                          {/* Icon with gradient background when active */}
                          {isActive ? (
                            <View style={styles.activeIconContainer}>
                              <LinearGradient
                                colors={[
                                  currentTheme.colors.primary + '30',
                                  currentTheme.colors.secondary + '30'
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.activeIconGradient}
                              >
                                <IconSymbol
                                  android_material_icon_name={tab.icon}
                                  ios_icon_name={tab.icon}
                                  size={26}
                                  color={currentTheme.colors.primary}
                                />
                              </LinearGradient>
                            </View>
                          ) : (
                            <IconSymbol
                              android_material_icon_name={tab.icon}
                              ios_icon_name={tab.icon}
                              size={24}
                              color={currentTheme.colors.textSecondary}
                            />
                          )}
                          <Text
                            style={[
                              styles.tabLabel,
                              { color: currentTheme.colors.textSecondary },
                              isActive && { 
                                color: currentTheme.colors.primary, 
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {tab.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            </BlurView>
          </LinearGradient>
        </View>
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
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  outerGlow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  gradientBorder: {
    padding: 2,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  indicatorWrapper: {
    position: 'absolute',
    top: 6,
    left: 8,
    bottom: 6,
  },
  indicator: {
    height: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeIconContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeIconGradient: {
    padding: 8,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
