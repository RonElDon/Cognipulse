// Central map from exercise ID → unique game component
import { SpotlightFocus, NumberHunt, ColorSwitch, SustainedWatch, DividedAttention, DistractorShield, FlashDetect, FocusMarathon } from './AttentionGames';
import { MemoryMatch, SequenceRecall, WordList, NBackChallenge, PositionMemory, ColorSequenceSimon, StoryRecall, FaceName, TaskSwitch, StopSignal, StroopChallenge, RuleShift } from './MemoryExecutiveGames';
import { DotConnect, TargetTap, SpatialRotation, GridNavigator, SymbolMatch, QuickSort, ReactionTimer, DecisionDash, NumberCompare, TrueFalseBlitz, PatternMaster, NumberSequences, LogicPuzzles, MatrixReasoning, AnalogyTrain, CategorySort, SyllogismSprint, DeductionGame } from './ProcessingReasoningGames';
import { WordFluency, SynonymFind, AnagramSolver, WordChain, OddWordOut, DefinitionMatch, VerbalMemory, MentalMath, NumberMemory, EstimationGame, MathBlitz, MissingNumber, FractionFight, MathPatterns, SpeedArithmetic } from './LanguageMathGames';

const GAME_MAP = {
  // Attention (8 unique)
  att_1: SpotlightFocus,
  att_2: NumberHunt,
  att_3: ColorSwitch,
  att_4: SustainedWatch,
  att_5: DividedAttention,
  att_6: DistractorShield,
  att_7: FlashDetect,
  att_8: FocusMarathon,

  // Memory (8 unique)
  mem_1: MemoryMatch,
  mem_2: SequenceRecall,
  mem_3: WordList,
  mem_4: NBackChallenge,
  mem_5: PositionMemory,
  mem_6: ColorSequenceSimon,
  mem_7: StoryRecall,
  mem_8: FaceName,

  // Executive Functions (8 unique)
  exe_1: TaskSwitch,
  exe_2: StopSignal,
  exe_3: StroopChallenge,
  exe_4: RuleShift,
  exe_5: TaskSwitch,    // harder variant via level
  exe_6: StopSignal,    // harder variant via level
  exe_7: StroopChallenge,// harder variant via level
  exe_8: RuleShift,     // harder variant via level

  // Visuomotor (8 unique)
  vis_1: DotConnect,
  vis_2: TargetTap,
  vis_3: SpatialRotation,
  vis_4: GridNavigator,
  vis_5: DotConnect,     // variant
  vis_6: SpatialRotation,// variant
  vis_7: GridNavigator,  // variant
  vis_8: TargetTap,      // variant

  // Processing Speed (8 unique)
  pro_1: SymbolMatch,
  pro_2: QuickSort,
  pro_3: ReactionTimer,
  pro_4: DecisionDash,
  pro_5: NumberCompare,
  pro_6: TrueFalseBlitz,
  pro_7: ReactionTimer,  // variant
  pro_8: SymbolMatch,    // variant

  // Reasoning (8 unique)
  rea_1: PatternMaster,
  rea_2: NumberSequences,
  rea_3: LogicPuzzles,
  rea_4: MatrixReasoning,
  rea_5: AnalogyTrain,
  rea_6: CategorySort,
  rea_7: DeductionGame,
  rea_8: SyllogismSprint,

  // Language (8 unique)
  lan_1: WordFluency,
  lan_2: SynonymFind,
  lan_3: AnagramSolver,
  lan_4: WordChain,
  lan_5: OddWordOut,     // sentence complete → odd word
  lan_6: OddWordOut,
  lan_7: DefinitionMatch,
  lan_8: VerbalMemory,

  // Math (8 unique)
  mat_1: MentalMath,
  mat_2: NumberMemory,
  mat_3: EstimationGame,
  mat_4: MathBlitz,
  mat_5: MissingNumber,
  mat_6: FractionFight,
  mat_7: MathPatterns,
  mat_8: SpeedArithmetic,
};

export default GAME_MAP;