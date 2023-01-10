import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import Arweave from 'arweave'
import { useActiveWeb3React } from '../hooks'
import { toastify } from './Toastify'
import { bschttp, http, polygonhttp } from './Store'
import key from '../constants/arweave-keyfile.json'
import loadding from '../assets/loading.svg'
import avatar_upload from '../assets/icon_avatar_upload.svg'
import line from '../assets/img_line.svg'

const RegisterBox = styled.div`
  width: 1600px;
  min-height: 842px;
  background: #fff;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  margin: auto;
  margin-top: 48px;
  padding: 48px 64px;
  .boxDivider {
    border: 1px dashed #e5e5e5;
    margin: 0 64px;
  }
`
const LeftBox = styled.div`
  width: 312px;
  height: 750px;
  .title {
    font-size: 28px;
    font-weight: bold;
    color: #000000;
  }
  .minTitle {
    font-size: 18px;
    color: #999999;
  }
`
const RightBox = styled.div`
  width: 1100px;
  .optionTitle {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 32px;
    .Lens {
      pointer-events: none;
      color: #ccc;
    }
    div {
      margin-left: 36px;
      input {
        margin-right: 3px;
      }
    }
  }
  .tipText {
    color: #999999;
    font-weight: 400;
    font-size: 14px;
    position: relative;
    top: -32px;
  }
  .divBorder {
    position: relative;
    margin-bottom: 48px;
    padding: 32px;
    width: 1030px;
    height: 92px;
    border-radius: 20px;
    border: 1px solid #d5d5d5;
    font-size: 24px;
    div {
      font-size: 18px;
      font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
      color: #41acef;
    }
    .Border {
      width: 0px;
      height: 48px;
      border: 1px solid #41acef;
      margin: 0 30px;
    }
    .ContentsTab {
      position: relative;
      background: #ffffff;
      z-index: 40;
      padding: 0 24px;
      div {
        &:hover {
          background: #41acef;
        }
      }
    }
    #inputFile {
      display: none;
    }
  }
  .submit {
    width: 240px;
    height: 60px;
    margin: auto;
    border-radius: 20px;
    background: #35caa9;
    color: #fff;
    .loadding {
      width: 30px;
      height: 30px;
    }
  }
`
export const Register = () => {
  const { account } = useActiveWeb3React()
  const [userName, setUserName] = useState('')
  const [Avatar, setAvatar] = useState('')
  const [AvatarName, setAvatarName] = useState('')
  const [Twitter, setTwitter] = useState('')
  const [Discord, setDiscord] = useState('')
  const [Telegram, setTelegram] = useState('')
  const [Contents, setContents] = useState('')
  const [lending, setLending] = useState(false)
  const history = useHistory()
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
  })
  useEffect(() => {
    getUserInfo()
  }, [account])
  const getUserInfo = async () => {
    if (!account) return
    const data = await bschttp.get(`v0/userinfo/${account}`)
    if (data.data.data.length) {
      history.push({
        pathname: `/MyPage`
      })
    } else {
      return
    }
  }
  const Submit = async () => {
    if (!userName) {
      toastify.error('Username is required')
      return
    }
    if (!Avatar) {
      toastify.error('Avatar is required')
      return
    }
    setLending(true)
    const params = {
      useraddress: account,
      username: userName,
      image: Avatar,
      Twitter: Twitter,
      Discord: Discord,
      Telegram: Telegram,
      mirror: Contents === 'allow' ? 1 : 2
    }
    const res: any = await bschttp.post(`/v0/userinfo`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setLending(false)
      history.push({
        pathname: `/MyPage`
      })
    } else {
      toastify.error(res.message || res.data.message)
    }
  }
  const userAvatarClick = () => {
    const fileInput = document.getElementById('inputFile')
    fileInput?.click()
  }
  const UploadImgChange = async (e: any) => {
    const Img = e.target.files[0]
    const fileSize = Img.size
    const name = Img.name
    const size = fileSize / 1024
    const type = Img.type
    if (size > 1024) {
      toastify.error('Image size cannot be larger than 1MB')
      return
    }
    const reader = new FileReader()
    reader.readAsArrayBuffer(Img)
    reader.onload = (res) => {
      const imgData = res.target?.result
      createTransaction(imgData, type, name)
    }
  }
  const createTransaction = async (datas: any, type: string, name: string) => {
    try {
      const transaction = await arweave.createTransaction({ data: datas })
      transaction.addTag('Content-Type', type)
      await arweave.transactions.sign(transaction, key)
      await arweave.transactions.post(transaction)
      if (transaction) {
        setAvatar(`https://arweave.net/${transaction.id}`)
        setAvatarName(name)
      }
    } catch (err: any) {
      toastify.error(err)
    }
  }
  const userNameChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setUserName(val)
  }, [])
  const TwitterChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTwitter(val)
  }, [])
  const DiscordChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setDiscord(val)
  }, [])
  const TelegramChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTelegram(val)
  }, [])
  const Mirrow = () => {
    if (Contents.length) {
      setContents('')
    } else {
      setContents('allow')
    }
  }
  return (
    <RegisterBox className="flex">
      <LeftBox className="flex flex-center">
        <div>
          <div className="title Chinese-Bold">Create user</div>
          <div className="minTitle Chinese-Regular">Create new user</div>
        </div>
      </LeftBox>
      <div className="boxDivider"></div>
      <RightBox>
        <div className="optionTitle Chinese-Bold">userAddress</div>
        <div className="divBorder Chinese-Regular">{account}</div>
        <div className="optionTitle Chinese-Bold">Name</div>
        <input type="text" className="divBorder Chinese-Regular" value={userName} onChange={userNameChange} />
        <div className="optionTitle Chinese-Bold">Avatar</div>
        <div className="divBorder Chinese-Regular flex flex-v-center">
          <div className="flex flex-v-center flex-column-between cursor" onClick={userAvatarClick}>
            <img src={avatar_upload} />
            &nbsp;Upload
            <div className="Border"></div>
          </div>
          <input id="inputFile" type="file" accept="image/png, image/jpeg" onChange={UploadImgChange} />
          {AvatarName}
        </div>
        <div className="optionTitle Chinese-Bold">Twitter</div>
        <input type="text" className="divBorder Chinese-Regular" value={Twitter} onChange={TwitterChange} />
        <div className="optionTitle Chinese-Bold">Discord</div>
        <input type="text" className="divBorder Chinese-Regular" value={Discord} onChange={DiscordChange} />
        <div className="optionTitle Chinese-Bold">Telegram</div>
        <input type="text" className="divBorder Chinese-Regular" value={Telegram} onChange={TelegramChange} />
        <div className="optionTitle Chinese-Bold flex flex-v-center">
          Mirror :
          <div>
            <input type="checkbox" name="allow" onClick={Mirrow} />
            Allow
          </div>
          <div className="Lens">Lens :</div>
          <div className="Lens">
            <input className="Lens" type="checkbox" name="allow" disabled={false} />
            Allow
          </div>
        </div>
        <div className="tipText">
          The Gameland platform needs to review contents, and only game-related articles are available.
        </div>
        <div className="submit flex flex-center cursor" onClick={Submit}>
          submit
          {lending ? <img className="loadding" src={loadding} /> : ''}
        </div>
      </RightBox>
    </RegisterBox>
  )
}
