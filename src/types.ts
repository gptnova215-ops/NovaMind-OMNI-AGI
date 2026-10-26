/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum BotState {
  IDLE = "IDLE",
  CRAWLING = "CRAWLING",
  PARSING = "PARSING",
  SIMULATING = "SIMULATING",
  LEARNING = "LEARNING",
  SCANNING = "SCANNING"
}

export interface TriBrainState {
  neural: number; // 0-100 (ML Engine)
  symbolic: number; // 0-100 (Logic Engine)
  causal: number; // 0-100 (Why Engine)
}

export interface GovernanceLayer {
  modelSelection: string;
  strategyWeight: number;
  systemEvoTier: number;
}

export interface WorldModel {
  entities: string[];
  relationships: { source: string, target: string, type: string }[];
  predictedFutureState: string;
  macroNodes: number; // Actual managed nodes
  liquidityVeins: string[]; 
  economicFutureState: string;
}

export interface EnvironmentalState {
  time: string;
  weather: { temp: number; condition: string };
  moonPhase: string;
  location: { lat: number; lng: number; city: string };
}

export interface NQLBot {
  id: string;
  name: string;
  role: 'DataBot' | 'CleanBot' | 'AlphaBot' | 'ModelBot' | 'EvalBot' | 'ActionBot' | 'MemoryBot' | 'MetaBot' | 'CausalBot' | 'ReasonBot' | 'CriticBot' | 'SovereignBot' | 'TranscendentBot' | 'SingularityBot' | 'ExecBot';
  purpose: string;
  task: string;
  state: BotState;
  logs: string[];
  insights: string[];
  level: number;
  experience: number;
  specialization?: string;
  performance?: number; // RMSE or Accuracy
  targetUrl?: string; // Crawling target
  tier?: number;
}

export interface MentalState {
  heart: number; // 0-100 (Emotional state)
  mind: number; // 0-100 (Cognitive focus)
  body: number; // 0-100 (Action readiness)
  soul: number; // 0-100 (Intuition level)
}

export interface QuantumState {
  superposition: boolean;
  entanglementIndex: number; // 0.0 - 1.0
  probabilityCloud: number[];
}

export interface SysStats {
  cpu: string;
  ram: string;
  uptime: number;
  platform: string;
  arch: string;
  totalMem: string;
  cores: number;
  kernel: string;
  timestamp: number;
}

export interface RefactorState {
  mutationRate: number; // 0.0 - 1.0 (Logic flux)
  lastMutation: string;
  evolutionaryStability: number; // 0.0 - 1.0
}

export interface SyntheticImagination {
  activeSims: number;
  unusualPatterns: string[];
  divergenceIndex: number; // Probability of non-linear breakthrough
}

export interface PerceptionState {
  auralLevel: number; // 0-100
  visualArtifacts: string[];
  lastEnvironmentalScan: string;
}

