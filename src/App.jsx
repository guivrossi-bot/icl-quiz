import { useEffect, useState } from 'react'
import StartScreen from './components/StartScreen.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import { detectLang } from './lib/i18n.js'
import { newSessionId } from './lib/tracker.js'

function initialScreen() {
  try {
    return window.location.pathname.replace(/\/+$/, '') === '/quiz' ? 'quiz' : 'start'
  } catch {
    return 'start'
  }
}

function setLangParam(lang) {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.history.replaceState({}, '', url)
  } catch {
    /* ignore */
  }
}

function pushPath(path, lang) {
  try {
    const url = new URL(window.location.origin + path)
    if (lang) url.searchParams.set('lang', lang)
    window.history.pushState({}, '', url)
  } catch {
    /* ignore */
  }
}

export default function App() {
  const [lang, setLang] = useState(detectLang)
  const [screen, setScreen] = useState(initialScreen)
  const [sessionId, setSessionId] = useState(newSessionId)
  const [blocks, setBlocks] = useState([0, 0, 0, 0])

  useEffect(() => {
    document.documentElement.lang = lang
    setLangParam(lang)
  }, [lang])

  useEffect(() => {
    function onPop() {
      setScreen(initialScreen())
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function start() {
    setSessionId(newSessionId())
    setBlocks([0, 0, 0, 0])
    setScreen('quiz')
    pushPath('/quiz', lang)
    window.scrollTo(0, 0)
  }

  function done(result) {
    setBlocks(result)
    setScreen('results')
    window.scrollTo(0, 0)
  }

  function retake() {
    setSessionId(newSessionId())
    setBlocks([0, 0, 0, 0])
    setScreen('start')
    pushPath('/', lang)
    window.scrollTo(0, 0)
  }

  if (screen === 'quiz') {
    return <Quiz lang={lang} onLang={setLang} sessionId={sessionId} onDone={done} />
  }
  if (screen === 'results') {
    return (
      <Results
        lang={lang}
        onLang={setLang}
        blocks={blocks}
        sessionId={sessionId}
        onRetake={retake}
      />
    )
  }
  return <StartScreen lang={lang} onLang={setLang} onStart={start} />
}
