import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { i18nChangeLanguage } from '@wangeditor/editor'
import { useHistory, useParams } from 'react-router-dom'
import { Contract } from '@ethersproject/contracts'
import { bschttp, uploadhttp } from './Store'
import { toastify } from './Toastify'
import { Modal } from '../components/Modal'
import { useActiveWeb3React } from '../hooks'
import whiteStrIcon from '../assets/Market/icon_white_str.png'
import redStrIcon from '../assets/Market/icon_red_str.png'
import DetailsIcon from '../assets/Market/icon_Details.png'
import rowIcon from '../assets/Market/Row_item_icon.png'
import like from '../assets/Market/like.png'
import likes from '../assets/Market/likes.png'
import likeIcon from '../assets/Market/icon_like.png'
import download from '../assets/Market/download.png'
import pay from '../assets/Market/pay.png'
import downloadIcon from '../assets/Market/icon_download.png'
import share from '../assets/Market/share.png'
import viewer from '../assets/Market/icon_Viewer.png'
import defaults from '../assets/default.png'
import writeIcon from '../assets/Market/icon_write.png'
import arrow from '../assets/icon_select.svg'
import NFTAbi from '../constants/Abis/NFT.json'
import { fetchReceipt } from '../utils'
import BigNumber from 'bignumber.js'
import { handleClick } from './Header'
import { BSC_CHAIN_ID_HEX, BSC_RPC_URL, ETH_CHAIN_ID_HEX, ETH_RPC_URL, POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL } from '../constants'
import { EditModelBox, MarketUploadBox } from './MarketUpload'


const DataInfoBox = styled.div`
  padding-top: 40px;
  .whiteStrIcon {
    width: 17px;
    height: 16px;
    background-image: url(${whiteStrIcon});
  }
  .redStrIcon {
    width: 17px;
    height: 16px;
    background-image: url(${redStrIcon});
  }
  .image-tool__image-picture {
    width: 100%;
    height: 100%;
  }
`

const LeftInfo = styled.div`
  width: 65%;
  .title {
    font-size: 28px;
    font-weight: bold;
    color: #222222;
    margin-right: 30px;
  }
  .borders {
    width: 2px;
    height: 12px;
    background: #0090FF;
    border-radius: 1px;
    margin-right: 10px;
  }
  .Tags {
    div {
      padding: 0 10px;
      border: 1px solid #DDDDDD;
      border-radius: 10px;
      font-size: 12px;
      color: #888888;
      margin-right: 10px;
      margin-bottom: 30px;
    }
  }
  .effectPreview {
    min-height: 640px;
    width: 90%;
    margin: auto;
    margin-bottom: 20px;
  }
`

