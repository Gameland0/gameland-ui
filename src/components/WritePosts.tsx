import React, { useEffect, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import EditorJS from '@editorjs/editorjs'
import { useActiveWeb3React } from '../hooks'
import { bschttp, http, polygonhttp } from './Store'
import { fetchData } from './RelationChart'
import { createAndSubmitItem, Config, payBill } from '../utils/arseeding'
import { toastify } from './Toastify'
import { Modal } from './Modal'
import { MORALIS_KEY, PolygonContract, BscContract } from '../constants'
import picIcon from '../assets/pic_upload.svg'
import gameIcon from '../assets/icon_game.svg'
// import boldIcon from '../assets/icon_description_font_bold.svg'
// import ltalicIcon from '../assets/icon_description_font_Italic.svg'
// import underlinedIcon from '../assets/icon_description_font_underlined.svg'
import loadding from '../assets/loading.svg'
import key from '../constants/arweave-keyfile.json'
// import Arweave from 'arweave'
import ArweaveSigner from 'arseeding-arbundles/src/signing/chains/ArweaveSigner'
// import { RichTextEditor } from '@mantine/rte'
// import { AnyARecord } from 'dns'

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
    outline: none;
    border: 1px solid rgb(229, 232, 235);
    border-radius: 20px;
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
  .insertNft {
    position: relative;
    top: -36px;
    left: 16px;
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
const MyNftBox = styled.div`
  .title {
    font-size: 28px;
  }
  .NftBox {
    margin: 20px 20px 0 0;
    img {
      width: 210px;
      height: 210px;
    }
    &:hover {
      box-shadow: 0px 4px 10px 1px rgba(0, 0, 0, 0.1);
    }
  }
`
const Editor = styled.div`
  border: 1px solid rgb(229, 232, 235);
  border-radius: 20px;
  padding: 32px;
  .ce-block__content {
    margin: 0;
  }
  .ce-toolbar__content {
    margin: 0;
  }
  .cdx-search-field {
    height: 32px;
    input {
      width: 100%;
      height: 100%;
      margin: 0;
    }
  }
  .cdx-list__item {
    li {
      list-style: outside;
    }
  }
  img {
    width: 60%;
  }
`

export const WritePosts = () => {
  const { account } = useActiveWeb3React()
  const [inputValue, setInputValue] = useState('')
  // const [value, setValue] = useState('')
  const [gameItem, setGameItem] = useState({} as any)
  const [showGameList, setShowGameList] = useState(false)
  const [lending, setLending] = useState(false)
  const [showNft, setShowNft] = useState(false)
  const [gameData, setGameData] = useState([] as any)
  const [NFTData, setNFTData] = useState([] as any)
  const history = useHistory()
  const Header = require('@editorjs/header')
  const List = require('@editorjs/list')
  const Image = require('@editorjs/image')
  const Checklist = require('@editorjs/checklist')
  const Quote = require('@editorjs/quote')
  const Delimiter = require('@editorjs/delimiter')
  const Table = require('@editorjs/table')
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
    getNftData()
    const editor = new EditorJS({
      holder: 'editor',
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List
        },
        image: {
          class: Image,
          config: {
            uploader: {
              async uploadByFile(file: any) {
                return {
                  success: 1,
                  file: {
                    url: await blobToDataURI(file)
                  }
                }
              }
            }
          }
        },
        checklist: {
          class: Checklist
        },
        quote: {
          class: Quote
        },
        delimiter: {
          class: Delimiter
        },
        table: {
          class: Table
        }
      }
    })
  }, [account])
  const getNftData = () => {
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY
    const BscNft = http.get(`https://deep-index.moralis.io/api/v2/${account}/nft?chain=bsc&format=decimal`)
    const polygonNft = http.get(`
      https://deep-index.moralis.io/api/v2/${account}/nft?chain=polygon&format=decimal`)
    Promise.all([BscNft, polygonNft]).then((vals) => {
      const filterDataPolygon = vals[1].data.result.filter((item: any) => {
        return PolygonContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
      })
      const filterDataBsc = vals[0].data.result.filter((item: any) => {
        return BscContract.findIndex((ele: any) => ele.toLowerCase() === item.token_address.toLowerCase()) >= 0
      })
      const findDataBsc = fetchData(filterDataBsc, 'bsc')
      const findDataPolygon = fetchData(filterDataPolygon, 'polygon')
      Promise.all([...findDataBsc, ...findDataPolygon]).then((vals) => {
        console.log(vals)
        setNFTData(vals)
      })
    })
  }
  const GameListItemClick = (item: any) => {
    setShowGameList(false)
    setGameItem(item)
  }
  const insertNft = (img: any, name: any) => {
    const paragraph = document.getElementsByClassName('ce-paragraph')
    console.log(paragraph.length)
    const focus = paragraph[paragraph.length - 1] as HTMLElement
    focus.focus()
    const dom = `<div class="ce-block__content"><div class="cdx-block image-tool--filled"><img src=${img} /></div><div class="NftName">${name}</div></div>`
    const Dom = document.createElement('div')
    Dom.className = 'ce-block'
    Dom.innerHTML = dom
    document.getSelection()?.getRangeAt(0).insertNode(Dom)
    setShowNft(false)
  }
  const blobToDataURI = (blob: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = (e) => {
        resolve(e.target?.result)
      }
    })
  }
  const PostButtonClick = async () => {
    const domcontent = document.getElementsByClassName('codex-editor__redactor')[0]?.innerHTML
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
  //   const value = document.getElementsByClassName('codex-editor__redactor')[0]?.innerHTML
  //   console.log(value)
  // }
  const TitleInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setInputValue(val)
  }, [])

  return (
    <WritePostsBox>
      <Modal footer={null} onCancel={() => setShowNft(false)} open={showNft} destroyOnClose closable={false}>
        <MyNftBox>
          <div className="title text-center">My NFT</div>
          <div className="flex wrap">
            {NFTData && NFTData.length ? (
              NFTData.map((item: any, index: any) => (
                <div
                  className="NftBox cursor"
                  key={index}
                  onClick={() => insertNft(item.metadata?.image, item.metadata?.name)}
                >
                  <img src={item.metadata?.image} />
                </div>
              ))
            ) : (
              <div>No content yet</div>
            )}
          </div>
        </MyNftBox>
      </Modal>
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
      {/* <RichTextEditor value={value} onChange={setValue} placeholder="Posts Content" id="rte" /> */}
      <Editor id="editor"></Editor>
      <div className="insertNft cursor" onClick={() => setShowNft(true)}>
        Insert NFT
      </div>
      <div className="postButton text-center cursor" onClick={PostButtonClick}>
        Post
        {lending ? <img className="loadding" src={loadding} alt="" /> : ''}
      </div>
    </WritePostsBox>
  )
}
