import { API_BASE, type NetworkConfig } from './networks'

export type SnippetId =
  | 'install'
  | 'sdkSetup'
  | 'sdkSwap'
  | 'sdkPayExact'
  | 'sdkRead'
  | 'sdkLiquidity'
  | 'apiQuote'
  | 'apiBuild'
  | 'apiSend'
  | 'apiRead'
  | 'apiAddresses'
  | 'walletSign'
  | 'contractClient'
  | 'contractSwap'
  | 'faucet'
  | 'skill'

export interface Snippet {
  lang: string
  code: string
}

function sdkProtocols(net: NetworkConfig): string {
  return net.protocols.map((p: string) => `SupportedProtocols.${p.toUpperCase()}`).join(', ')
}

function jsonProtocols(net: NetworkConfig): string {
  return net.protocols.map((p: string) => `"${p}"`).join(', ')
}

const SNIPPETS: Record<SnippetId, (net: NetworkConfig) => Snippet> = {
  install: () => ({
    lang: 'bash',
    code: `pnpm add @soroswap/sdk @stellar/stellar-sdk
# Node 22+. Keep the key server-side:
echo "SOROSWAP_API_KEY=sk_..." >> .env`,
  }),

  skill: () => ({
    lang: 'bash',
    code: `# Teach Claude Code / Cursor / Codex how to use the SDK
npx skills add soroswap/sdk`,
  }),

  faucet: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `# 1. Fund a new testnet account with XLM
curl "https://friendbot.stellar.org?addr=G...YOUR_ADDRESS"

# 2. Mint Soroswap test tokens (or use faucet.soroswap.finance)
curl -X POST "${API_BASE}/api/faucet?address=G...YOUR_ADDRESS&contract=${net.id === 'testnet' ? net.usdc : 'TESTNET_TOKEN_CONTRACT'}"

# 3. Full testnet token list
curl "${API_BASE}/api/tokens"`,
  }),

  sdkSetup: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `import { SoroswapSDK, SupportedNetworks } from "@soroswap/sdk";

export const sdk = new SoroswapSDK({
  apiKey: process.env.SOROSWAP_API_KEY as string, // sk_...
  defaultNetwork: SupportedNetworks.${net.sdkEnum},
});`,
  }),

  sdkSwap: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `import { SupportedProtocols, TradeType } from "@soroswap/sdk";
import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { sdk } from "./sdk";

const XLM = "${net.xlm}";
const USDC = "${net.usdc}";

// 1. Quote: 10 XLM -> USDC. Amounts are bigint, 7 decimals.
const quote = await sdk.quote({
  assetIn: XLM,
  assetOut: USDC,
  amount: 100_000_000n,
  tradeType: TradeType.EXACT_IN,
  protocols: [${sdkProtocols(net)}],
  slippageBps: 50, // 0.5%
});

// 2. Build an unsigned transaction
const signer = Keypair.fromSecret(process.env.STELLAR_SECRET as string);
const { xdr } = await sdk.build({ quote, from: signer.publicKey() });

// 3. Sign it (here with a keypair; in a dApp the user's wallet signs)
const tx = TransactionBuilder.fromXDR(xdr, Networks.${net.stellarEnum});
tx.sign(signer);

// 4. Submit
const result = await sdk.send(tx.toXDR());
console.log(result.success, result.txHash);`,
  }),

  sdkPayExact: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `// Merchant must receive exactly 25 USDC; payer spends whatever XLM that costs.
const quote = await sdk.quote({
  assetIn: "${net.xlm}",  // XLM
  assetOut: "${net.usdc}", // USDC
  amount: 250_000_000n,  // 25 USDC out
  tradeType: TradeType.EXACT_OUT,
  protocols: [${sdkProtocols(net)}],
  slippageBps: 100,
});

const { xdr } = await sdk.build({
  quote,
  from: payerAddress,    // signs and pays
  to: merchantAddress,   // receives the USDC
});`,
  }),

  sdkRead: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `import { SupportedNetworks, SupportedProtocols } from "@soroswap/sdk";

// Prices (one or many tokens)
const prices = await sdk.getPrice(["${net.xlm}", "${net.usdc}"]);

// Every token a wallet holds
const { balances } = await sdk.getBalances("G...WALLET");

// Pools: network is a required argument here
const pools = await sdk.getPools(SupportedNetworks.${net.sdkEnum}, [SupportedProtocols.SOROSWAP]);

// Contract addresses, resolved live from the API
const router = await sdk.getContractAddress(SupportedNetworks.${net.sdkEnum}, "router");`,
  }),

  sdkLiquidity: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `// Creates the pool if it does not exist yet, otherwise adds to it.
const res = await sdk.addLiquidity({
  assetA: "${net.xlm}",
  assetB: "${net.usdc}",
  amountA: 100_000_000n,
  amountB: 30_000_000n,  // must match the pool ratio
  to: "G...WALLET",
  slippageBps: "100",    // string here, number on quotes
});
// res.type: "create_pool" | "add_liquidity", res.xdr: sign and sdk.send()

const positions = await sdk.getUserPositions("G...WALLET");`,
  }),

  apiQuote: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `curl -X POST "${API_BASE}/quote?network=${net.id}" \\
  -H "Authorization: Bearer $SOROSWAP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "assetIn":  "${net.xlm}",
    "assetOut": "${net.usdc}",
    "amount": "100000000",
    "tradeType": "EXACT_IN",
    "protocols": [${jsonProtocols(net)}],
    "slippageBps": 50
  }' > quote.json`,
  }),

  apiBuild: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `# Pass the whole quote back, plus who signs
curl -X POST "${API_BASE}/quote/build?network=${net.id}" \\
  -H "Authorization: Bearer $SOROSWAP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "{\\"quote\\": $(cat quote.json), \\"from\\": \\"G...YOUR_ADDRESS\\"}"
# -> { "xdr": "AAAA..." }  unsigned, sign it with a wallet or keypair`,
  }),

  apiSend: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `curl -X POST "${API_BASE}/send?network=${net.id}" \\
  -H "Authorization: Bearer $SOROSWAP_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "xdr": "SIGNED_XDR" }'
# -> { "txHash", "success", "result": { "type": "swap", "amountIn", "amountOut" }, ... }`,
  }),

  apiRead: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `H="Authorization: Bearer $SOROSWAP_API_KEY"

curl -H "$H" "${API_BASE}/price?network=${net.id}&asset=${net.xlm}"
curl -H "$H" "${API_BASE}/balances/G...WALLET?network=${net.id}"
curl -H "$H" "${API_BASE}/pools?network=${net.id}&protocol=soroswap"
curl -H "$H" "${API_BASE}/protocols?network=${net.id}"`,
  }),

  apiAddresses: (net: NetworkConfig) => ({
    lang: 'bash',
    code: `# No key needed. Use this instead of hardcoding: testnet resets.
curl "${API_BASE}/api/${net.id}/router"
# {"address":"${net.router}"}
curl "${API_BASE}/api/${net.id}/factory"`,
  }),

  walletSign: (net: NetworkConfig) => ({
    lang: 'ts',
    code: `// Browser: your backend returns the XDR from /quote/build,
// the user signs with Freighter (or any Stellar Wallets Kit wallet)
import { signTransaction } from "@stellar/freighter-api";

const { signedTxXdr } = await signTransaction(xdr, {
  networkPassphrase: "${net.passphrase}",
  address: userAddress,
});

// Send it back to your backend, which calls sdk.send(signedTxXdr)
await fetch("/api/send", { method: "POST", body: JSON.stringify({ signedTxXdr }) });`,
  }),

  contractClient: () => ({
    lang: 'rust',
    code: `use soroban_sdk::{contractclient, Address, Env, Vec};

// Only the router functions you call; signatures match soroswap/core.
#[contractclient(name = "SoroswapRouterClient")]
pub trait SoroswapRouter {
    fn swap_exact_tokens_for_tokens(
        e: Env, amount_in: i128, amount_out_min: i128,
        path: Vec<Address>, to: Address, deadline: u64,
    ) -> Vec<i128>;
    fn router_get_amounts_out(e: Env, amount_in: i128, path: Vec<Address>) -> Vec<i128>;
    fn router_pair_for(e: Env, token_a: Address, token_b: Address) -> Address;
}`,
  }),

  contractSwap: (net: NetworkConfig) => ({
    lang: 'rust',
    code: `use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    vec, Address, Env, IntoVal, Symbol, Vec,
};

// Router on ${net.label.toLowerCase()}: ${net.router}
pub fn swap_held_tokens(e: &Env, router: &Address, path: Vec<Address>, amount_in: i128, min_out: i128) -> i128 {
    let client = SoroswapRouterClient::new(e, router);
    let me = e.current_contract_address();
    let token_in = path.get(0).unwrap();
    let pair = client.router_pair_for(&token_in, &path.get(1).unwrap());

    // The router pulls amount_in from \`to\` (this contract) into the first pair,
    // so this contract pre-authorizes exactly that token transfer.
    e.authorize_as_current_contract(vec![
        e,
        InvokerContractAuthEntry::Contract(SubContractInvocation {
            context: ContractContext {
                contract: token_in,
                fn_name: Symbol::new(e, "transfer"),
                args: (me.clone(), pair, amount_in).into_val(e),
            },
            sub_invocations: vec![e],
        }),
    ]);

    let deadline = e.ledger().timestamp() + 300;
    let amounts = client.swap_exact_tokens_for_tokens(&amount_in, &min_out, &path, &me, &deadline);
    amounts.last().unwrap()
}`,
  }),
}

export function getSnippet(id: SnippetId, net: NetworkConfig): Snippet {
  return SNIPPETS[id](net)
}

export function isSnippetId(value: string): value is SnippetId {
  return value in SNIPPETS
}
