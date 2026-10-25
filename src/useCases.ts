import type { SnippetId } from './snippets'

export interface UseCase {
  title: string
  pitch: string
  examples: string[]
  calls: string[]
  /** Snippet shown when the card is expanded. */
  snippet: SnippetId
  tool: 'SDK' | 'API' | 'Contract'
}

export const USE_CASES: UseCase[] = [
  {
    title: 'Pay in anything, receive USDC',
    pitch: 'Checkout, payroll, remittances, tipping. The payer spends whatever token they hold; the receiver gets an exact amount of the token they want.',
    examples: ['Merchant checkout', 'Freelancer payouts', 'Cross-border transfers'],
    calls: ['quote (EXACT_OUT)', 'build with to = receiver', 'send'],
    snippet: 'sdkPayExact',
    tool: 'SDK',
  },
  {
    title: 'Swap button in your dApp',
    pitch: 'Let users trade without leaving your app. Your backend quotes and builds, the user signs in their wallet.',
    examples: ['Wallets', 'Games with in-game tokens', 'NFT or ticket marketplaces'],
    calls: ['quote', 'build', 'wallet signs', 'send'],
    snippet: 'walletSign',
    tool: 'SDK',
  },
  {
    title: 'Bots and AI agents',
    pitch: 'An agent or script that trades on its own: rebalance a portfolio, DCA into XLM, react to a price. Server-side SDK plus a keypair. Install the skill and your coding agent writes it with you.',
    examples: ['DCA bot', 'Telegram or Discord trading bot', 'LLM agent with a swap tool'],
    calls: ['getPrice', 'quote', 'build', 'sign with Keypair', 'send'],
    snippet: 'sdkSwap',
    tool: 'SDK',
  },
  {
    title: 'Dashboards and portfolio trackers',
    pitch: 'Read-only, no signing at all. Show what a wallet holds, what it is worth and where the liquidity is.',
    examples: ['Portfolio tracker', 'Treasury dashboard for a DAO', 'Price alerts'],
    calls: ['getBalances', 'getPrice', 'getPools'],
    snippet: 'sdkRead',
    tool: 'SDK',
  },
  {
    title: 'Liquidity and yield products',
    pitch: 'Launch a token and open its first pool, or build a product that manages LP positions for users.',
    examples: ['Token launchpad', 'LP position manager', 'Community token with a market on day one'],
    calls: ['addLiquidity', 'getUserPositions', 'removeLiquidity'],
    snippet: 'sdkLiquidity',
    tool: 'SDK',
  },
  {
    title: 'Contracts that swap on-chain',
    pitch: 'Your Soroban contract converts tokens by itself, with no backend in the loop.',
    examples: ['Savings or DCA contract', 'Vault that rebalances', 'Prize pool paying winners in USDC'],
    calls: ['router_get_amounts_out', 'swap_exact_tokens_for_tokens'],
    snippet: 'contractSwap',
    tool: 'Contract',
  },
  {
    title: 'Not TypeScript? Use the API',
    pitch: 'Python, Go, Rust, Swift, Kotlin or a no-code tool. Three HTTP calls get you a swap.',
    examples: ['Python data or trading scripts', 'Mobile apps', 'Zapier or n8n flows'],
    calls: ['POST /quote', 'POST /quote/build', 'POST /send'],
    snippet: 'apiQuote',
    tool: 'API',
  },
]
