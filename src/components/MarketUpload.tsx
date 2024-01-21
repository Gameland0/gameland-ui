import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import EditorJS from '@editorjs/editorjs'
import { useHistory } from 'react-router-dom'
import needIcon from '../assets/Market/red_str.png'
import writeIcon from '../assets/Market/icon_write.png'
import uploadBg from '../assets/Market/upload_div_bg.png'
import uploadIcon from '../assets/Market/icon_upload.png'
import chooseIcon from '../assets/Market/icon_choose.png'
import arrow from '../assets/icon_select.svg'
import { Editor } from './WritePosts'
import { bschttp, uploadhttp } from './Store'
import { toastify } from './Toastify'
import { useActiveWeb3React, useFactoryContract } from '../hooks'
import BigNumber from 'bignumber.js'
import { fetchReceipt, generateRandomString } from '../utils'


const MarketUploadBox = styled.div`
  .main_title {
    font-size: 30px;
    font-weight: bold;
    color: #222222;
    margin-bottom: 30px;
    b {
      width: 4px;
      height: 20px;
      background: #0090FF;
      color: #0090FF;
      border-radius: 2px;
    }
  }
  .min_title {
    position: relative;
    font-size: 20px;
    font-weight: bold;
    color: #555555;
    display: inline-block !important;
    img {
      position: absolute;
      right: -12px;
      top: 3px;
    }
  }
  input {
    width: 80%;
    height: 58px;
    border: 0;
    outline: none;
    border-radius: 20px;
    padding-left: 10px;
    font-size: 16px;
  }
  .tip_title {
    font-size: 16px;
    font-weight: 400;
    color: #888888;
    margin-bottom: 10px;
  }
  .centerBox {
    width: 70%;
    margin: auto;
  }
`

const EditModelBox = styled.div`
  padding-top: 40px;
  .inputDiv {
    position: relative;
    height: 60px;
    border: 1px solid #B3E2FF;
    box-shadow: 3px 2px 10px 0px #FFFFFF, -3px -2px 8px 0px rgba(109,119,128,0.2);
    border-radius: 20px;
    margin-bottom: 30px;
    line-height: 60px;
    .text {
      padding-left: 30px;
    }
    .choose {
      position: absolute;
      width: 100%;
      padding: 10px;
      background: #3eb6ff;
      z-index: 10;
      border-radius: 20px;
      div {
        height: 60px;
        font-size: 20px;
        font-weight: bold;
        color: #FFFFFF;
        line-height: 60px;
        padding-left: 10px;
        border-radius: 20px;
        cursor: pointer;
        &:hover {
          background-color: #87d1ff;
        }
      }
    }
  }
  .nameInput {
    width: 80%;
    padding-left: 30px;
  }
  .typeInput {
    width: 40%;
    color: #0090FF;
  }
  .categoryInput {
    width: 80%;
    color: #0090FF;
  }
  .addTags {
    width: 38px;
    height: 20px;
    background: #0090FF;
    color: #fff;
    border-radius: 40%;
    font-size: 20px;
    line-height: 20px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  .ruleOption {
    margin: 30px 0;
    .Optio {
      width: 48%;
      .item {
        font-size: 16px;
        color: #555555;
        margin-top: 20px;
        .circle {
          width: 26px;
          height: 26px;
          border: 2px solid #0090FF;
          border-radius: 13px;
          margin-right: 10px;
        }
        img {
          margin-right: 10px;
        }
      }
    }
  }
  .nextBotton {
    width: 150px;
    height: 55px;
    background: #0090FF;
    border-radius: 20px;
    margin: auto;
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 55px;
    margin-bottom: 50px;
  }
  .TagsChoose {
    position: absolute;
    top: 25px;
    width: 35%;
    height: 240px;
    padding: 10px;
    background: #3eb6ff;
    border-radius: 20px;
    z-index: 10;
    overflow-y: scroll;
    div {
      height: 60px;
      font-size: 20px;
      font-weight: bold;
      color: #FFFFFF;
      line-height: 60px;
      padding-left: 10px;
      border-radius: 20px;
      cursor: pointer;
      &:hover {
        background-color: #87d1ff;
      }
    }
    input {
      height: 40px;
    }
  }
  .tagsItem {
    height: 20px;
    background: #0090FF;
    color: #fff;
    border-radius: 30%;
    padding: 0 10px;
    margin-right: 10px;
  }
  .PermissionNFT {
    font-size: 20px;
    font-weight: bold;
    color: #555555;
    margin-bottom: 22px;
  }
`

