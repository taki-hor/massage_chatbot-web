// Simple Massage Feature Types

/** 按摩模式 */
export type MassageMode = 'knead' | 'press' | 'vibrate';

/** 力度等級 */
export type Intensity = 'low' | 'medium' | 'high';

/** 表情狀態 */
export type Expression = 'comfortable' | 'normal' | 'slight-pain' | 'severe-pain';

/** 按摩狀態 */
export type MassageStatus = 'idle' | 'running' | 'paused';

/** 模式標籤 */
export const MODE_LABELS: Record<MassageMode, string> = {
  knead: '揉捏',
  press: '按壓',
  vibrate: '震動',
};

/** 模式描述 */
export const MODE_DESCRIPTIONS: Record<MassageMode, string> = {
  knead: '模擬手指揉捏動作，舒緩肌肉緊張',
  press: '定點按壓穴位，促進血液循環',
  vibrate: '高頻震動按摩，放鬆深層肌肉',
};

/** 力度標籤 */
export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: '小',
  medium: '中',
  high: '大',
};

/** 力度描述 */
export const INTENSITY_DESCRIPTIONS: Record<Intensity, string> = {
  low: '輕柔力度，適合敏感部位',
  medium: '適中力度，日常保健',
  high: '強力按摩，深層放鬆',
};

/** 表情標籤 */
export const EXPRESSION_LABELS: Record<Expression, string> = {
  'comfortable': '舒服',
  'normal': '一般',
  'slight-pain': '少痛',
  'severe-pain': '很痛',
};

/** 表情顏色 */
export const EXPRESSION_COLORS: Record<Expression, string> = {
  'comfortable': 'text-green-500',
  'normal': 'text-blue-500',
  'slight-pain': 'text-orange-500',
  'severe-pain': 'text-red-500',
};

/** 表情背景顏色 */
export const EXPRESSION_BG_COLORS: Record<Expression, string> = {
  'comfortable': 'bg-green-500/20 border-green-500/30',
  'normal': 'bg-blue-500/20 border-blue-500/30',
  'slight-pain': 'bg-orange-500/20 border-orange-500/30',
  'severe-pain': 'bg-red-500/20 border-red-500/30',
};

/** 按摩狀態接口 */
export interface MassageState {
  mode: MassageMode;
  intensity: Intensity;
  expression: Expression;
  status: MassageStatus;
  duration: number; // 已運行秒數
  sessionId: string | null;
}

/** 按摩配置 */
export interface MassageConfig {
  mode: MassageMode;
  intensity: Intensity;
  bodyPart: 'calf'; // 固定為小腿
}

/** 用戶反饋 */
export interface UserFeedback {
  expression: Expression;
  timestamp: number;
  note?: string;
}
