let iinkPromise: Promise<typeof import('iink-ts')> | null = null

export function loadIink(): Promise<typeof import('iink-ts')> {
  if (!iinkPromise) {
    iinkPromise = import('iink-ts')
  }
  return iinkPromise
}

const APP_KEY_STORAGE = 'skrybl-myscript-app-key'
const HMAC_KEY_STORAGE = 'skrybl-myscript-hmac-key'

export function getMyScriptKeys(): { applicationKey: string; hmacKey: string } {
  return {
    applicationKey: localStorage.getItem(APP_KEY_STORAGE) ?? '',
    hmacKey: localStorage.getItem(HMAC_KEY_STORAGE) ?? ''
  }
}

export function setMyScriptKeys(applicationKey: string, hmacKey: string): void {
  localStorage.setItem(APP_KEY_STORAGE, applicationKey)
  localStorage.setItem(HMAC_KEY_STORAGE, hmacKey)
}

export function hasMyScriptKeys(): boolean {
  const { applicationKey, hmacKey } = getMyScriptKeys()
  return applicationKey.length > 0 && hmacKey.length > 0
}