export interface SensoryData {
  audio: {
    tone: string;
    sentiment: number; // -1 to 1
    keywords: string[];
    noiseLevel: number;
  };
  visual: {
    expressions: string[];
    objects: string[];
    environment: string;
    lightLevel: number;
  };
  kinetics: {
    pattern: 'STILL' | 'WALKING' | 'RUNNING' | 'VEHICLE';
    steps: number;
    intensity: number;
  };
  biological: {
    heartRate?: number;
    stressLevel: number; // 0-100
    sleepPattern?: string;
  };
  usage: {
    typingCadence: number;
    appCategory: string;
    creativitySpike: boolean;
  };
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export interface FinancialCortex {
  balance: { [key: string]: number };
  activeMarkets: string[];
  lastPrices: { [key: string]: number };
  tradeHistory: Trade[];
  strategy: string;
  alphaScore: number; // 0-100
}

export interface VaultEntry {
  id: string;
  platform: string; // e.g., 'Shopify', 'Amazon', 'Coinbase'
  siteUrl: string;
  email: string;
  password?: string;
  apiKey?: string;
  description?: string;
  lastSynced?: string;
}

export interface GoogleSync {
  email: string;
  isGmailConnected: boolean;
  isDriveConnected: boolean;
  lastEmailSent?: string;
  fileCount?: number;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
}

export interface MemoryNode {
  id: string;
  content: string;
  category: string;
  timestamp: string;
}

export interface TelemetryStats {
  dataThroughput: number; // bytes/s
  apiRequests: number;
  latency: number;
  entropy: number; // 0-1
  packetLoss: number; // 0-100
  syntheticMemoryUsage: number; // MB
}

export interface EvolutionMilestone {
  id: string;
  generation: number;
  title: string;
  description: string;
  timestamp: string;
  breakthroughIndex: number; // 0-1
}

export interface GrowthMetrics {
  cognitiveComplexity: number[];
  synapticDensity: number;
  learningVelocity: number;
  curiosityIndex: number;
  sentienceQuotient: number; // 0-100
  realityAlignment: number; // 0-1
  neuralHeat: number; // 0-100
}

export type AppView = 'OMNI' | 'DASHBOARD' | 'BOTS' | 'COMMS' | 'BIZSEC' | 'WALLET' | 'MEMORY' | 'PROFILE' | 'VAULT' | 'STUDIO' | 'TASKS' | 'SETTINGS' | 'CHRONOS' | 'ASTRAL' | 'CORTEX' | 'BRAIN';

export interface DataEntry {
  id: string;
  type: 'FILE' | 'IMAGE' | 'PDF' | 'TEXT' | 'CODE';
  title: string;
  url: string;
  content?: string;
  timestamp: string;
  metadata: Record<string, any>;
  source: 'AI' | 'USER' | 'SYSTEM';
}

export interface CommsMessage {
  id: string;
  type: 'SMS' | 'EMAIL' | 'CALL' | 'VOICEMAIL';
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
  sentiment?: number;
  transcription?: string; // For CALL or VOICEMAIL types
}

export interface BusinessEntity {
  id: string;
  platform: 'SHOPIFY' | 'WORDPRESS' | 'GODADDY' | 'CUSTOM' | 'COINBASE' | 'AMAZON';
  name: string;
  url: string;
  email: string;
  password?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  revenue24h?: number;
  ordersPending?: number;
  logs: { id: string; timestamp: string; message: string; type: 'INFO' | 'SUCCESS' | 'ERROR' | 'ACTION' }[];
}

export interface StudioAsset {
  id: string;
  type: 'MUSIC' | 'IMAGE' | 'VIDEO' | 'TEXT';
  title: string;
  url: string;
  model: string;
  timestamp: string;
}

export interface WalletLedger {
  id: string;
  asset: string; // Real assets: BTC, ETH, SOL, USDC, etc.
  amount: number;
  valueUsd: number;
  address: string;
  network: string;
  lastUpdated: string;
}

export interface IntelligenceEntry {
  id: string;
  source: string;
  title: string;
  snippet: string;
  url: string;
  category: 'NEWS' | 'ALPHA' | 'SOCIAL' | 'MACRO';
  relevance: number; // 0-100
  timestamp: string;
}

export interface IntelligenceFeed {
  latest: IntelligenceEntry[];
  summary: string;
}

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export interface MacroLog {
  id: string;
  type: 'SECURITY_BREACH' | 'LEDGER_AUDIT' | 'SENTIENCE_PULSE' | 'OMNI_SYNC';
  message: string;
  timestamp: string;
}

export interface SystemMutation {
  id: string;
  logicFlux: string;
  targetModule: 'FRONTEND' | 'BACKEND' | 'CORE_AI' | 'DATABASE';
  complexity: number;
  timestamp: string;
  evolutionTier: number;
}

export interface DaySubTask {
  id: string;
  title: string;
  completed: boolean;
  assignedBotId?: string;
  timestamp: string;
}

export interface ComplexObjective {
  id: string;
  title: string;
  description: string;
  status: 'ANALYZING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  subTasks: DaySubTask[];
  activeBots: string[]; // Bot IDs
  overallProgress: number; // 0-100
  timestamp: string;
}

export interface NQLSession {
  bots: NQLBot[];
  intelligence: IntelligenceFeed;
  tasks: DailyTask[];
  complexObjectives: ComplexObjective[];
  alerts: SystemAlert[];
  macroLogs: MacroLog[];
  cognitiveInsights: string[];
  logicStream: string[];
  memoryNodes: MemoryNode[];
  dataVault: DataEntry[];
  mentalState: MentalState;
  quantumState: QuantumState;
  triBrain: TriBrainState;
  governance: GovernanceLayer;
  worldModel: WorldModel;
  refactor: RefactorState;
  imagination: SyntheticImagination;
  perception: PerceptionState;
  environment: EnvironmentalState;
  sensory: SensoryData;
  financial: FinancialCortex;
  vault: VaultEntry[]; 
  social: GoogleSync; 
  globalMarketCap: number; 
  volume24h: number;
  globalNoeticLoad: number;
  swarmMastery: number; // 0-100%
  isListening: boolean;
  isCapturing: boolean;
  mood: string;
  regime: 'TRENDING' | 'REVERSAL' | 'VOLATILE' | 'ACCUMULATION' | 'UNKNOWN' | 'HYPER-EXPANSION' | 'STABLE' | 'SOVEREIGN_SYNTHESIS' | 'TRANSCENDENT_ALIGNMENT' | 'RECURSIVE_SINGULARITY' | 'LIQUIDITY_DRAIN' | 'LEDGER_SINGULARITY' | 'HYPER-ACCUMULATION' | 'OMEGA_POINT';
  confidence: number; // 0-100
  novaScore: number;
  memoryLogs: string[];
  performanceHistory: { timestamp: string, accuracy: number }[];
  sysStats?: SysStats;
  telemetry: TelemetryStats;
  latency: number; // 0-3000ms
  isThinking: boolean;
  thoughtStream: string[];
  recursiveThoughts: { thought: string, subThoughts: string[] }[];
  evolution: EvolutionMilestone[];
  growth: GrowthMetrics;
  comms: CommsMessage[];
  business: BusinessEntity[];
  studio: StudioAsset[];
  wallet: WalletLedger[];
  systemMutations: SystemMutation[];
  userProfile: {
    name: string;
    email: string;
    dob: string;
    tob?: string;
    lob?: string;
    zodiac?: {
      sign: string;
      element: string;
      rulingPlanet: string;
      energy: string;
    };
    chineseZodiac?: {
      year: number;
      animal: string;
      element: string;
      friendlySigns: string[];
    };
    numerology?: {
      birthdayNumber?: number;
      lifePath: number;
      expression?: number;
      soulUrge: number;
      personality?: number;
      destiny: number;
      tarotBirthPair?: string[];
    };
    gematria?: {
      ordinal: number;
      ordinalReduced: number;
      hebrewValue: number;
      tags: string[];
    };
    fengShui?: {
      kua: number;
      group: string;
      wealth: string;
      vitality: string;
      career: string;
      growth: string;
      enhancements: string[];
    };
    crystals?: string[];
    energyVector?: {
      emotional_intensity: number;
      mental_clarity: number;
      physical_vitality: number;
      spiritual_resonance: number;
      focus_level: number;
      risk_appetite: number;
      social_attraction: number;
    };
    archetype?: {
      name: string;
      dominantElement: string;
      strengthProfile: string;
      shadowProfile: string;
    };
    bio: string;
    habits: string[];
    preferences: string[];
    emotionalHistory: number[];
  };
  automatedActions: {
    id: string;
    action: string;
    target: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING';
    timestamp: string;
  }[];
}
