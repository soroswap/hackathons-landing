export type NetworkId = 'testnet' | 'mainnet'

export interface NetworkConfig {
  id: NetworkId
  label: string
  /** Enum member name in @soroswap/sdk's SupportedNetworks. */
  sdkEnum: 'TESTNET' | 'MAINNET'
  /** Static member name in @stellar/stellar-sdk's Networks. */
  stellarEnum: 'TESTNET' | 'PUBLIC'
  passphrase: string
  router: string
  factory: string
  xlm: string
  usdc: string
  /** Protocols the API can route through on this network. */
  protocols: string[]
  explorer: string
}

// Addresses come from soroswap/core public/{network}.contracts.json and public/tokens.json,
// the same files the API serves. Testnet resets, so the page tells hackers to resolve them
// at runtime through GET /api/{network}/{contract} instead of hardcoding.
export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  testnet: {
    id: 'testnet',
    label: 'Testnet',
    sdkEnum: 'TESTNET',
    stellarEnum: 'TESTNET',
    passphrase: 'Test SDF Network ; September 2015',
    router: 'CCJUD55AG6W5HAI5LRVNKAE5WDP5XGZBUDS5WNTIVDU7O264UZZE7BRD',
    factory: 'CDP3HMUH6SMS3S7NPGNDJLULCOXXEPSHY4JKUKMBNQMATHDHWXRRJTBY',
    xlm: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    usdc: 'CB3TLW74NBIOT3BUWOZ3TUM6RFDF6A4GVIRUQRQZABG5KPOUL4JJOV2F',
    // Testnet quotes come straight from Soroswap pairs; there is no SDEX or aggregator path.
    protocols: ['soroswap'],
    explorer: 'https://stellar.expert/explorer/testnet',
  },
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    sdkEnum: 'MAINNET',
    stellarEnum: 'PUBLIC',
    passphrase: 'Public Global Stellar Network ; September 2015',
    router: 'CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH',
    factory: 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2',
    xlm: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
    usdc: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
    protocols: ['soroswap', 'aqua', 'phoenix', 'comet', 'sushi', 'sdex'],
    explorer: 'https://stellar.expert/explorer/public',
  },
}

export const API_BASE = 'https://api.soroswap.finance'
