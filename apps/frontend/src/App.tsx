import { useEffect, useState } from "react"
import "./App.css"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"

type Payload = {
  status: string
  task: string
}

function App() {
  const [count, setCount] = useState(0)
  const [payloads, setPayloads] = useState<Payload[]>([])

  useEffect(() => {
    const eventSource = new EventSource("/api/token-issuance/updates")
    eventSource.onmessage = ({ data }) => {
      console.log(data)
      setPayloads((prevPayloads) => [...prevPayloads, JSON.parse(data)])
    }
    eventSource.onopen = () => {
      console.log("Connection opened")
    }

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error)
      eventSource.close()
    }

    // Cleanup function to close connection on unmount
    return () => {
      console.log("Closing SSE connection...")
      eventSource.close()
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR ROOO!!!
        </p>

        {payloads.map((payload, index) => {
          return (
            <p key={payload.task + index}>
              Task #{index} {payload.task} - {payload.status}
            </p>
          )
        })}
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
