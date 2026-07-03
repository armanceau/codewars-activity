import { useState } from 'react'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import { Button } from '@astryxdesign/core/Button'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Switch } from '@astryxdesign/core/Switch'
import { Selector } from '@astryxdesign/core/Selector'
import { Card } from '@astryxdesign/core/Card'
import { VStack } from '@astryxdesign/core/VStack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Divider } from '@astryxdesign/core/Divider'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Badge } from '@astryxdesign/core/Badge'

const BASE_URL = 'https://codewars-activity.vercel.app'

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
]

const MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
]

function App() {
  const [username, setUsername] = useState('')
  const [lang, setLang] = useState('en')
  const [showStreak, setShowStreak] = useState(true)
  const [loading, setLoading] = useState(false)
  const [svgUrl, setSvgUrl] = useState('')
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('theme') || 'system' } catch { return 'system' }
  })

  const changeMode = (next) => {
    setMode(next)
    localStorage.setItem('theme', next)
  }

  const generate = () => {
    if (!username.trim()) return
    const base = `${BASE_URL}/${username.trim()}/${lang}/activity.svg`
    setSvgUrl(showStreak ? base : `${base}?streak=false`)
    setLoading(true)
  }

  const markdown = svgUrl ? `![Codewars Activity](${svgUrl})` : ''

  const copy = async (text, setter) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <div className="page">

        <header className="site-header">
          <div className="site-brand">
            <Heading level={1}>Codewars Activity</Heading>
            <Text type="supporting" as="p">
              A GitHub-style contribution graph for your Codewars profile.
            </Text>
          </div>
          <div className="header-controls">
            <a
              className="github-link"
              href="https://github.com/armanceau/codewars-activity"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.09 3.29 9.4 7.86 10.93 0.57 0.1 0.78-0.25 0.78-0.55 0-0.27-0.01-1.15-0.02-2.09-3.2 0.7-3.88-1.36-3.88-1.36-0.52-1.33-1.28-1.68-1.28-1.68-1.04-0.72 0.08-0.7 0.08-0.7 1.15 0.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36 0.96 0.1-0.75 0.4-1.25 0.73-1.54-2.55-0.29-5.24-1.28-5.24-5.69 0-1.26 0.45-2.29 1.19-3.09-0.12-0.29-0.52-1.47 0.11-3.06 0 0 0.97-0.31 3.18 1.18 0.92-0.26 1.91-0.39 2.89-0.39 0.98 0 1.97 0.13 2.89 0.39 2.21-1.49 3.18-1.18 3.18-1.18 0.63 1.59 0.23 2.77 0.11 3.06 0.74 0.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68 0.41 0.36 0.78 1.06 0.78 2.15 0 1.55-0.01 2.8-0.01 3.18 0 0.3 0.2 0.66 0.79 0.55C20.21 21.39 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"
                />
              </svg>
            </a>

            <Selector
              label="Color mode"
              isLabelHidden
              value={mode}
              options={MODE_OPTIONS}
              onChange={changeMode}
              size="sm"
            />
          </div>
        </header>

        <main>
          <VStack gap={4}>
            <Card>
              <VStack gap={3} style={{ padding: '1.5rem' }}>
                <TextInput
                  label="Codewars username"
                  placeholder="e.g. armanceau"
                  value={username}
                  onChange={setUsername}
                  onEnter={generate}
                  hasClear
                  width="100%"
                />

                <Selector
                  label="Language"
                  value={lang}
                  options={LANG_OPTIONS}
                  onChange={setLang}
                  width="100%"
                />

                <Switch
                  label="Streak badge"
                  description="Display your current streak count on the graph"
                  value={showStreak}
                  onChange={setShowStreak}
                  labelSpacing="spread"
                  width="100%"
                  className={`streak-switch${showStreak ? ' is-on' : ''}`}
                />

                <Button
                  label="Generate graph"
                  variant="primary"
                  onClick={generate}
                  isDisabled={!username.trim()}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                />
              </VStack>
            </Card>

            {svgUrl && (
              <Card>
                <VStack gap={4} style={{ padding: '1.5rem' }}>
                  <div className="result-title">
                    <Heading level={2}>Preview</Heading>
                    {!loading && <Badge label="Ready" variant="success" />}
                  </div>

                  <div className="svg-container">
                    {loading && (
                      <div className="svg-loader">
                        <Spinner />
                      </div>
                    )}
                    <iframe
                      className="svg-preview"
                      src={svgUrl}
                      onLoad={() => setLoading(false)}
                      style={{ opacity: loading ? 0 : 1 }}
                    />
                  </div>

                  <Divider />

                  <VStack gap={2}>
                    <div className="field-row">
                      <Text type="label">Direct link</Text>
                      <Button
                        label={copiedLink ? 'Copied' : 'Copy link'}
                        variant={copiedLink ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => copy(svgUrl, setCopiedLink)}
                      />
                    </div>
                    <pre className="code-pre"><code>{svgUrl}</code></pre>
                  </VStack>

                  <VStack gap={2}>
                    <div className="field-row">
                      <Text type="label">Markdown embed</Text>
                      <Button
                        label={copiedMarkdown ? 'Copied' : 'Copy markdown'}
                        variant={copiedMarkdown ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => copy(markdown, setCopiedMarkdown)}
                      />
                    </div>
                    <pre className="code-pre"><code>{markdown}</code></pre>
                  </VStack>
                </VStack>
              </Card>
            )}
          </VStack>
        </main>

        <footer className="site-footer">
          <Text type="supporting">
            Built by{' '}
            <a className="footer-link" href="https://github.com/armanceau" target="_blank" rel="noopener noreferrer">
              Arthur Manceau
            </a>
            {' · '}
            <a className="footer-link" href="https://www.linkedin.com/in/arthur-manceau" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </Text>
        </footer>

      </div>
    </Theme>
  )
}

export default App
