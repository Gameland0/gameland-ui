/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import './App.less'
import './Global.css'
import { Header } from '../components/Header'
import { Switch, Route } from 'react-router-dom'
import { Web3Manager } from '../components/Web3Manager'
import { Rent } from './Rent'
import { Dashboard } from './Dashboard'
import { Lend } from './Lend'
import styled from 'styled-components'
import { ToastContainer } from '../components/Toastify'
import { Mint } from './Mint'
import { Guilds } from './Guilds'

const Wrap = styled.div`
  min-height: 30rem;
`

function App() {
  return (
    <div className="App">
      <Header />
      <Web3Manager>
        <Wrap className="">
          <Switch>
            <Route exact path="/" component={Rent} />
            <Route exact path="/lend" component={Lend} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/guilds" component={Guilds} />
            <Route exact path="/mint" component={Mint} />
          </Switch>
          <ToastContainer />
        </Wrap>
      </Web3Manager>
    </div>
  )
}

export default App
