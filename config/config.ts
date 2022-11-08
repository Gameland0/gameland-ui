import type { TokenData } from 'apis/api'
import type { AirdropMetadata } from 'common/Airdrop'
import type { IconKey } from 'common/Socials'
import { WRAPPED_SOL_MINT } from 'hooks/usePaymentMints'
import type {
  DurationOption,
  RentalCardConfig,
} from 'rental-components/components/RentalIssueCard'

import type { UserTokenData } from '../hooks/useUserTokenData'

export const COLORS = {
  primary: '#907EFF',
  accent: '#7EFFE8',
  glow: '#CE81F4',
  'light-0': '#FFFFFF',
  'light-1': '#F5E2FF',
  'light-2': '#B1AFBB',
  'medium-3': '#8D8B9B',
  'medium-4': '#6D6C7C',
  'dark-5': '#0B0B0B',
  'dark-6': '#000000',
}

export type Colors = {
  accent: string
  glow: string
}

export type TokenFilter = {
  type: 'creators' | 'issuer' | 'state' | 'claimer' | 'owner'
  value: string[]
}

export interface TokenSection {
  id: string
  header?: string
  description?: string
  icon?:
    | 'time'
    | 'featured'
    | 'listed'
    | 'rented'
    | 'available'
    | 'info'
    | 'performance'
  filter?: TokenFilter
  tokens?: TokenData[] | UserTokenData[]
  showEmpty?: boolean
}

export type Badge = {
  badgeType: 'recent' | 'trending' | 'expiration'
  position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'
  content?: JSX.Element | string
}

export type ProjectConfig = {
  type: 'Collection' | 'Guild'
  hidden?: boolean
  indexDisabled?: boolean
  indexMetadataDisabled?: boolean
  issuedOnly?: boolean
  name: string
  displayName: string
  websiteUrl: string
  hero?: string
  description?: string
  hostname?: string
  twitterHandle?: string
  socialLinks?: {
    icon: IconKey
    link: string
  }[]
  disallowedMints?: string[]
  logoImage: string
  logoPadding?: boolean
  colors: Colors
  badges?: Badge[]
  disableListing?: boolean
  filter?: TokenFilter
  subFilters?: { label: string; filter: TokenFilter }[]
  attributeDisplay?: { displayName?: string; attributeName: string }[]
  sections?: TokenSection[]
  rentalCard: RentalCardConfig
  airdrops?: AirdropMetadata[]
  showUnknownInvalidators?: boolean
  marketplaceRate?: DurationOption
  allowOneByCreators?: {
    address: string
    enforceTwitter: boolean
    preventMultipleClaims: boolean
    disableReturn: boolean
  }[]
}

const defaultRentalCardConfig: RentalCardConfig = {
  invalidators: ['rate', 'duration', 'expiration', 'manual'],
  invalidationOptions: {
    visibilities: ['public', 'private'],
    durationOptions: ['hours', 'days', 'weeks'],
    invalidationTypes: ['reissue', 'return'],
    paymentMints: [WRAPPED_SOL_MINT],
    showClaimRentalReceipt: false,
    setClaimRentalReceipt: false,
    maxDurationAllowed: {
      displayText: '12 weeks',
      value: 7258000,
    },
  },
}

export const projectConfigs: { [key: string]: ProjectConfig } = {
  ratzclub: {
    name: 'ratzclub',
    displayName: 'Ratz Club',
    type: 'Collection',
    websiteUrl: 'https://www.ratzclub.com/',
    logoImage: '/logos/ratzclub.gif',
    hero: '/logos/ratzclub-hero.png',
    colors: {
      accent: '#000',
      glow: '#000',
    },
    description:
      'Ratz are more than just an avatar. They are a collection of 2,000 PFPs endowed with unique abilities. Each Ratz unlocks Vtuber Zilverk private club membership. Ratz are ready to conquer the underground world.',
    twitterHandle: '@ratz_club',
    socialLinks: [
      {
        icon: 'web',
        link: 'https://www.ratzclub.com/',
      },
      {
        icon: 'twitter',
        link: 'https://twitter.com/ratz_club',
      },
      {
        icon: 'discord',
        link: 'https://discord.gg/ratzclub',
      },
    ],
    filter: {
      type: 'creators',
      value: ['9L8nh1VxgyNP86XgCfuuUrZxB5UP4hD4JF27kkb6tFXR'],
    },
    rentalCard: defaultRentalCardConfig,
  },
  default: {
    name: 'default',
    displayName: 'Unverified',
    description:
      'This is an unverified collection. Feel free to use at your own risk, these NFTs may or may not be the real verified versions. Visit https://rent.cardinal.so and request to add a verified collection.',
    hidden: true,
    type: 'Collection',
    logoImage: 'logos/default.png',
    hero: 'logos/default-hero.png',
    websiteUrl: 'https://cardinal.so',
    colors: {
      accent: '#7560FF',
      glow: '#7560FF',
    },
    indexMetadataDisabled: true,
    rentalCard: {
      invalidators: ['rate', 'duration', 'expiration', 'manual'],
      extensionOptions: { showDisablePartialExtension: true },
      invalidationOptions: {
        maxDurationAllowed: {
          displayText: '12 weeks',
          value: 7258000,
        },
      },
    },
    airdrops: [
      {
        name: 'Origin Jambo',
        symbol: 'JAMB',
        uri: 'https://arweave.net/XBoDa9TqiOZeXW_6bV8wvieD8fMQS6IHxKipwdvduCo',
      },
      {
        name: 'Solana Monkey Business',
        symbol: 'SMB',
        uri: 'https://arweave.net/VjfB54_BbELJ5bc1kH-kddrXfq5noloSjkcvK2Odhh0',
      },
      {
        name: 'Degen Ape',
        symbol: 'DAPE',
        uri: 'https://arweave.net/mWra8rTxavmbCnqxs6KoWwa0gC9uM8NMeOsyVhDy0-E',
      },
      {
        name: 'Thugbirdz',
        symbol: 'THUG',
        uri: 'https://arweave.net/l9VXqVWCsiKW-R8ShX8jknFPgBibrhQI1JRgUI9uvbw',
      },
      {
        name: 'Turtles',
        symbol: 'TRTL',
        uri: 'https://arweave.net/KKbhlHaPMOB9yMm9yG_i7PxzK0y24I5C7gNTaRDI9OE',
      },
      {
        name: 'Almost Famous Pandas',
        symbol: 'AFP',
        uri: '8cs7hpBcuiRbzcdUY5BHpCFCgv1m8JhpZEVHUkYTmhnA',
      },
      {
        name: 'Shi Guardians',
        symbol: 'SHI',
        uri: 'https://arweave.net/hSI4WIsX10yRWnzgXP8oqwSCaSgPfGU5nSN-Pxjslao',
      },
      {
        name: 'Hacker House',
        symbol: 'HH',
        uri: 'https://arweave.net/DLDhnabWSXzAYktEhEKyukt3GIfagj2rPpWncw-KDQo',
      },
      {
        name: '21 Club',
        symbol: '21',
        uri: 'https://bafkreicv3jj6oc53kid76mkk7hqsr6edrnhsydkw4do4vonq777sgfz3le.ipfs.dweb.link?ext=json',
      },
    ],
  },
}