const RightInfo = styled.div`
  width: 35%;
  .Details {
    font-size: 16px;
    color: #222222;
    img {
      margin-right: 5px;
    }
    margin-bottom: 12px;
    .Edit {
      width: 100px;
      margin-left: 300px;
      border: 1px solid #0090FF;
      color: #0090FF;
      border-radius: 15px;
      text-align: center;
    }
  }
  .hr {
    width: 100%;
    height: 2px;
    background: #EEEEEE;
  }
  .fileInfo {
    padding-top: 18px;
    margin-bottom: 50px;
    .infoItem {
      margin-bottom: 30px;
      .title {
        width: 120px;
        font-size: 16px;
        color: #222222;
      }
      .content {
        font-size: 14px;
        color: #555555;
      }
      .Row {
        position: relative;
        height: 30px;
        border: 1px solid #DDDDDD;
        border-radius: 15px;
        padding: 5px 20px;
        margin-right: 10px;
        img {
          position: absolute;
          right: -3px;
          bottom: -3px;
        }
      }
    }
    .func {
      padding-top: 6px;
      width: 60px;
      height: 168px;
      background: #F8F8F8;
      border: 2px solid #FFFFFF;
      box-shadow: 0px 0px 12px 0px rgba(34,94,131,0.2);
      border-radius: 30px;
      position: absolute;
      top: 50px;
      right: 6px;
      img {
        width: 48px;
        height: 48px;
      }
    }
  }
  .infoBorder {
    width: 100%;
    border: 1px solid;
    border-image: linear-gradient(190deg, #BBE5FF, #FFFFFF) 10 10;
    box-shadow: 0px 0px 8px 0px rgba(0,114,255,0.14);
    border-radius: 10px;
    padding: 0 20px;
    margin-bottom: 20px;
  }
  .fileNumber {
    height: 50px;
    line-height: 50px;
  }
  .Reviews {
    height: 80px;
    color: #222222;
    .title {
      font-size: 16px;
    }
    .scoreInfo {
      margin-top: 12px;
      img {
        width: 17px;
        height: 17px;
        margin-right: 5px;
      }
    }
    .addReview {
      width: 110px;
      height: 20px;
      background: #FFFFFF;
      border: 1px solid #0090FF;
      border-radius: 10px;
      font-size: 14px;
      color: #0090FF;
      line-height: 20px;
      margin-left: 40px;
    }
    .defaultReview {
      width: 110px;
      height: 20px;
      background: #ccc;
      border: 1px solid #cccccc;
      border-radius: 10px;
      font-size: 14px;
      color: #807979;
      margin-left: 40px;
    }
  }
  .userInfo {
    height: 100px;
    padding: 15px 20px;
    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      margin-right: 9px;
    }
    .followButton {
      width: 80px;
      height: 24px;
      background: #0090FF;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 14px;
      line-height: 24px;
    }
    .unfollowButton {
      width: 80px;
      height: 24px;
      background: red;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 14px;
      line-height: 24px;
    }
    .statistical {
      margin-top: 16px;
      div {
        margin-right: 30px;
        img {
          margin-right: 5px;
        }
      }
      
    }
  }
  .ReviewButton {
    margin: auto;
    width: 100%;
    height: 30px;
    background: red;
    color: #FFFFFF;
    font-size: 20px;
    line-height: 30px;
    border-radius: 15px;
  }
`

