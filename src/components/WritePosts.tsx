import React, { useEffect, useCallback, useState, useRef } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { bschttp, polygonhttp } from './Store'
import { Title } from '../pages/Rent'
import { toastify } from './Toastify'
import picIcon from '../assets/icon_pic.svg'
import gameIcon from '../assets/icon_game.svg'
import boldIcon from '../assets/icon_description_font_bold.svg'
import ltalicIcon from '../assets/icon_description_font_Italic.svg'
import underlinedIcon from '../assets/icon_description_font_underlined.svg'
import key from '../constants/arweave-keyfile.json'
import Arweave from 'arweave'
import node from '@bundlr-network/client/build/node'
import { stringify } from 'querystring'

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
const TextareaBox = styled.div`
  border-radius: 20px;
  border: 1px solid #707070;
  .toolbar {
    height: 72px;
    padding: 0 32px;
    border-bottom: 1px solid #707070;
    img {
      margin-right: 32px;
      cursor: pointer;
    }
    input {
      display: none;
    }
  }
  .addImg {
    width: 120px;
    height: 120px;
    margin: 10px;
  }
`
const ContentEditableDiv = styled.div`
  min-height: 200px;
  padding: 16px;
  outline: none;
  border: none;
  font-size: 20px;
  div {
    margin-bottom: 16px;
  }
  img {
    width: 306px;
    height: 306px;
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
  right: 40px;
  overflow: auto;
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
  const [gameItem, setGameItem] = useState({} as any)
  const [showGameList, setShowGameList] = useState(false)
  const [bold, setBold] = useState(false)
  const [tilt, setTilt] = useState(false)
  const [underscore, setUnderscore] = useState(false)
  const [imgArr, setimgArr] = useState([] as any)
  const [gameData, setGameData] = useState([] as any)
  const history = useHistory()
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
  })
  useEffect(() => {
    const getGames = async () => {
      const bsc = await bschttp.get('/v0/games')
      const polygon = await polygonhttp.get('/v0/games')
      setGameData([...bsc.data.data, ...polygon.data.data])
    }
    getGames()
  }, [])
  const boldClick = () => {
    const range = document.getSelection()?.getRangeAt(0)
    const comnode = range?.commonAncestorContainer
    const value = comnode?.nodeValue as string
    if (!value) return
    if (!bold) {
      const b = document.createElement('b')
      b.innerText = value
      comnode?.parentNode?.replaceChild(b, comnode)
      setBold(true)
    } else {
      const b = document.createElement('span')
      b.innerText = value
      comnode?.parentNode?.parentNode?.replaceChild(b, comnode?.parentNode)
      setBold(false)
    }
  }
  const tiltClick = () => {
    const range = document.getSelection()?.getRangeAt(0)
    const comnode = range?.commonAncestorContainer
    const value = comnode?.nodeValue as string
    if (!value) return
    if (!tilt) {
      const b = document.createElement('i')
      b.innerText = value
      comnode?.parentNode?.replaceChild(b, comnode)
      setTilt(true)
    } else {
      const b = document.createElement('span')
      b.innerText = value
      comnode?.parentNode?.parentNode?.replaceChild(b, comnode?.parentNode)
      setTilt(false)
    }
  }
  const underscoreClick = () => {
    const range = document.getSelection()?.getRangeAt(0)
    const comnode = range?.commonAncestorContainer
    const value = comnode?.nodeValue as string
    if (!value) return
    if (!underscore) {
      const b = document.createElement('u')
      b.innerText = value
      comnode?.parentNode?.replaceChild(b, comnode)
      setUnderscore(true)
    } else {
      const b = document.createElement('span')
      b.innerText = value
      comnode?.parentNode?.parentNode?.replaceChild(b, comnode?.parentNode)
      setUnderscore(false)
    }
  }
  const addImg = () => {
    const fileInput = document.getElementById('file')
    // const range = document.getSelection()?.getRangeAt(0)
    // const comnode = range?.commonAncestorContainer.parentNode
    // console.log(comnode)
    fileInput?.click()
  }
  const ParseDom = (ele: any) => {
    const Dom = document.createElement('div')
    Dom.innerHTML = ele
    return Dom
  }
  const keyEnter = (e: any) => {
    if (e.keyCode === 13) {
      const range = document.getSelection()?.getRangeAt(0)
      const comnode = range?.commonAncestorContainer
      const value = comnode?.nodeValue as string
      if (value) {
        const b = document.createElement('br')
        b.innerText = ''
        comnode?.parentNode?.replaceChild(b, comnode)
        setBold(false)
        setTilt(false)
        setUnderscore(false)
      }
    }
  }
  const GameListItemClick = (item: any) => {
    setShowGameList(false)
    setGameItem(item)
  }
  const PostButtonClick = async () => {
    if (!inputValue || inputValue.length < 10) return
    const dom = document.getElementById('ContentEditable')
    const domcontent = dom?.innerHTML
    const datas = {
      title: inputValue,
      collection: gameItem,
      content: domcontent
    }
    const transaction = await arweave.createTransaction({ data: JSON.stringify(datas) })
    transaction.addTag('Content-Type', 'string')
    await arweave.transactions.sign(transaction, key)
    await arweave.transactions.post(transaction)
    if (transaction) {
      const params = {
        useraddress: account,
        title: inputValue,
        contractName: gameItem.contractName,
        link: `https://arweave.net/${transaction.id}`
      }
      const res: any = await bschttp.post(`/v0/posts`, params)
      if (res.data.code === 1) {
        history.push({
          pathname: `/user/MyPage`,
          state: {
            useraddress: account
          }
        })
        toastify.success('succeed')
      } else {
        toastify.error(res.message || res.data.message)
      }
    }
  }
  const TitleInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setInputValue(val)
  }, [])
  const insertImgChange = (e: any) => {
    const Img = e.target.files[0]
    const fileSize = Img.size
    const size = fileSize / 1024
    const type = Img.type
    if (size > 5120) {
      toastify.error('Image size cannot be larger than 5MB')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(Img)
    reader.onload = (res) => {
      const arr = imgArr
      const imgData = res.target?.result
      arr.push(imgData)
      setimgArr([...arr])
      const dom = `<img className="addImg" src=${imgData} />`
      const parseDom = ParseDom(dom)
      document.getElementById('ContentEditable')?.appendChild(parseDom)
    }
  }
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
      <TextareaBox>
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
      </TextareaBox>
      <div className="postButton text-center cursor" onClick={PostButtonClick}>
        Post
      </div>
    </WritePostsBox>
  )
}
