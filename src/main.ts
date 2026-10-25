import './style.css'
import { NETWORKS, type NetworkConfig, type NetworkId } from './networks'
import { getSnippet, isSnippetId, type SnippetId } from './snippets'
import { USE_CASES, type UseCase } from './useCases'

const STORAGE_KEY = 'soroswap-hackathons-network'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function readStoredNetwork(): NetworkId {
  // Storage can throw in private windows; testnet is the right default for a hackathon anyway.
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'mainnet' ? 'mainnet' : 'testnet'
  } catch {
    return 'testnet'
  }
}

function storeNetwork(id: NetworkId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Remembering the choice is a convenience only.
  }
}

async function copyText(text: string, button: HTMLElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    button.dataset.copied = 'true'
    setTimeout(() => delete button.dataset.copied, 1200)
  } catch {
    button.dataset.copied = 'false'
  }
}

function renderSnippet(container: HTMLElement, id: SnippetId, net: NetworkConfig): void {
  const { lang, code } = getSnippet(id, net)
  container.className = 'snippet'
  container.innerHTML = `
    <div class="snippet-bar"><span>${lang}</span><button type="button" class="copy-btn">Copy</button></div>
    <pre><code>${escapeHtml(code)}</code></pre>`
  const button = container.querySelector<HTMLButtonElement>('.copy-btn')
  button?.addEventListener('click', () => void copyText(code, button))
}

function renderSnippets(net: NetworkConfig): void {
  document.querySelectorAll<HTMLElement>('[data-snippet]').forEach((el: HTMLElement) => {
    const id = el.dataset.snippet ?? ''
    if (isSnippetId(id)) renderSnippet(el, id, net)
  })
}

function renderFields(net: NetworkConfig): void {
  document.querySelectorAll<HTMLElement>('[data-net-field]').forEach((el: HTMLElement) => {
    const key = el.dataset.netField as keyof NetworkConfig
    const value = net[key]
    el.textContent = Array.isArray(value) ? value.join(', ') : String(value)
  })
  document.querySelectorAll<HTMLAnchorElement>('[data-net-link]').forEach((el: HTMLAnchorElement) => {
    const key = el.dataset.netLink as keyof NetworkConfig
    el.href = String(net[key])
  })
}

function renderVisibility(net: NetworkConfig): void {
  document.querySelectorAll<HTMLElement>('[data-show]').forEach((el: HTMLElement) => {
    el.hidden = el.dataset.show !== net.id
  })
  document.querySelectorAll<HTMLButtonElement>('[data-net-btn]').forEach((btn: HTMLButtonElement) => {
    btn.setAttribute('aria-checked', String(btn.dataset.netBtn === net.id))
  })
  document.body.dataset.network = net.id
}

function useCaseCard(useCase: UseCase, index: number): string {
  const calls = useCase.calls.map((c: string) => `<code>${escapeHtml(c)}</code>`).join('<span class="arrow">→</span>')
  const examples = useCase.examples.map((e: string) => `<li>${escapeHtml(e)}</li>`).join('')
  return `
    <article class="card">
      <span class="tag tag-${useCase.tool.toLowerCase()}">${useCase.tool}</span>
      <h3>${escapeHtml(useCase.title)}</h3>
      <p>${escapeHtml(useCase.pitch)}</p>
      <ul class="examples">${examples}</ul>
      <div class="calls">${calls}</div>
      <details>
        <summary>Show code</summary>
        <div data-snippet="${useCase.snippet}" id="uc-${index}"></div>
      </details>
    </article>`
}

function renderUseCases(): void {
  const host = document.getElementById('use-case-cards')
  if (host) host.innerHTML = USE_CASES.map(useCaseCard).join('')
}

function applyNetwork(id: NetworkId): void {
  const net = NETWORKS[id]
  renderFields(net)
  renderSnippets(net)
  renderVisibility(net)
  storeNetwork(id)
}

function bindToggle(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-net-btn]').forEach((btn: HTMLButtonElement) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.netBtn
      if (id === 'testnet' || id === 'mainnet') applyNetwork(id)
    })
  })
}

function bindCopyableFields(): void {
  document.querySelectorAll<HTMLElement>('.copyable').forEach((el: HTMLElement) => {
    el.title = 'Click to copy'
    el.addEventListener('click', () => void copyText(el.textContent ?? '', el))
  })
}

renderUseCases()
bindToggle()
bindCopyableFields()
applyNetwork(readStoredNetwork())
