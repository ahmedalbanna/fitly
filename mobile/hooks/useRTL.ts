import { useLanguageStore } from '../store/useLanguageStore';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

/**
 * Returns RTL-aware style helpers and the isRTL flag.
 *
 * Usage:
 *   const { isRTL, rtlRow, rtlText, rtlPadding } = useRTL();
 */
export function useRTL() {
  const isRTL = useLanguageStore((s) => s.isRTL);

  /** Flex row — reversed for RTL */
  const rtlRow: ViewStyle = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };

  /** Text alignment */
  const rtlText: TextStyle = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };

  /** Center-aligned text (unchanged by RTL but useful override) */
  const centerText: TextStyle = { textAlign: 'center' };

  /**
   * RTL-aware horizontal padding:
   * paddingStart = left in LTR, right in RTL
   * paddingEnd   = right in LTR, left in RTL
   */
  const rtlPadding = (start: number, end: number): ViewStyle => ({
    paddingStart: start,
    paddingEnd: end,
  });

  /** RTL-aware margin */
  const rtlMargin = (start: number, end: number): ViewStyle => ({
    marginStart: start,
    marginEnd: end,
  });

  /** Flip icon/arrow for RTL — returns '→' in LTR and '←' in RTL */
  const rtlArrow = isRTL ? '←' : '→';

  /** Align items to start (left in LTR, right in RTL) */
  const alignStart: ViewStyle = { alignItems: isRTL ? 'flex-end' : 'flex-start' };

  /** Self-align to end (right in LTR, left in RTL) */
  const selfEnd: ViewStyle = { alignSelf: isRTL ? 'flex-start' : 'flex-end' };

  return {
    isRTL,
    rtlRow,
    rtlText,
    centerText,
    rtlPadding,
    rtlMargin,
    rtlArrow,
    alignStart,
    selfEnd,
  };
}
