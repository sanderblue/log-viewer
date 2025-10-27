import { LogViewer } from '@/components/LogViewer'
import './App.css'

const logsApiUrl = 'https://s3.amazonaws.com/io.cribl.c021.takehome/cribl.log'

function App() {
  return (
    <LogViewer url={logsApiUrl} />
  )
}

export default App
