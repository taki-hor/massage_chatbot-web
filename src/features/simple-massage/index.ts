// Simple Massage Feature
// 簡約按摩控制模塊

export { SimpleMassagePage } from "./SimpleMassagePage"
export { useSimpleMassage } from "./hooks/useSimpleMassage"

// Components
export {
  ExpressionDisplay,
  ModeSelector,
  IntensityControl,
  FeedbackButtons,
  StatusDisplay,
} from "./components"

// Types
export type {
  MassageMode,
  Intensity,
  Expression,
  MassageStatus,
  MassageState,
  MassageConfig,
  UserFeedback,
} from "./types"

export {
  MODE_LABELS,
  MODE_DESCRIPTIONS,
  INTENSITY_LABELS,
  INTENSITY_DESCRIPTIONS,
  EXPRESSION_LABELS,
  EXPRESSION_COLORS,
  EXPRESSION_BG_COLORS,
} from "./types"
