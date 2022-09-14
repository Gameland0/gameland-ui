/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import './App.less'
import './Global.css'
import { Header } from '../components/Header'
import { Switch, Route, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { Web3Manager } from '../components/Web3Manager'
import { Rent } from './Rent'
import { Dashboard } from './Dashboard'
import { Lend } from './Lend'
import { CollectionDetails } from '../components/CollectionDetails'
import { ReviewsDetails } from '../components/ReviewsDetails'
import { UserPage } from '../components/UserPage'
import { Register } from '../components/Register'
import styled from 'styled-components'
import { ToastContainer } from '../components/Toastify'
// import { Alert } from 'antd'
import { Games } from './Games'
import { WritePosts } from '../components/WritePosts'

const browserHistory = createBrowserHistory()
const Wrap = styled.div`
  min-height: 30rem;
`
const Popups = styled.div`
  height: 40px;
  background-color: #f0fcff;
  border: 1px solid #bfedff;
  position: sticky;
  top: 6.25rem;
  z-index: 10;
  .close {
    width: 40px;
    height: 40px;
    font-size: 18px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
`
export const Filling = styled.div`
  height: 3rem;
  background: #fff;
  position: sticky;
  top: 8.75rem;
  z-index: 10;
`
function App() {
  const [visible, setVisible] = useState(true)
  const close = () => {
    setVisible(false)
  }
  return (
    <div className="App">
      <Header />
      {visible ? (
        <Popups>
          <div className="container flex flex-center">
            <a style={{ marginRight: '.5rem', textDecoration: 'underline' }} href="mailto:hello@gameland.network">
              Contact us
            </a>{' '}
            to support your NFT projects.
          </div>
          <div className="close" onClick={close}>
            x
          </div>
        </Popups>
      ) : (
        <div className="sticky"></div>
      )}
      {/* <Filling></Filling> */}
      <Web3Manager>
        <Wrap className="">
          <Switch>
            <Route exact path="/" component={Rent} />
            <Route exact path="/lend" component={Lend} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/games" component={Games} />
            <Route exact path="/games/:contractName" component={CollectionDetails} />
            <Route exact path="/games/:contractName/review" component={ReviewsDetails} />
            <Route exact path="/user/:username" component={UserPage} />
            <Route exact path="/createUser" component={Register} />
            <Route exact path="/WritePosts" component={WritePosts} />
          </Switch>
          <ToastContainer />
        </Wrap>
      </Web3Manager>
    </div>
  )
}

export default App
