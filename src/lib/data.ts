// Type definitions for all data entities

export interface Account {
  id: string
  name: string
  segment: string
  segmentId: string
  volume: number       // kg/month
  price: number        // €/kg current net-net
  floors: Record<string, number>   // €/kg segment floor per product
  targets: Record<string, number>  // €/kg segment target per product
  region: string
}

export interface Product {
  id: string
  name: string
  family: string
  listPrice: number    // €/kg
  escalationThresholds: {
    rep: number        // % discount that triggers rep escalation
    manager: number    // % discount that triggers manager escalation
    director: number   // % discount that triggers director escalation
  }
}

export interface SegmentationPoint {
  id: string
  accountId: string
  accountName: string
  productId: string
  volume: number
  price: number
  segment: string
  zone: 'green' | 'amber' | 'red'
}

export type WaterfallSection = 'price' | 'cogs' | 'sga'

export interface WaterfallItem {
  accountId: string
  productId: string
  layers: {
    name: string
    value: number           // negative = deduction; 0 = subtotal marker
    cumulative: number
    isHighlighted?: boolean
    isSubtotal?: boolean    // draws as ground-up solid bar (subtotal milestone)
    section?: WaterfallSection
  }[]
}

export interface PVMData {
  accountId: string
  priorRevenue: number
  volumeEffect: number
  priceEffect: number
  mixEffect: number
  currentRevenue: number
  products: {
    productId: string
    productName: string
    priorRevenue: number
    volumeEffect: number
    priceEffect: number
    mixEffect: number
    currentRevenue: number
    delta: number
  }[]
}

export interface WinLossData {
  productId: string
  curve: { price: number; winRate: number }[]
  cliffMin: number
  cliffMax: number
  optimalPrice: number
  historicalQuotes: {
    price: number
    won: boolean
  }[]
}

export interface EoRData {
  accountId: string
  compositeScore: number
  dimensions: {
    name: string
    score: number
    driverNote: string
  }[]
}

export interface ChatScenario {
  id: string
  matchPhrases: string[]
  accountId: string | null
  productId: string | null
  response: string
  visualType: 'scatter' | 'waterfall' | 'pvm' | 'winLoss' | 'eor' | 'table' | null
  dataKey: string | null
  suggestedAction: string | null
  tableData?: Record<string, string | number>[]
}

// Import helpers — all data loaded synchronously from JSON
import accountsData from '../../data/accounts.json'
import productsData from '../../data/products.json'
import segmentationData from '../../data/segmentation.json'
import waterfallData from '../../data/waterfall.json'
import pvmData from '../../data/pvm.json'
import winLossData from '../../data/win-loss.json'
import eorData from '../../data/ease-of-realization.json'
import chatScenariosData from '../../data/chat-scenarios.json'

export const accounts: Account[] = accountsData as Account[]
export const products: Product[] = productsData as Product[]
export const segmentationPoints: SegmentationPoint[] = segmentationData as SegmentationPoint[]
export const waterfallItems: WaterfallItem[] = waterfallData as WaterfallItem[]
export const pvmDataset: PVMData[] = pvmData as PVMData[]
export const winLossDataset: WinLossData[] = winLossData as WinLossData[]
export const eorDataset: EoRData[] = eorData as EoRData[]
export const chatScenarios: ChatScenario[] = chatScenariosData as ChatScenario[]

// Filter helpers
export function getAccount(id: string | null): Account | undefined {
  return accounts.find(a => a.id === id)
}

export function getProduct(id: string | null): Product | undefined {
  return products.find(p => p.id === id)
}

export function getSegmentationForProduct(productId: string): SegmentationPoint[] {
  return segmentationPoints.filter(p => p.productId === productId)
}

export function getWaterfallForAccount(accountId: string, productId: string): WaterfallItem | undefined {
  return waterfallItems.find(w => w.accountId === accountId && w.productId === productId)
}

export function getPVMForAccount(accountId: string): PVMData | undefined {
  return pvmDataset.find(p => p.accountId === accountId)
}

export function getWinLossForProduct(productId: string): WinLossData | undefined {
  return winLossDataset.find(w => w.productId === productId)
}

export function getEoRForAccount(accountId: string): EoRData | undefined {
  return eorDataset.find(e => e.accountId === accountId)
}

export function getFloor(account: Account, productId: string): number {
  return account.floors[productId] ?? account.floors['milk-couverture'] ?? 4.57
}

export function getTarget(account: Account, productId: string): number {
  return account.targets[productId] ?? account.targets['milk-couverture'] ?? 4.85
}
