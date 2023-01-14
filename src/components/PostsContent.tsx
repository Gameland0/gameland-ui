import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { parseEther } from '@ethersproject/units'
import { useLocation, useParams } from 'react-router-dom'
import { bschttp, http, polygonhttp } from './Store'
import { useActiveWeb3React, useRewardContract } from '../hooks'
import { fetchReceipt } from '../utils'
import { toastify } from './Toastify'
import { Dialog } from './Dialog'
import { SendBox } from '../pages/Dashboard'
import { dateConvert } from './CollectionDetails'
import defaultImg from '../assets/default.png'
import loadding from '../assets/loading.svg'
import likefalse from '../assets/icon_like_default_comments.svg'
import liketrue from '../assets/icon_like_click_comments.svg'
import collectfalse from '../assets/icon_collect_default_comments.svg'
import collecttrue from '../assets/icon_collect_click_comments.svg'
import repost from '../assets/icon_repost.svg'
import Reply from '../assets/icon_reply.svg'
import reward from '../assets/icon_reward.svg'
import arrow from '../assets/icon_select.svg'
import polygonIcon from '../assets/polygon_icon.svg'
import BNBIcon from '../assets/bnb.svg'
import mint from '../assets/mint.png'

const PostsContent = styled.div`
  position: relative;
  min-height: 600px;
  padding: 24px 48px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  font-size: 24px;
  margin: auto;
  margin-top: 40px;
  .user {
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #333333;
    img {
      border-radius: 10px;
      width: 96px;
      height: 96px;
    }
  }
  .gameName {
    position: absolute;
    top: 24px;
    right: 48px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
  }
  .time {
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #d0d0d0;
    position: absolute;
    top: 64px;
    right: 48px;
  }
  .postsTitle {
    margin: 32px 0;
    font-size: 28px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
  }
  .postsContent {
    div {
      font-size: 24px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      color: #333333;
      word-wrap: break-word;
      margin-bottom: 32px;
    }
    img {
      width: 500px;
      height: 500px;
    }
  }
  .otherDetails {
    margin-top: 24px;
    position: relative;
    div {
      margin-right: 64px;
      img {
        width: 40px;
        height: 40px;
        margin-right: 8px;
      }
      .quantity {
        font-size: 16px;
        font-family: DIN-Medium, DIN;
        color: #666666;
      }
    }
    .reward {
      margin-left: 16px;
      position: relative;
      .rewardTotal {
        width: 100px;
        flex-wrap: wrap;
        position: absolute;
        top: -5px;
        left: 50px;
        font-size: 16px;
        margin: 0;
        p {
          width: 200px;
          margin-bottom: 0px;
        }
      }
    }
  }
  .replyWindow {
    font-size: 24px;
    margin: 20px 0 0 36px;
    .replyDetails {
      margin: 0 0 24px 0;
      .userImage {
        width: 72px;
        height: 72px;
        border-radius: 36px;
      }
      .replyContent {
        margin-top: 10px;
      }
    }
    .replayInput {
      display: flex;
      width: 95%;
      margin-top: 48px;
      .replayWho {
        min-width: 20px;
      }
      textarea {
        width: 90%;
        height: 80px;
        resize: none;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        outline: 0;
        font-size: 24px;
        padding-left: 10px;
      }
    }
    .sendReplay {
      width: 120px;
      height: 40px;
      background: #35caa9;
      border-radius: 40px;
      text-align: center;
      line-height: 40px;
      color: #fff;
      font-size: 24px;
      margin: auto;
      margin-top: 20px;
      cursor: pointer;
    }
  }
  @media screen and (min-width: 1440px) {
    width: 1312px;
    min-height: 600px;
  }
  @media screen and (min-width: 1920px) {
    width: 1600px;
  }
`
export const PostsContentPage = () => {
  const { account, chainId, library } = useActiveWeb3React()
  const RewardContract = useRewardContract()
  const { search } = useLocation() as any
  const [userinfo, setUserinfo] = useState([] as any)
  const [postsItem, setPostsItem] = useState([] as any)
  const [userinfoAll, setuserinfoAll] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [PostsLike, setPostsLike] = useState([] as any)
  const [postsRewardData, setPostsRewardData] = useState([] as any)
  const [postsReplayData, setPostsReplayData] = useState([] as any)
  const [userLikeInfo, setuserLikeInfo] = useState([] as any)
  const [rewardItem, setrewardItem] = useState({} as any)
  const [RewarType, setRewarType] = useState('CommentsRewar')
  const [replayValue, setreplayValue] = useState('')
  const [refreshBy, setrefreshBy] = useState(false)
  const [lending, setLending] = useState(false)
  const [showPostsReplayWindow, setShowPostsReplayWindow] = useState(false)
  const [showreward, setshowreward] = useState(false)
  const [rewardoptions, setrewardoptions] = useState(false)
  const urlDataArr = search.slice(1).split('&')
  const [replayWho, setreplayWho] = useState('')
  const [rewardQuantity, setrewardQuantity] = useState('')
  const [rewardSelection, setrewardSelection] = useState(chainId === 56 ? 'BNB' : 'MATIC')
  const { useraddress, postsId } = useParams() as any
  useEffect(() => {
    getUserInfo()
  }, [account])
  const getUserInfo = async () => {
    if (!account || !useraddress) return
    const data = await bschttp.get(`v0/userinfo/${useraddress}`)
    if (data.data.data.length) {
      setUserinfo(data.data.data[0])
    }
    const postData = await bschttp.get(`v0/posts/${postsId}`)
    if (postData.data.data.length) {
      setPostsItem(postData.data.data[0])
      setLending(true)
      fetch(postData.data.data[0].link)
        .then((res) => res.json())
        .then((data) => {
          const Dom = document.createElement('div')
          Dom.innerHTML = data.content
          document.getElementById('postsContent')?.appendChild(Dom)
          setLending(false)
        })
    }
    bschttp.get(`v0/userinfo`).then((vals) => setuserinfoAll(vals.data.data))
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
    bschttp.get(`v0/posts_like`).then((vals) => setPostsLike(vals.data.data))
    bschttp.get(`v0/posts_reward`).then((vals) => setPostsRewardData(vals.data.data))
    bschttp.get(`v0/posts_reply`).then((vals) => setPostsReplayData(vals.data.data))
    const BscLike = bschttp.get(`/v0/review_like/${account}`)
    const polygonLike = polygonhttp.get(`/v0/review_like/${account}`)
    Promise.all([BscLike, polygonLike]).then((vals) => {
      setuserLikeInfo([...vals[0].data.data, ...vals[1].data.data])
    })
  }
  const handlePostsOtherDetails = (type: string) => {
    if (type === 'collectQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.collect === postsItem.id
      })
      return quantity.length
    }
    if (type === 'likeQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    if (type === 'isLike') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.reviewid === postsItem.id
      })
      return quantity
    }
    if (type === 'isCollect') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.collect === postsItem.id
      })
      return quantity
    }
    if (type === 'BNBTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'BNB' && item.articleType === 'Gameland'
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (type === 'MATICTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'MATIC' && item.articleType === 'Gameland'
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (type === 'replayQuantity') {
      const quantity = postsReplayData.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    return 0
  }
  const sendPostsReplay = async () => {
    if (!replayValue) return
    if (useraddress.toLowerCase() === account?.toLowerCase()) {
      if (!replayWho) return
    }
    let text
    if (replayWho) {
      text = replayWho + ':' + replayValue
    } else {
      text = replayValue
    }
    const params = {
      useraddress: account,
      reviewid: postsItem.id,
      username: userinfo.username,
      context: text
    }
    const res: any = await bschttp.post(`/v0/posts_reply`, params)
    if (res.data.code === 1) {
      setreplayValue('')
      setrefreshBy(!refreshBy)
      toastify.success('succeed')
    }
  }
  const postsRewar = async () => {
    if (!rewardQuantity || !library) return
    setLending(true)
    try {
      const rented = await RewardContract?.connect(library.getSigner()).reward(rewardItem.useraddress, {
        value: parseEther(rewardQuantity)
      })
      const receipt = await fetchReceipt(rented.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to rent.')
      }
      const params = {
        reviewid: rewardItem.id,
        toaddress: rewardItem.useraddress,
        fromaddress: account,
        datetime: new Date().toJSON(),
        amount: rewardQuantity,
        paytype: rewardSelection,
        articleType: 'Gameland'
      }
      const res: any = await bschttp.post(`/v0/posts_reward/`, params)
      if (res.data.code === 1) {
        toastify.success('succeed')
        setLending(false)
        setshowreward(false)
        setrefreshBy(!refreshBy)
      } else {
        setLending(false)
        throw res.message || res.data.message
      }
    } catch (error: any) {
      setLending(false)
      throw error.message || error.data.message
    }
  }
  const postsLike = async () => {
    if (useraddress.toLowerCase() === account?.toLowerCase()) return
    if (handlePostsOtherDetails('isLike').length) {
      const data = handlePostsOtherDetails('isLike')
      const res: any = await bschttp.delete(`v0/posts_like/${data[0].id}`)
      if (res.data.code === 1) {
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } else {
        throw res.message || res.data.message
      }
    } else {
      const params = {
        useraddress: account,
        reviewid: postsItem.id
      }
      const res: any = await bschttp.post(`v0/posts_like`, params)
      if (res.data.code === 1) {
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } else {
        throw res.message || res.data.message
      }
    }
  }
  const postsCollect = async () => {
    if (useraddress.toLowerCase() === account?.toLowerCase()) return
    if (handlePostsOtherDetails('isCollect').length) {
      const data = handlePostsOtherDetails('isCollect')
      const res: any = await bschttp.delete(`v0/posts_like/${data[0].id}`)
      if (res.data.code === 1) {
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } else {
        throw res.message || res.data.message
      }
    } else {
      const params = {
        useraddress: account,
        collect: postsItem.id
      }
      const res: any = await bschttp.post(`v0/posts_like`, params)
      if (res.data.code === 1) {
        setrefreshBy(!refreshBy)
        toastify.success('succeed')
      } else {
        throw res.message || res.data.message
      }
    }
  }
  const postsReplayClick = () => {
    setShowPostsReplayWindow(!showPostsReplayWindow)
  }
  const showPostsRewarDialog = () => {
    if (useraddress.toLowerCase() === account?.toLowerCase()) return
    setshowreward(true)
    setRewarType('PostsRewar')
    setrewardItem(postsItem)
  }
  const getUserImage = (useraddress: string) => {
    const findData = userinfoAll.filter((ele: any) => {
      return ele.useraddress === useraddress
    })
    if (findData.length) {
      return findData[0].image ? findData[0].image : defaultImg
    }
    return defaultImg
  }
  const getPostsReplayData = (id: any) => {
    const data = postsReplayData.filter((ele: any) => {
      return ele.reviewid === id
    })
    return data
  }
  const handlereplayChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setreplayValue(val)
  }, [])
  const handlerewardQuantityChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setrewardQuantity(val)
  }, [])

  return (
    <PostsContent>
      <Dialog footer={null} onCancel={() => setshowreward(false)} open={showreward} destroyOnClose closable={false}>
        <SendBox>
          <div className="title">give a reward</div>
          <h2>Quantity</h2>
          <div className="input">
            <input placeholder="quantity" onChange={handlerewardQuantityChange} value={rewardQuantity} />
          </div>
          <div className="Selection" onClick={() => setrewardoptions(!rewardoptions)}>
            {rewardSelection}
            <img src={arrow} className="arrowIcon" />
          </div>
          {rewardoptions ? (
            <div className="Options">
              <div
                onClick={() => {
                  setrewardSelection('BNB')
                  setrewardoptions(false)
                }}
                className="flex flex-v-center"
              >
                <img src={BNBIcon} className="icon" />
                BNB
              </div>
              <div
                onClick={() => {
                  setrewardSelection('MATIC')
                  setrewardoptions(false)
                }}
                className="flex flex-v-center"
              >
                <img src={polygonIcon} className="icon" />
                MATIC
              </div>
            </div>
          ) : (
            ''
          )}
          <div className={rewardQuantity ? 'button ture' : 'button false'} onClick={postsRewar}>
            Send
            {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
          </div>
        </SendBox>
      </Dialog>
      <div className="user">
        <img src={userinfo.image || defaultImg} />
        &nbsp;&nbsp;{userinfo.username}
      </div>
      <div className="gameName">{postsItem.contractName}</div>
      <div className="time">
        {postsItem.view} view · {dateConvert(postsItem.createdAt)}
      </div>
      <div className="postsTitle text-center">{postsItem.title}</div>
      {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
      <div id="postsContent" className="postsContent"></div>
      <div className="otherDetails flex">
        <div className="like flex flex-v-center">
          <img src={handlePostsOtherDetails('isLike').length ? liketrue : likefalse} onClick={postsLike} />
          <div className="quantity">{handlePostsOtherDetails('likeQuantity')}</div>
        </div>
        <div className="repost flex flex-v-center">
          <img src={handlePostsOtherDetails('isCollect').length ? collecttrue : collectfalse} onClick={postsCollect} />
          <div className="quantity">{handlePostsOtherDetails('collectQuantity')}</div>
        </div>
        <div className="Reply cursor flex flex-v-center">
          <img src={Reply} onClick={postsReplayClick} />
          <div className="quantity">{handlePostsOtherDetails('replayQuantity')}</div>
        </div>
        <div className="mint not-allowed">
          <img src={mint} title="collects" />
        </div>
        <div className="reward">
          <img className="" src={reward} onClick={showPostsRewarDialog} />
          <div className="rewardTotal">
            <p>{handlePostsOtherDetails('BNBTotal')} BNB</p>
            <p>{handlePostsOtherDetails('MATICTotal')} MATIC</p>
          </div>
        </div>
      </div>
      {showPostsReplayWindow ? (
        <div className="replyWindow">
          {getPostsReplayData(postsItem.id).length ? (
            getPostsReplayData(postsItem.id).map((ele: any, index: any) => (
              <div className="replyDetails cursor" key={index} onClick={() => setreplayWho('@' + ele.username)}>
                <img src={getUserImage(ele.useraddress)} className="userImage" alt="" /> &nbsp;
                {ele.username}
                <div className="replyContent">{ele.context}</div>
              </div>
            ))
          ) : (
            <div>No reply yet</div>
          )}
          <div className="replayInput">
            <div className="replayWho" onClick={() => setreplayWho('')}>
              {replayWho}
            </div>
            <textarea rows={5} cols={70} placeholder="" value={replayValue} onChange={handlereplayChange} />
          </div>
          <div className="sendReplay" onClick={sendPostsReplay}>
            send
          </div>
          <div className="bottomBorder"></div>
        </div>
      ) : (
        ''
      )}
    </PostsContent>
  )
}
