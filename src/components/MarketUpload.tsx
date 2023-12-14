import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import EditorJS from '@editorjs/editorjs'
import needIcon from '../assets/Market/red_str.png'
import writeIcon from '../assets/Market/icon_write.png'
import uploadBg from '../assets/Market/upload_div_bg.png'
import uploadIcon from '../assets/Market/icon_upload.png'
import arrow from '../assets/icon_select.svg'
import { Editor } from './WritePosts'
import { toastify } from './Toastify'

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
    margin-bottom: 10px;
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
    margin-top: 30px;
    .Optio {
      width: 48%;
      div {
        font-size: 16px;
        color: #555555;
        margin-bottom: 20px;
        .circle {
          width: 26px;
          height: 26px;
          border: 2px solid #0090FF;
          border-radius: 13px;
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
    font-size: 20px;
    font-weight: bold;
    color: #FFFFFF;
    line-height: 55px;
    margin-bottom: 50px;
  }
`

const UploadFile = styled.div`
  margin-bottom: 50px;
  .uploadDiv {
    width: 80%;
    height: 380px;
    background: url(${uploadBg});
    background-size: 100% 380px;
    margin: auto;
  }
  #file {
    display: none;
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
  const [edit, setEdit] = useState('Model')
  const [type, setType] = useState('Checkpoint')
  const [category, setCategory] = useState('Character')
  const [showType, setShowType] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const Header = require('@editorjs/header')
  const List = require('@editorjs/list')
  const Image = require('@editorjs/image')
  const Checklist = require('@editorjs/checklist')
  const Quote = require('@editorjs/quote')
  const Delimiter = require('@editorjs/delimiter')
  const Table = require('@editorjs/table')

  useEffect(() => {
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
  }, [])

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

  const next = () => {
    setEdit('Upload')
  }

  const Upload = () => {
    const fileInput = document.getElementById('file')
    fileInput?.click()
  }
  const ImgChange = async (e: any) => {
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
    // reader.onload = (res) => {
    //   const imgData = res.target?.result
    //   ImgTransaction(imgData, type)
    // }
  }

  return (
    <MarketUploadBox>
      <div className="container">
        {edit==='Model'? (
          <EditModelBox>
            <div className="main_title"><b>|</b> Edit model</div>
            <div className='min_title'>
              Name
              <img src={needIcon} alt="" />
            </div>
            <div className="inputDiv nameInput">
              <img src={writeIcon} alt="" />
              <input type="text" />
            </div>
            <div className='min_title'>
              Type
              <img src={needIcon} alt="" />
            </div>
            <div className="inputDiv typeInput" onClick={() => setShowType(!showType)}>
              <div className="text">{type}</div>
              <img src={arrow} className="arrowIcon" />
              {showType? (
                <div className="choose">
                  <div onClick={() => setTypeData('Checkpoint')}>Checkpoint</div>
                  <div onClick={() => setTypeData('Embedding')}>Embedding</div>
                  <div onClick={() => setTypeData('Hypernetwork')}>Hypernetwork</div>
                  <div onClick={() => setTypeData('Aesthetic Gradient')}>Aesthetic Gradient</div>
                  <div onClick={() => setTypeData('LoRA')}>LoRA</div>
                  <div onClick={() => setTypeData('LyCORIS')}>LyCORIS</div>
                </div>
              ) : ''}
            </div>
            <div className='min_title'>
              Category
              <img src={needIcon} alt="" />
            </div>
            <div className="inputDiv categoryInput" onClick={() => setShowCategory(!showCategory)}>
              <div className="text">{category}</div>
              <img src={arrow} className="arrowIcon" />
              {showCategory? (
                <div className="choose">
                  <div onClick={() => setCategoryData('Character')}>Character</div>
                  <div onClick={() => setCategoryData('Style')}>Style</div>
                  <div onClick={() => setCategoryData('Celebrity')}>Celebrity</div>
                  <div onClick={() => setCategoryData('Conce')}>Conce</div>
                  <div onClick={() => setCategoryData('Clothing')}>Clothing</div>
                  <div onClick={() => setCategoryData('Base model')}>Base model</div>
                </div>
              ) : ''}
            </div>
            <div className='min_title'>
              Tags
              <div className="tip_title">Search or create tags for your model</div>
            </div>
            <div className="addTags text-center">+</div>
            <div className='min_title'>
              About your model
              <div className="tip_title">Tell us what your model does</div>
            </div>
            <Editor id="editor"></Editor>
            <div className="ruleOption flex flex-column-between">
              <div className="Optio">
                <div className='min_title'>
                  When using this model,I give permission for users to:
                </div>
                <div className="flex">
                  <div className="circle"></div>
                  Use without crediting me
                </div>
                <div className="flex">
                  <div className="circle"></div>
                  Share merges of this model
                </div>
                <div className="flex">
                  <div className="circle"></div>
                  Use different permissions on merges
                </div>
              </div>
              <div className="Optio">
                <div className='min_title'>
                  This resource:
                </div>
                <div className="flex">
                  <div className="circle"></div>
                  Depicts an actual person
                </div>
                <div className="flex">
                  <div className="circle"></div>
                  Use different permissions on merges
                </div>
              </div>
            </div>
            <div className="nextBotton text-center cursor" onClick={next}>Next</div>
          </EditModelBox>
        ) : ''}
        {edit==='Upload'? (
          <UploadFile>
            <div className="main_title"><b>|</b> Upload files</div>
            <div className="uploadDiv flex flex-center" onClick={Upload}>
              <img src={uploadIcon} alt="" />
              <input id="file" type="file" accept="" onChange={ImgChange} />
            </div>
          </UploadFile>
        ) : '' }
        <Switch>
          <div className="main_title"><b>|</b> Publish a Model</div>
          <div className="switchOption flex flex-center">
            <div className="flex flex-v-center" onClick={() => setEdit('Model')}>
              <div className={edit==='Model'? 'circle solid text-center': 'circle dashed text-center'}>1</div>
              Edit model
            </div>
            <div className="connectingLine"></div>
            <div className="flex flex-v-center" onClick={() => setEdit('Upload')}>
              <div className={edit==='Upload'? 'circle solid text-center': 'circle dashed text-center'}>2</div>
              Upload files
            </div>
          </div>
        </Switch>
      </div>
    </MarketUploadBox>
  )
}