const UploadFile = styled.div`
  margin-bottom: 50px;
  .uploadDiv {
    width: 80%;
    margin: auto;
    .fileList {
      margin-left: 15px;
      .title {
          font-size: 20px;
          color: #222222;
      }
    }
  }
  .uploadButton {
    width: 60%;
    height: 380px;
    background: url(${uploadBg});
    background-size: 100% 380px;
    img {
      position: absolute;
      z-index: 99;
    }
  }
  #file {
    width: 100%;
    height: 380px;
    opacity: 0;
  }
  .SubmitBottun {
    width: 10%;
    height: 40px;
    border: 1px solid #0090FF;
    color: #0090FF;
    border-radius: 20px;
    line-height: 40px;
    margin: auto;
    margin-top: 30px;
  }
`

const Switch = styled.div`
  .connectingLine {
    width: 100px;
    height: 2px;
    background: #0090FF;
    border-radius: 1px;
    margin: 0 50px;
  }
  .dashed {
    border: 2px dashed #0090FF;
  }
  .solid {
    border: 2px solid #0090FF;
  }
  .circle {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    line-height: 60px;
    font-size: 30px;
    color: #0090FF;
    margin-right: 20px;
  }
`

export const MarketUpload = () => {
  const { account, library, chainId } = useActiveWeb3React()
  const FactoryContract =useFactoryContract()
  const [edit, setEdit] = useState('Model')
  const [type, setType] = useState('Models')
  const [category, setCategory] = useState('Character')
  const [nameInputValue, setNameInputValue] = useState('')
  const [amountInputValue, setAmountInputValue] = useState('')
  const [priceInputValue, setPriceInputValue] = useState('')
  const [tagsInputValue, setTagsInputValue] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState('')
  const [showType, setShowType] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [Reload, setReload] = useState(false)
  const [Tags, setTags] = useState([] as any)
  const [files, setFiles] = useState([] as any)
  const history = useHistory()
  const Header = require('@editorjs/header')
  const List = require('@editorjs/list')
  const Image = require('@editorjs/image')
  const Checklist = require('@editorjs/checklist')
  const Quote = require('@editorjs/quote')
  const Delimiter = require('@editorjs/delimiter')
  const Table = require('@editorjs/table')

  useEffect(() => {
    if (edit==='Model') {
      new EditorJS({
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
    }
    // getindex()
  }, [Reload,edit])

  const getindex = async () => {
    const list = await FactoryContract?.getnftfactory_list()
    // console.log(list)
    const address = await FactoryContract?.getfactorys('5')
    // console.log(address)
  }

  useEffect(() => {
    if (edit==='Upload') {
      const inputDom = document.getElementById('file')
      inputDom?.setAttribute('multiple', '')
    }
  }, [edit])

  const blobToDataURI = (blob: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = (e) => {
        resolve(e.target?.result)
      }
    })
  }

  const setTypeData = (type: string) => {
    setType(type)
    setShowType(false)
  }

  const setCategoryData = (type: string) => {
    setCategory(type)
    setShowCategory(false)
  }

  const addTags = (tags: string) => {
    if (Tags.length === 5) {
      toastify.error('You can add up to 5 tags')
      return
    }
    let tagsArr = Tags
    tagsArr.push(tags)
    setTags(tagsArr)
    setShowTags(false)
    setTagsInputValue('')
  }

  const Enter = (e: any) => {
    if (e.keyCode === 13) {
      if (tagsInputValue) {
        addTags(tagsInputValue)
      }
    }
  }

  const next = () => {
    if (!nameInputValue) {
      toastify.error('name cannot be empty')
      return
    }
    if (!Tags.length) {
      toastify.error('Tags cannot be empty')
      return
    }
    if (!permissions) {
      toastify.error('Please select permissions')
      return
    }
    const domcontent = document.getElementsByClassName('codex-editor__redactor')[0]?.innerHTML
    if (!domcontent) {
      toastify.error('description cannot be empty')
      return
    }
    if (permissions === 'Pay') {
      if (!priceInputValue) {
        toastify.error('price cannot be empty')
        return
      }
      if (!amountInputValue) {
        toastify.error('amount cannot be empty')
        return
      }
    }
    setDescription(domcontent)
    setEdit('Upload')
  }

  const Upload = () => {
    const fileInput = document.getElementById('file')
    fileInput?.click()
  }

  const uploadChange = async (e: any) => {
    if (files.length >= 4) {
      toastify.error('Up to three files can be uploaded at one time')
      return
    }
    const filearr = files
    for (let index = 0; index < e.target.files.length; index++) {
      const element = e.target.files[index];
      filearr.push(element)
    }
    setFiles(filearr)
    setReload(!Reload)
  }

  const uploadButton = async () => {
    if (!nameInputValue) {
      toastify.error('name cannot be empty')
      return
    }
    if (!Tags.length) {
      toastify.error('Tags cannot be empty')
      return
    }
    if (!permissions) {
      toastify.error('Please select permissions')
      return
    }
    if (!description) {
      toastify.error('description cannot be empty')
      return
    }
    let nftAddress
    let nftAmount
    let price
    let random
    if (permissions === 'open') {
      nftAddress = ''
      nftAmount = 0
      price = '0'
      random = ''
    }
    const Filename = [] as any
    let fileSize = 0
    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      fileSize = fileSize + element.size
      Filename.push(element.name)
    }
    
    if (permissions === 'Pay') {
      if (!priceInputValue) {
        toastify.error('price cannot be empty')
        return
      }
      if (!amountInputValue) {
        toastify.error('amount cannot be empty')
        return
      }
      random = generateRandomString()
      const userNmae = await bschttp.get(`v0/userinfo/${account}`)
      price = priceInputValue
      nftAmount = amountInputValue
      const creatNFT = await FactoryContract?.createnft(
        nameInputValue,
        userNmae.data.data[0].username,
        `https://upload-api.gameland.network/v0/readfile?contract=${random}&filename=`,
        new BigNumber(priceInputValue).multipliedBy(1000000000000000000).toString(),
        account,
        nftAmount,
        `https://upload-api.gameland.network/v0/upload?filename=${Filename+''}`
      )
      const receipt = await fetchReceipt(creatNFT.hash, library)
      if (!receipt.status) {
        throw Error('Failed to deposit.')
      } else {
        nftAddress = receipt.logs[0].address
      }
    }
    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      const form = new FormData()
      form.append('files',element)
      uploadhttp.post('v0/upload',form).then((res) => {
        if (res.data.code) {
          toastify.success('Upload successful')
        }
      })
    }
    let size
    if (fileSize/1000 > 1 && fileSize/1000 < 1024) {
      size = fileSize/1000 + 'KB'
    } else if (fileSize/1000 > 1024) {
      size = fileSize/1000/1024 + 'MB'
    } else {
      size = fileSize
    }
    const parm = {
      type: type,
      name: nameInputValue,
      description: description,
      permissions: permissions,
      tags: Tags+'',
      user: account,
      originalFilename: Filename+'',
      fileAmount: Filename.length,
      fileSize: size,
      nftAddress: nftAddress,
      price: price,
      nftAmount: Number(nftAmount),
      coding: random
    }
    uploadhttp.post('v0/fileInfo', parm).then((res) => {
      if (res.data.code) {
        history.push({
          pathname: `/Market`
        })
      }
    })
  }

  const nameInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setNameInputValue(val)
  }, [])
  const amountInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setAmountInputValue(val)
  }, [])
  const priceInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setPriceInputValue(val)
  }, [])

  const tagsInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTagsInputValue(val)
  }, [])

  return (
    <MarketUploadBox>
      <div className="container">
        <div className="centerBox">
          {edit==='Model'? (
            <EditModelBox>
              <div className="main_title"><b>|</b> Edit model</div>
              <div className='min_title'>
                Name
                <img src={needIcon} alt="" />
              </div>
              <div className="inputDiv nameInput">
                <img src={writeIcon} alt="" />
                <input type="text" onChange={nameInputChange} value={nameInputValue}/>
              </div>
              <div className='min_title'>
                Type
                <img src={needIcon} alt="" />
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
                <img src={needIcon} alt="" />
              </div>
              <div className="tip_title">Search or create tags for your model</div>
              <div className="relative flex">
                {Tags&&Tags.length? (
                  Tags.map((item: any, index: number) => (
                    <div className="tagsItem" key={index}>{item}</div>
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
                <img src={needIcon} alt="" />
              </div>
              <div className="tip_title">Tell us what your model does</div>
              <Editor id="editor"></Editor>
              <div className="ruleOption flex flex-column-between">
                <div className="Optio">
                  <div className='min_title'>
                    When using this model,I give permission for users to:
                    <img src={needIcon} alt="" />
                  </div>
                  <div className="flex item">
                    {permissions === 'open' ? (
                      <img src={chooseIcon} alt="" />
                    ) : (
                      <div className="circle" onClick={() => setPermissions('open')}></div>
                    )}
                    Use without permissions
                  </div>
                  <div className="flex item">
                    {permissions === 'Pay' ? (
                      <img src={chooseIcon} alt="" />
                    ) : (
                      <div className="circle" onClick={() => setPermissions('Pay')}></div>
                    )}
                    Use different permissions on merges
                  </div>
                </div>
              </div>
              {permissions === 'Pay'? (
                <div>
                  <div className='PermissionNFT'>Create Permission NFT</div>
                  <div className='min_title'>
                    Price per NFT
                    <img src={needIcon} alt="" />
                  </div>
                  <div className="inputDiv nameInput">
                    <img src={writeIcon} alt="" />
                    <input type="text" onChange={priceInputChange} value={priceInputValue}/>
                    {chainId===56?'BNB':chainId===1?'ETH':'MATIC'}
                  </div>
                  <div className='min_title'>
                    NFT Amount
                    <img src={needIcon} alt="" />
                  </div>
                  <div className="inputDiv nameInput">
                    <img src={writeIcon} alt="" />
                    <input type="text" onChange={amountInputChange} value={amountInputValue}/>
                  </div>
                </div>
              ) : ''}
              <div className="nextBotton text-center cursor" onClick={next}>Next</div>
            </EditModelBox>
          ) : ''}
          {edit==='Upload'? (
            <UploadFile>
              <div className="main_title"><b>|</b> Upload files</div>
              <div className="uploadDiv flex">
                <div className="uploadButton flex flex-center relative" onClick={Upload}>
                  <img src={uploadIcon} alt="" />
                  <input id="file" type="file" onChange={uploadChange} />
                </div>
                <div className="fileList">
                  <div className="title">file list:</div>
                  {files&&files.length ? (
                    files.map((item: any,index: number) => (
                      <div key={index}>{item.name}</div>
                    ))
                  ) : ''}
                </div>
              </div>
              <div className="SubmitBottun text-center cursor" onClick={uploadButton}>Submit</div>
            </UploadFile>
          ) : '' }
          <Switch>
            <div className="main_title"><b>|</b> Publish a Model</div>
            <div className="switchOption flex flex-center">
              <div className="flex flex-v-center cursor" onClick={() => setEdit('Model')}>
                <div className={edit==='Model'? 'circle solid text-center': 'circle dashed text-center'}>1</div>
                Edit model
              </div>
              <div className="connectingLine"></div>
              <div className="flex flex-v-center cursor" onClick={() => setEdit('Upload')}>
                <div className={edit==='Upload'? 'circle solid text-center': 'circle dashed text-center'}>2</div>
                Upload files
              </div>
            </div>
          </Switch>
        </div>
      </div>
    </MarketUploadBox>
  )
}