import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import Arweave from 'arweave'
import { useActiveWeb3React } from '../hooks'
import { toastify } from './Toastify'
import { bschttp, http, polygonhttp } from './Store'
import key from '../constants/arweave-keyfile.json'
import loadding from '../assets/loading.svg'

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
    border: 1px solid #e5e5e5;
    margin: 0 64px;
  }
`
const LeftBox = styled.div`
  width: 312px;
  height: 750px;
  .title {
    font-size: 28px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #000000;
  }
  .minTitle {
    font-size: 18px;
    font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
    color: #999999;
  }
`
const RightBox = styled.div`
  width: 1100px;
  .optionTitle {
    font-size: 24px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    color: #333333;
    margin-bottom: 32px;
  }
  .divBorder {
    margin-bottom: 48px;
    padding: 32px;
    width: 1030px;
    height: 92px;
    border-radius: 20px;
    border: 1px solid #707070;
    font-size: 24px;
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
  const [Twitter, setTwitter] = useState('')
  const [Discord, setDiscord] = useState('')
  const [Telegram, setTelegram] = useState('')
  const [lending, setLending] = useState(false)
  const history = useHistory()
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
  })
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
      Telegram: Telegram
    }
    const res: any = await bschttp.post(`/v0/userinfo`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setLending(false)
      history.push({
        pathname: `/user/${userName.replace(/ /g, '')}`,
        state: {
          useraddress: account
        }
      })
    } else {
      toastify.error(res.message || res.data.message)
    }
  }
  const UploadImgChange = async (e: any) => {
    // const Img = e.target.value
    const Img = e.target.files[0]
    const fileSize = Img.size
    const size = fileSize / 1024
    const type = Img.type
    if (size > 1024) {
      toastify.error('Image size cannot be larger than 1MB')
      return
    }
    const reader = new FileReader()
    reader.readAsArrayBuffer(Img)
    reader.onload = (res) => {
      // console.log(res.target?.result)
      const imgData = res.target?.result
      createTransaction(imgData, type)
    }
  }
  const createTransaction = async (datas: any, type: string) => {
    try {
      const transaction = await arweave.createTransaction({ data: datas })
      transaction.addTag('Content-Type', type)
      await arweave.transactions.sign(transaction, key)
      await arweave.transactions.post(transaction)
      if (transaction) {
        setAvatar(`https://arweave.net/${transaction.id}`)
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
  return (
    <RegisterBox className="flex">
      <LeftBox className="flex flex-center">
        <div>
          <div className="title">Create user</div>
          <div className="minTitle">Create new user</div>
        </div>
      </LeftBox>
      <div className="boxDivider"></div>
      <RightBox>
        <div className="optionTitle">userAddress</div>
        <div className="divBorder">{account}</div>
        <div className="optionTitle">Name</div>
        <input type="text" className="divBorder" value={userName} onChange={userNameChange} />
        <div className="optionTitle">Avatar</div>
        <div className="divBorder">
          <input type="file" accept="image/png, image/jpeg" onChange={UploadImgChange} />
        </div>
        <div className="optionTitle">Twitter</div>
        <input type="text" className="divBorder" value={Twitter} onChange={TwitterChange} />
        <div className="optionTitle">Discord</div>
        <input type="text" className="divBorder" value={Discord} onChange={DiscordChange} />
        <div className="optionTitle">Telegram</div>
        <input type="text" className="divBorder" value={Telegram} onChange={TelegramChange} />
        <div className="submit flex flex-center cursor" onClick={Submit}>
          submit
          {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
        </div>
      </RightBox>
    </RegisterBox>
  )
}
