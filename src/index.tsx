import React from 'react'
import ReactDOM from 'react-dom'
import App from './pages/App'
// import reportWebVitals from './reportWebVitals'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { HashRouter } from 'react-router-dom'
import { NetworkContextName } from './utils'
import { Store } from './components/Store'

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}
const OWeb3ReactProvider = createWeb3ReactRoot(NetworkContextName)
ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <OWeb3ReactProvider getLibrary={getLibrary}>
        <HashRouter>
          <Store>
            <App />
          </Store>
        </HashRouter>
      </OWeb3ReactProvider>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)