export const MarketDataInfo = () => {
  const { account, library, chainId } = useActiveWeb3React()
  const { id } = useParams() as any
  const [Reload, setReload] = useState(false)
  const [likeState, setLikeState] =useState(false)
  const [editModal, setEditModal] =useState(false)
  const [showType, setShowType] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [dataInfo, setDataInfo] = useState({} as any)
  const [userInfo, setUserInfo] = useState({} as any)
  const [statistics, setStatistics] = useState({} as any)
  const [myLike, setMyLike] =useState({} as any)
  const [dataInfoAll, setDataInfoAll] = useState([] as any)
  const [Tags, setTags] = useState([] as any)
  const [editTags, setEditTags] = useState([] as any)
  const [followeDataAll, setFolloweDataAll] = useState([] as any)
  const [PayState, setPayState] = useState(0)
  const [score, setScore] = useState(0)
  const [myScore, setMyScore] = useState(0)
  const [fileScore, setFileScore] = useState(0)
  const [saleNFTAmount, setSaleNFTAmount] = useState(0)
  const [nameInputValue, setNameInputValue] = useState('')
  const [type, setType] = useState('Models')
  const [tagsInputValue, setTagsInputValue] = useState('')
  const history = useHistory()
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState('')
  const toolbarConfig: Partial<IToolbarConfig> = {}
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: 'Please enter content...',
    MENU_CONF: {
      uploadImage: {
        base64LimitSize: 5*1024*1024,
        maxFileSize: 5*1024*1024
      }
    }
  }
  i18nChangeLanguage('en')

  useEffect(() => {
    if (editModal) {
      return () => {
        if (editor == null) return
        editor.destroy()
        setEditor(null)
      }
    }
  }, [editor,editModal])

  useEffect(() => {
    getData()
  }, [id, Reload, account])

  useEffect(() => {
    if (dataInfo.nftAddress) {
      getPayState()
    }
    if (dataInfo.userAddress) {
      getUserInfo()
    }
  }, [dataInfo, Reload, account])

  // useEffect(() => {
  //   if (dataInfo.permissions === 'open') {
  //     openDownlaod()
  //   }
  //   if (PayState) {
  //     Downlaod()
  //   }
  // }, [dataInfo, PayState])

  const getData = async () => {
    const data = await uploadhttp.get(`v0/fileInfo`)
    setDataInfoAll(data.data.data)
    const findData = data.data.data.filter((item: any) => {
      return item.id === id
    })
    setType(findData[0].type)
    setNameInputValue(findData[0].fileName)
    setDataInfo(findData[0])
    if (findData[0].nftAddress) {
      const saleNFTcount = await uploadhttp.get(`v0/purchaseRecord?buyID=${findData[0].id}`)
      setSaleNFTAmount(saleNFTcount.data.data.length)
    }
    const tagsArr = findData[0].tags.split(",")
    setTags(tagsArr)
    setEditTags(tagsArr)
    const findUserFileData = data.data.data.filter((item: any) => {
      return item.userAddress === findData[0].userAddress
    })
    let browse = 0
    let like = 0
    let download = 0
    findUserFileData.map((item: any) => {
      browse = browse + item.Browse
      like = like + item.like
      download = download + item.download
    })
    setStatistics({
      browseTotal: browse,
      likeTotal: like,
      downloadTotal: download
    })
    if (!document.getElementById('effectPreview')?.innerText) {
      const Dom = document.createElement('div')
      Dom.innerHTML = findData[0].description
      document.getElementById('effectPreview')?.appendChild(Dom)
      const divdom = document.getElementsByClassName('ce-paragraph')
      for (let index = 0; index < divdom.length; index++) {
        const element = divdom[index]
        element.removeAttribute('contenteditable')  
      }
      const h2dom = document.getElementsByClassName('ce-header')
      for (let i= 0; i< h2dom.length; i++) {
        const element = h2dom[i]
        element.removeAttribute('contenteditable')  
      }
      const cdxinput = document.getElementsByClassName('cdx-input')
      for (let j= 0; j < cdxinput.length; j++) {
        const element = cdxinput[j]
        element?.remove()
      }
      cdxinput[cdxinput.length-1]?.remove()
      const cdxbutton = document.getElementsByClassName('cdx-button')
      for (let k= 0; k < cdxbutton.length; k++) {
        console.log(k)
        const element = cdxbutton[k]
        element.remove()
      }
      cdxbutton[cdxbutton.length-1]?.remove()
    }
    const likeData = await uploadhttp.get(`v0/likeFile?userAddress=${account}&likeID=${id}`)
    if (likeData.data.data.length) {
      setLikeState(true)
      setMyLike(likeData.data.data[0])
    }
    const scoreData = await uploadhttp.get(`v0/fileScore?fileID=${id}`)
    if (scoreData.data.data.length) {
      const myscore = scoreData.data.data.filter((item: any) => {
        return item.fileID === id && item.scoreAddress === account
      })
      setMyScore(myscore[0]?.score)
      let filescore = 0
      scoreData.data.data.map((item: any) => {
        filescore = filescore + item.score
      })
      setFileScore(filescore/scoreData.data.data.length)
    }
    bschttp.get(`v0/followe`).then((vals) => setFolloweDataAll(vals.data.data))
  }

  const getPayState = async () => {
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const balance = await NFTContract.balanceOf(account)
    setPayState(balance.toNumber())
  }

  const getFolloweState = () => {
    const data = followeDataAll.filter((item: any) => {
      return item.useraddress === account && item.followeUserAddress === dataInfo.userAddress
    })
    return data.length
  }

  const getUserInfo = async () => {
    const userdata = await bschttp.get(`v0/userinfo/${dataInfo.userAddress}`)
    setUserInfo(userdata.data.data[0])
  }

  const Pay = async () => {
    if (!dataInfo.nftAddress) {
      return
    }
    if (dataInfo.chain === 'bsc') {
      handleClick(BSC_CHAIN_ID_HEX, BSC_RPC_URL)
    } else if (dataInfo.chain === 'polygon') {
      handleClick(POLYGON_CHAIN_ID_HEX, POLYGON_RPC_URL)
    } else if (dataInfo.chain === 'eth') {
      handleClick(ETH_CHAIN_ID_HEX,ETH_RPC_URL)
    }
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const price = await NFTContract.get_price()
    const payNFT = await NFTContract.Mint({
      value: price.toString()
    })
    const receipt = await fetchReceipt(payNFT.hash, library)
    if (!receipt.status) {
      throw Error('Failed to deposit.')
    } else {
      const tokenid = new BigNumber(receipt.logs[0].topics[3]).toString()
      const daat = {
        name: dataInfo.fileName,
        description: 'No description yet',
        image: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2F1683c771-e13a-a1d3-4aa7-715b124fc38c%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1708069173&t=d103d370a800e8b8a5347ecb0e9a6736'
      }
      const jsonString = JSON.stringify(daat)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const formData = new FormData()
      formData.append('files', blob, `${tokenid+1}.json`)
      uploadhttp.post(`v0/upload/matedata`,formData)
      const parm = {
        user: account,
        buyID: dataInfo.id
      }
      uploadhttp.post('v0/purchaseRecord', parm)
      setReload(!Reload)
      toastify.success('Pay successful')
    }
  }

  const Downlaod = async () => {
    const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
    const fileURL = await NFTContract.getdownloadlink()
    const href = fileURL.toString()
    const Adom = document.getElementById('ALabel')
    Adom?.setAttribute('href', href)
  }

  const Downlaodfile = async () => {
    let arr: any
    if (dataInfo.permissions === 'Pay') {
      const NFTContract = new Contract(dataInfo.nftAddress, NFTAbi, library?.getSigner())
      const fileURL = await NFTContract.getdownloadlink()
      const href = fileURL.toString()
      arr = href.split(",")
    } else {
      const file = await uploadhttp.get(`v0/fileURL/${id}?user=${account}&permissions=${dataInfo.permissions}`)
      const fileURL = file.data.data[0]?.file
      arr = fileURL.split(",")
    }
    
    // const newarr = ['000.rar','666.zip']
    for (let i = 0; i < arr.length; i++) {
      const iframe = document.createElement('a')
      iframe.style.display = 'none'
      iframe.style.height = '0px'
      iframe.target = '_blank'
      const httpurl = process.env.NODE_ENV === 'production' ? 'https://upload-api.gameland.network' : 'http://localhost:8096'
      iframe.href = `${httpurl}/v0/upload?filename=${arr[i]}`
      iframe.click()
    }
  }

  const openDownlaod = async () => {
    const file = await uploadhttp.get(`v0/fileURL/${id}?user=${account}&permissions=${dataInfo.permissions}`)
    const fileURL = file.data.data[0]?.file
    const arr = fileURL.split(",")
    let href
    if (arr.length>1) {
      href = `https://upload-api.gameland.network/v0/upload?filename=${fileURL}`
    } else {
      href = `https://upload-api.gameland.network/v0/upload?filename=${fileURL}`
    }
    const Adom = document.getElementById('ALabel')
    Adom?.setAttribute('href', href)
  }

  const countDownload = () => {
    const parm = {
      download: dataInfo.download + 1
    }
    uploadhttp.put(`v0/fileInfo/${id}`, parm)
  }

  const countLike = () => {
    if (dataInfo.userAddress === account) {
      return
    }
    const parm = {
      user: account,
      likeID: id
    }
    uploadhttp.post(`v0/likeFile`, parm).then((res)=> {
      if (res.data.code) {
        const parms = {
          like: dataInfo.like + 1
        }
        uploadhttp.put(`v0/fileInfo/${id}`, parms)
        setReload(!Reload)
        toastify.success('successful')
      }
    })
  }
  const unLike = () => {
    uploadhttp.delete(`v0/likeFile/${myLike.id}`).then((res)=> {
      if (res.data.code) {
        setReload(!Reload)
        toastify.success('successful')
      }
    })
  }

  const addFileScore = () => {
    if (score<1) {
      toastify.error('score cannot be empty')
      return
    }
    const parm = {
      user: account,
      fileID: id,
      score: score
    }
    uploadhttp.post('v0/fileScore', parm).then((res)=> {
      if (res.data.code) {
        toastify.success('Score successful')
      }
    })
  }
  const Followe = async () => {
    const params = {
      useraddress: account,
      followeUserAddress: dataInfo.userAddress
    }
    const res: any = await bschttp.post(`v0/followe`, params)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setReload(!Reload)
    } else {
      throw res.message || res.data.message
    }
  }
  const UnFollowe = async () => {
    const data = followeDataAll.filter((item: any) => {
      return item.useraddress === account && item.followeUserAddress === dataInfo.userAddress
    })
    const res: any = await bschttp.delete(`v0/followe/${data[0].id}`)
    if (res.data.code === 1) {
      toastify.success('succeed')
      setReload(!Reload)
    } else {
      throw res.message || res.data.message
    }
  }
  const Remove = () => {
    const parm = {
      state: 0
    }
    uploadhttp.put(`v0/fileInfo/${id}`, parm).then((res) => {
      toastify.success('succeed')
      history.push({
        pathname: `/Market`
      })
    }).catch((err) => {
      toastify.error(err.message)
    })
  }

  const setTypeData = (type: string) => {
    setType(type)
    setShowType(false)
  }

  const Enter = (e: any) => {
    if (e.keyCode === 13) {
      if (tagsInputValue) {
        addTags(tagsInputValue)
      }
    }
  }

  const addTags = (tags: string) => {
    if (Tags.length === 5) {
      toastify.error('You can add up to 5 tags')
      return
    }
    let tagsArr = Tags
    tagsArr.push(tags)
    setEditTags(tagsArr)
    setShowTags(false)
    setTagsInputValue('')
  }

  const deleteTags = (tags: string) => {
    const filterData = Tags.filter((item: any) => {
      return item !== tags
    })
    setEditTags(filterData)
  }

  const updataModel = () => {
    const description = document.getElementById('w-e-textarea-1')?.innerHTML
    const parm = {
      type: type,
      name: nameInputValue,
      description: description,
      tags: Tags+''
    }
    uploadhttp.put(`v0/fileInfo/${dataInfo.id}`,parm).then((res)=> {
      if (res.data.code) {
        toastify.success('successful')
        setReload(!Reload)
        setEditModal(false)
      }
    }).catch((err) => {
      toastify.error(err.message || err)
    })
  }

  const deleteModel = () => {
    uploadhttp.delete(`v0/fileInfo/${dataInfo.id}`).then((res)=> {
      if (res.data.code) {
        toastify.success('successful')
        history.push({
          pathname: `/Market`
        })
      }
    }).catch((err) => {
      toastify.error(err.message || err)
    })
  }

  const nameInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setNameInputValue(val)
  }, [])

  const tagsInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTagsInputValue(val)
  }, [])

  return (
    <DataInfoBox className="container flex">
      <Modal footer={null} onCancel={() => setEditModal(false)} open={editModal} destroyOnClose closable={false}>
        <MarketUploadBox>
          <EditModelBox>
            <div className="main_title"><b>|</b> Edit model</div>
            <div className='min_title'>
              Name
            </div>
            <div className="inputDiv nameInput">
              <img src={writeIcon} alt="" />
              <input type="text" onChange={nameInputChange} value={nameInputValue}/>
            </div>
            <div className='min_title'>
              Type
            </div>
            <div className="inputDiv typeInput" onClick={() => {setShowType(!showType);setShowTags(false)}}>
              <div className="text">{type}</div>
              <img src={arrow} className="arrowIcon" />
              {showType? (
                <div className="choose">
                  <div onClick={() => setTypeData('Models')}>Models</div>
                  <div onClick={() => setTypeData('Datasets')}>Datasets</div>
                </div>
              ) : ''}
            </div>
            <div className='min_title'>
              Tags
            </div>
            <div className="tip_title">Search or create tags for your model</div>
            <div className="relative flex">
              {editTags&&editTags.length? (
                editTags.map((item: any, index: number) => (
                  <div className="tagsItem cursor" key={index} onClick={() => deleteTags(item)}>{item}</div>
                ))
              ) :''}
              <div className="addTags text-center cursor" onClick={() => {setShowTags(!showTags);setShowType(false)}}>+</div>
              {showTags? (
                <div className="TagsChoose">
                  <div onClick={() => addTags('Feature Extraction')}>Feature Extraction</div>
                  <div onClick={() => addTags('Text-to-lmage')}>Text-to-lmage</div>
                  <div onClick={() => addTags('lmage-to-Text')}>lmage-to-Text</div>
                  <div onClick={() => addTags('Text-to-Video')}>Text-to-Video</div>
                  <div onClick={() => addTags('Visual Question Answering')}>Visual Question Answering</div>
                  <div onClick={() => addTags('Graph Machine Learning')}>Graph Machine Learning</div>
                  <div onClick={() => addTags('Summarization')}>Summarization</div>
                  <div onClick={() => addTags('Conversational')}>Conversational</div>
                  <div onClick={() => addTags('Text-to-3D')}>Text-to-3D</div>
                  <div onClick={() => addTags('lmage-to-3D')}>lmage-to-3D</div>
                  <div onClick={() => addTags('Translation')}>Translation</div>
                  <div onClick={() => addTags('Multiple Choice')}>Multiple Choice</div>
                  <div onClick={() => addTags('Question Answering')}>Question Answering</div>
                  <div onClick={() => addTags('Text Retrieval')}>Text Retrieval</div>
                  <div onClick={() => addTags('Fill-Mask')}>Fill-Mask</div>
                  <div onClick={() => addTags('Table to Text')}>Table to Text</div>
                  <div onClick={() => addTags('Text Generation')}>Text Generation</div>
                  <div onClick={() => addTags('Table Question Answering')}>Table Question Answering</div>
                  <input type="text" onChange={tagsInputChange} value={tagsInputValue} onKeyDown={(e) => Enter(e)}/>
                </div>
              ) : ''}
            </div>
            <div className='min_title'>
              About your model
            </div>
            <div className="tip_title">Tell us what your model does</div>
            <>
              <div style={{ border: '1px solid #ccc', zIndex: 100}}>
                <Toolbar
                  editor={editor}
                  defaultConfig={toolbarConfig}
                  mode="default"
                  style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                  defaultConfig={editorConfig}
                  value={html}
                  onCreated={setEditor}
                  onChange={editor => setHtml(editor.getHtml())}
                  mode="default"
                  style={{ height: '500px', overflowY: 'hidden' }}
                />
              </div>
            </>
            <div className="flex flex-around">
              <div className="nextBotton text-center cursor" onClick={updataModel}>Updata</div>
              <div className="deleteBotton text-center cursor" onClick={deleteModel}>Delete</div>
            </div>
          </EditModelBox>
        </MarketUploadBox>
      </Modal>
      <LeftInfo>
        <div className="first flex flex-v-center">
          <div className="title">{dataInfo.fileName}</div>
          <div className="score flex flex-v-center">
            <div className="borders"></div>
            <div className={fileScore>=1 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=2 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=3 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=4 ? 'redStrIcon':'whiteStrIcon'}></div>
            <div className={fileScore>=5 ? 'redStrIcon':'whiteStrIcon'}></div>
          </div>
        </div>
        <div className="Tags flex">
          {Tags&&Tags.length?(
            Tags.map((item: any, index: number) => (
              <div key={index}>{item}</div>
            ))
          ):''}
        </div>
        <div id="effectPreview" className="effectPreview"></div>
      </LeftInfo>
      <RightInfo>
        <div className="Details flex flex-v-center">
          <img src={DetailsIcon} alt="" />
          Details
          {/* {dataInfo.permissions === 'open' && dataInfo.userAddress === account ? (
            <div className="Edit cursor" onClick={() => {setEditModal(true);setHtml(dataInfo.description)}}>Edit</div>
          ):''} */}
        </div>
        <div className="hr"></div>
        <div className="fileInfo relative">
          <div className="infoItem flex">
            <div className="title">Type:</div>
            <div className="content Row">
              {dataInfo.type}
              <img src={rowIcon} alt="" />
            </div>
          </div>
          <div className="infoItem flex">
            <div className="title">Downloads:</div>
            <div className="content">{dataInfo.download}</div>
          </div>
          <div className="infoItem flex">
            <div className="title">File Size:</div>
            <div className="content">{dataInfo.fileSize}</div>
          </div>
          <div className="infoItem flex">
            <div className="title">Uploaded:</div>
            <div className="content">{dataInfo.uploadTime?.slice(0,10)}</div>
          </div>
          {dataInfo.nftAddress ? (
            <div className="infoItem flex">
              <div className="title">NFT Mint:</div>
              <div className="content">
                {saleNFTAmount}/{dataInfo.nftAmount}
              </div>
            </div>
          ) : ''}
          {dataInfo.nftAddress ? (
            <div className="infoItem flex">
              <div className="title">NFT Price:</div>
              <div className="content">
                {dataInfo.price} {dataInfo.chain === 'eth' ? 'ETH': dataInfo.chain === 'bsc' ? 'BNB':'MATIC'}
              </div>
            </div>
          ) : ''}
          {dataInfo.nftAddress ? (
            <div className="infoItem flex">
              <div className="title">NFT Address:</div>
              <div className="content">
                {dataInfo.nftAddress}
              </div>
            </div>
          ) : ''}
          <div className="func flex wrap flex-justify-content">
            {likeState? (
              <img src={likes} onClick={unLike} alt="" />
            ):(
              <img className={dataInfo.userAddress === account ? 'not-allowed':'cursor'} onClick={countLike} src={like} alt="" />
            )}
            {dataInfo.permissions === 'open' || PayState || dataInfo.userAddress === account ? (
              <a id="ALabel" onClick={Downlaodfile}>
                <img className="cursor" onClick={countDownload} src={download} alt="" />
              </a>
            ) : (
              <img className="cursor" onClick={Pay} src={pay} alt="" />
            )}
            <img className="not-allowed" src={share} alt="" />
          </div>
        </div>
        <div className="fileNumber infoBorder relative">
          {dataInfo.fileAmount} Files
        </div>
        <div className="Reviews infoBorder relative flex flex-v-center flex-column-between">
          <div>
            <div className="title">
              Score
            </div>
            {myScore? (
              <div className="scoreInfo flex">
                <div className={myScore>=1 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=2 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=3 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=4 ? 'redStrIcon':'whiteStrIcon'}></div>
                <div className={myScore>=5 ? 'redStrIcon':'whiteStrIcon'}></div>
                &nbsp;{myScore} out of 5
              </div>
            ) : (
              <div className="scoreInfo flex">
                <div className={score>=1 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(1)}></div>
                <div className={score>=2 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(2)}></div>
                <div className={score>=3 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(3)}></div>
                <div className={score>=4 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(4)}></div>
                <div className={score>=5 ? 'redStrIcon':'whiteStrIcon cursor'} onClick={()=> setScore(5)}></div>
                &nbsp;{score} out of 5
              </div>
            )}
          </div>
          {myScore? (
            <div className="defaultReview text-center not-allowed">Add Score</div>
          ):(
            <div className="addReview text-center cursor" onClick={addFileScore}>Add Score</div>
          )}
        </div>
        <div className="userInfo infoBorder relative">
          <div className="flex flex-column-between flex-v-center">
            <div className="flex flex-v-center">
              <img className="avatar" src={userInfo.image} alt="" />
              <div className="userName">{userInfo.username}</div>
            </div>
            {dataInfo.userAddress!==account ? (
              getFolloweState() ? (
                <div className="unfollowButton text-center cursor" onClick={UnFollowe}>-Follow</div>
              ) : (
                <div className="followButton text-center cursor" onClick={Followe}>+Follow</div>
              )
            ) : ''}
          </div>
          <div className="statistical flex">
            <div className="flex flex-v-center">
              <img src={viewer} alt="" />
              {statistics.browseTotal}
            </div>
            <div className="flex flex-v-center">
              <img src={likeIcon} alt="" />
              {statistics.likeTotal}
            </div>
            <div className="flex flex-v-center">
              <img src={downloadIcon} alt="" />
              {statistics.downloadTotal}
            </div>
          </div>
        </div>
        {account === '0x7a387E6f725a837dF5922e3Fe71827450A76A3E5' ? (
          <div className="ReviewButton text-center cursor" onClick={Remove}>
            Remove
          </div>
        ) : ''}
      </RightInfo>
    </DataInfoBox>
  )
}