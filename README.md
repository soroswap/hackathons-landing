# hackathons.soroswap.finance

Landing page for hackers building on Soroswap: API key, testnet setup, SDK, REST API,
router contract, use cases and gotchas. Vite + vanilla TypeScript, no framework.

```bash
pnpm install
pnpm dev      # local dev server
pnpm build    # type-check + build to dist/
```

Deploy `dist/` to any static host (Vercel: framework preset "Vite").

## Where things live

- `index.html`: all prose. Elements with `data-snippet`, `data-net-field`, `data-net-link`
  and `data-show="testnet|mainnet"` are filled or toggled by `src/main.ts`.
- `src/networks.ts`: per-network addresses and values. Router and factory come from
  `soroswap/core` `public/{network}.contracts.json`, tokens from `public/tokens.json`.
  Check them against `GET https://api.soroswap.finance/api/{network}/router` after a testnet reset.
- `src/snippets.ts`: every code sample, as a function of the selected network.
- `src/useCases.ts`: the "What can you build?" cards.
