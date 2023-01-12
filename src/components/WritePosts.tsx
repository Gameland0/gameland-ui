import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { bschttp, http, polygonhttp } from './Store'
import { createAndSubmitItem, Config, payBill } from '../utils/arseeding'
import { Title } from '../pages/Rent'
import { toastify } from './Toastify'
// import picIcon from '../assets/icon_pic.svg'
import gameIcon from '../assets/icon_game.svg'
// import boldIcon from '../assets/icon_description_font_bold.svg'
// import ltalicIcon from '../assets/icon_description_font_Italic.svg'
// import underlinedIcon from '../assets/icon_description_font_underlined.svg'
import loadding from '../assets/loading.svg'
import key from '../constants/arweave-keyfile.json'
import Arweave from 'arweave'
import ArweaveSigner from 'arseeding-arbundles/src/signing/chains/ArweaveSigner'
import { RichTextEditor } from '@mantine/rte'

const WritePostsBox = styled.div`
  position: relative;
  width: 84.5%;
  min-height: 860px;
  margin: auto;
  margin-top: 20px;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.16);
  border-radius: 10px;
  padding: 48px 285px;
  input {
    width: 70%;
    height: 92px;
    border-radius: 20px;
    border: 1px solid #707070;
    padding: 0 16px;
    margin: 32px 0 48px 0;
    font-size: 24px;
  }
  .ganmeIcon {
    margin-left: 16px;
  }
  .gameName {
    width: 257px;
    margin-left: 16px;
    font-size: 20px;
    img {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }
  }
  .postButton {
    width: 272px;
    height: 92px;
    background: #35caa9;
    border-radius: 20px;
    margin: auto;
    margin-top: 36px;
    font-size: 28px;
    line-height: 92px;
    color: #fff;
  }
  @media screen and (max-width: 1440px) {
    padding: 32px 160px;
    input {
      height: 78px;
    }
  }
`
const GameList = styled.div`
  width: 250px;
  height: 400px;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.36);
  background: #fff;
  position: absolute;
  top: 32px;
  right: 280px;
  overflow: auto;
  z-index: 100;
  @media screen and (max-width: 1440px) {
    right: 110px;
  }
`
const GameListItem = styled.div`
  width: 100%;
  margin-bottom: 16px;
  img {
    width: 50px;
    height: 50px;
  }
  .contractName {
    width: 136px;
    margin-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:hover {
    background-color: #41acef;
  }
`
export const WritePosts = () => {
  const { account } = useActiveWeb3React()
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState('')
  const [gameItem, setGameItem] = useState({} as any)
  const [showGameList, setShowGameList] = useState(false)
  const [lending, setLending] = useState(false)
  const [gameData, setGameData] = useState([] as any)
  const history = useHistory()
  // const arweave = Arweave.init({
  //   host: 'arweave.net',
  //   port: 443,
  //   protocol: 'https',
  //   timeout: 20000,
  //   logging: false
  // })
  useEffect(() => {
    const getGames = async () => {
      const bsc = await bschttp.get('/v0/games')
      const polygon = await polygonhttp.get('/v0/games')
      setGameData([...bsc.data.data, ...polygon.data.data])
    }
    getGames()
  }, [account])
  const GameListItemClick = (item: any) => {
    setShowGameList(false)
    setGameItem(item)
  }
  const PostButtonClick = async () => {
    if (!inputValue || inputValue.length < 10) {
      toastify.error('Title length must be 10 or more')
      return
    }
    const domcontent = value
    if ((domcontent?.length as number) < 46) {
      toastify.error('Content length must be 30 or more')
      return
    }
    if (lending) return
    setLending(true)
    const datas = {
      title: inputValue,
      collection: gameItem,
      content: domcontent
    }
    const data = Buffer.from(JSON.stringify(datas))
    const opts = {
      tags: [
        { name: 'key01', value: 'val01' },
        { name: 'Content-Type', value: 'application/json' }
      ]
    }
    const rsaSigner = new ArweaveSigner(key)
    const cfg: Config = {
      signer: rsaSigner,
      path: '',
      currency: 'AR',
      arseedUrl: 'https://arseed.web3infra.dev'
    }
    try {
      const order = await createAndSubmitItem(data, opts, cfg)
      if (order) {
        const tx = await payBill(order)
        if (tx) {
          const params = {
            useraddress: account,
            title: inputValue,
            contractName: gameItem.contractName,
            link: `https://arseed.web3infra.dev/${order.itemId}`
          }
          const res: any = await bschttp.post(`/v0/posts`, params)
          if (res.data.code === 1) {
            setLending(false)
            history.push({
              pathname: `/MyPage`
            })
            toastify.success('succeed')
          } else {
            setLending(false)
            toastify.error(res.message || res.data.message)
          }
        }
      }
    } catch (error) {
      setLending(false)
      toastify.error('upload failed')
    }
  }
  // const PostButtonClick = () => {
  //   console.log(value.length)
  // }
  const TitleInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setInputValue(val)
  }, [])

  return (
    <WritePostsBox>
      <Title>Title</Title>
      <div className="flex flex-v-center">
        <input type="text" placeholder="Posts Title" value={inputValue} onChange={TitleInputChange} />
        {Object.keys(gameItem).length ? (
          <div className="gameName Abbreviation cursor" onClick={() => setShowGameList(!showGameList)}>
            <img src={gameItem.image} />
            {gameItem.contractName}
          </div>
        ) : (
          <img src={gameIcon} className="ganmeIcon cursor" onClick={() => setShowGameList(!showGameList)} />
        )}
      </div>
      {showGameList ? (
        <GameList className="flex wrap">
          {gameData.map((item: any, index: any) => (
            <GameListItem key={index} className="flex flex-v-center cursor" onClick={() => GameListItemClick(item)}>
              <img src={item.image} />
              <div className="contractName">{item.contractName}</div>
            </GameListItem>
          ))}
        </GameList>
      ) : (
        ''
      )}
      <RichTextEditor value={value} onChange={setValue} placeholder="Posts Content" id="rte" />
      {/* <TextareaBox>
        <div className="toolbar flex flex-v-center">
          <input id="file" type="file" accept="image/png, image/jpeg" onChange={insertImgChange} />
          <img src={picIcon} onClick={addImg} />
          <img src={boldIcon} onClick={boldClick} />
          <img src={ltalicIcon} onClick={tiltClick} />
          <img src={underlinedIcon} onClick={underscoreClick} />
        </div>
        <ContentEditableDiv id="ContentEditable" contentEditable="true" onKeyUp={keyEnter}>
          <div>
            <br />
          </div>
        </ContentEditableDiv>
      </TextareaBox> */}
      <div className="postButton text-center cursor" onClick={PostButtonClick}>
        Post
        {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
      </div>
    </WritePostsBox>
  )
}
