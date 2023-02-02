import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { parseEther } from '@ethersproject/units'
import { useLocation, useParams, useHistory } from 'react-router-dom'
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
import mint from '../assets/mint.png'
import Reply from '../assets/icon_reply.svg'
import reward from '../assets/icon_reward.svg'
import arrow from '../assets/icon_select.svg'
import polygonIcon from '../assets/polygon_icon.svg'
import BNBIcon from '../assets/bnb.svg'

const PostsContent = styled.div`
  position: relative;
  width: 1600px;
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
      width: 60%;
      height: 60%;
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
export const ArticleContentPage = () => {
  const { account, chainId, library } = useActiveWeb3React()
  const RewardContract = useRewardContract()
  const { search } = useLocation() as any
  const [userinfo, setUserinfo] = useState([] as any)
  const [postsItem, setPostsItem] = useState([] as any)
  const [userinfoAll, setuserinfoAll] = useState([] as any)
  const [PostsLike, setPostsLike] = useState([] as any)
  const [postsRewardData, setPostsRewardData] = useState([] as any)
  const [postsReplayData, setPostsReplayData] = useState([] as any)
  // const [userLikeInfo, setuserLikeInfo] = useState([] as any)
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
  const { type, useraddress, Id } = useParams() as any
  const history = useHistory()
  useEffect(() => {
    getUserInfo()
  }, [account, refreshBy])
  const getUserInfo = async () => {
    if (!account || !useraddress) return
    const data = await bschttp.get(`v0/userinfo/${useraddress}`)
    setUserinfo(data.data.data[0])
    bschttp.get(`v0/userinfo`).then((vals) => setuserinfoAll(vals.data.data))
    bschttp.get(`v0/posts_like`).then((vals) => setPostsLike(vals.data.data))
    bschttp.get(`v0/posts_reward`).then((vals) => setPostsRewardData(vals.data.data))
    bschttp.get(`v0/posts_reply`).then((vals) => setPostsReplayData(vals.data.data))
    let Data: any
    if (type === 'Mirror') {
      Data = (await bschttp.get(`v0/mirrow_article/${Id}`)).data.data
    } else if (type === 'Gameland') {
      Data = (await bschttp.get(`v0/posts/${Id}`)).data.data
    }
    if (Data.length) {
      setPostsItem(Data[0])
      setLending(true)
      if (type === 'Mirror') {
        const Content = document.getElementById('postsContent')
        if (!Content?.innerHTML.length) {
          const Dom = document.createElement('div')
          Dom.innerHTML = Data[0]?.context
          document.getElementById('postsContent')?.appendChild(Dom)
          const noscript = document.getElementsByTagName('noscript')
          const imgArr = []
          for (let i = 0; i < noscript.length; i++) {
            if (i > 0) {
              const srt = noscript[i].innerText
              const src = srt.substring(srt.indexOf('src="'))
              const regExp = new RegExp('" decoding', 'g')
              const regExp2 = new RegExp('amp;', 'g')
              const regExpsrc = src.split('="')[1].replace(regExp, '').replace(regExp2, '').replace(/ /g, '')
              imgArr.push(regExpsrc)
            }
          }
          const rehypefigure = document.getElementsByClassName('rehype-figure')
          let imgArrIndex = 0
          for (let index = 0; index < rehypefigure.length; index++) {
            const span = rehypefigure[index].getElementsByTagName('span')
            if (span.length) {
              const img = span[0].getElementsByTagName('img')[1]
              const img1 = span[0].getElementsByTagName('img')[0]
              img.src = 'https://mirror.xyz' + imgArr[imgArrIndex]
              img1.src = 'https://mirror.xyz' + imgArr[imgArrIndex]
              imgArrIndex++
            }
          }
        }
        setLending(false)
      } else if (type === 'Gameland') {
        fetch(Data[0]?.link)
          .then((res) => res.json())
          .then((data) => {
            const Content = document.getElementById('postsContent')
            if (!Content?.innerHTML.length) {
              const Dom = document.createElement('div')
              Dom.innerHTML = data.content
              document.getElementById('postsContent')?.appendChild(Dom)
            }
            setLending(false)
          })
      }
    }
  }
  const handlePostsOtherDetails = (handletype: string) => {
    if (handletype === 'collectQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.collect === postsItem.id
      })
      return quantity.length
    }
    if (handletype === 'likeQuantity') {
      const quantity = PostsLike.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    if (handletype === 'isLike') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.reviewid === postsItem.id
      })
      return quantity
    }
    if (handletype === 'isCollect') {
      const quantity = PostsLike.filter((item: any) => {
        return item.useraddress === account && item.collect === postsItem.id
      })
      return quantity
    }
    if (handletype === 'BNBTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'BNB' && item.articleType === type
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (handletype === 'MATICTotal') {
      const data = postsRewardData.filter((item: any) => {
        return item.reviewid === postsItem.id && item.paytype === 'MATIC' && item.articleType === type
      })
      let Total = 0
      data.map((item: any) => {
        Total = Total + item.amount
      })
      return Total
    }
    if (handletype === 'replayQuantity') {
      const quantity = postsReplayData.filter((item: any) => {
        return item.reviewid === postsItem.id
      })
      return quantity.length
    }
    return 0
  }
  const sendPostsReplay = async () => {
    if (!replayValue) return
    if (useraddress?.toLowerCase() === account?.toLowerCase()) {
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
      let address
      if (type === 'Gameland') {
        address = rewardItem.useraddress
      } else {
        address = rewardItem.owner
      }
      const rented = await RewardContract?.connect(library.getSigner()).reward(address, {
        value: parseEther(rewardQuantity)
      })
      const receipt = await fetchReceipt(rented.hash, library)
      const { status } = receipt
      if (!status) {
        throw Error('Failed to rent.')
      }
      const params = {
        reviewid: rewardItem.id,
        toaddress: address,
        fromaddress: account,
        datetime: new Date().toJSON(),
        amount: rewardQuantity,
        paytype: rewardSelection,
        articleType: type
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
    if (useraddress?.toLowerCase() === account?.toLowerCase()) return
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
  const link = () => {
    history.push({
      pathname: `/user/${userinfo?.username.replace(/ /g, '')}`,
      state: {
        useraddress: userinfo?.useraddress
      }
    })
  }
  const postsCollect = async () => {
    if (useraddress?.toLowerCase() === account?.toLowerCase()) return
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
    if (useraddress?.toLowerCase() === account?.toLowerCase()) return
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
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }

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
      <div className="user cursor" onClick={link}>
        <img src={userinfo.image} onError={handleImgError} />
        &nbsp;&nbsp;{userinfo.username}
      </div>
      <div className="time">
        {postsItem.view} view · {postsItem.datetime || dateConvert(postsItem.createdAt)}
      </div>
      <div className="postsTitle text-center">{postsItem.title}</div>
      {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
      <div id="postsContent" className="postsContent"></div>
      <div className="otherDetails flex">
        <div className="like cursor flex flex-v-center">
          <img src={handlePostsOtherDetails('isLike').length ? liketrue : likefalse} onClick={postsLike} />
          <div className="quantity">{handlePostsOtherDetails('likeQuantity')}</div>
        </div>
        <div className="repost cursor flex flex-v-center">
          <img src={handlePostsOtherDetails('isCollect').length ? collecttrue : collectfalse} onClick={postsCollect} />
          <div className="quantity">{handlePostsOtherDetails('collectQuantity')}</div>
        </div>
        <div className="Reply cursor flex flex-v-center">
          <img src={Reply} onClick={postsReplayClick} />
          <div className="quantity">{handlePostsOtherDetails('replayQuantity')}</div>
        </div>
        <div className="mint not-allowed">
          <img src={mint} alt="mint" />
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
