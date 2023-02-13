/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import './App.less'
import './Global.css'
import './mirror.css'
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
import { MyPage } from '../components/MyPage'
import { Register } from '../components/Register'
import styled from 'styled-components'
import { ToastContainer } from '../components/Toastify'
// import { Alert } from 'antd'
import { Games } from './Games'
import { WritePosts } from '../components/WritePosts'
import { PostsContentPage } from '../components/PostsContent'
import { ArticleContentPage } from '../components/ArticleContent'
import { RelationChart } from '../components/RelationChart'
import { Expose } from '../components/Expose'
import { Circle } from '../components/Circle'

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
  z-index: 60;
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
          <a
            target="_blank"
            rel="noreferrer"
            href="https://dapp.gameland.network/#/Article/Mirror/0x7a387E6f725a837dF5922e3Fe71827450A76A3E5/27d753d0-9a95-4c3a-9362-3d196d01772d"
          >
            <div className="container flex flex-center">
              the higher the G Point you get, the higher the probability you will get rewards (airdrops, incentives,
              etc.) in the future. This link tells how to get reputation points
            </div>
          </a>
          {/* <div className="close" onClick={close}>
            x
          </div> */}
        </Popups>
      ) : (
        <div className="sticky"></div>
      )}
      {/* <Filling></Filling> */}
      <Web3Manager>
        <Wrap className="">
          <Switch>
            {/* <Route exact path="/" component={Rent} /> */}
            <Route exact path="/lend" component={Lend} />
            <Route exact path="/dashboard" component={MyPage} />
            <Route exact path="/" component={Games} />
            <Route exact path="/expose" component={Expose} />
            <Route exact path="/circle" component={Circle} />
            <Route exact path="/games/:contractName" component={CollectionDetails} />
            <Route exact path="/games/:contractName/review" component={ReviewsDetails} />
            <Route exact path="/user/:username" component={UserPage} />
            <Route exact path="/MyPage" component={MyPage} />
            <Route exact path="/createUser" component={Register} />
            <Route exact path="/WritePosts" component={WritePosts} />
            <Route exact path="/RelationChart/:contractName" component={RelationChart} />
            <Route exact path="/PostsContent/:useraddress/:postsId" component={PostsContentPage} />
            <Route exact path="/Article/:type/:useraddress/:Id" component={ArticleContentPage} />
          </Switch>
          <ToastContainer />
        </Wrap>
      </Web3Manager>
      <div className="filling"></div>
    </div>
  )
}

export default App
