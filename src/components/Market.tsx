import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { uploadhttp } from './Store'
import ModelsIcon from '../assets/Market/icon_models.png'
import selectedModelsIcon from '../assets/Market/icon_models_selected.png'
import DatasetsIcon from '../assets/Market/icon_Datasets.png'
import selectedDatasetsIcon from '../assets/Market/icon_Datasets_selected.png'
import magnifier from '../assets/magnifier.png'
import MultimodalIcon from '../assets/Market/icon_Multimodal.png'
import rowIcon from '../assets/Market/Row_item_icon.png';
import dataItemBg from '../assets/Market/data_item.png'
import dataItemBgHover from '../assets/Market/data_item_hover.png'
import titleIcon from '../assets/Market/icon_data_title.png'
import downloadIcon from '../assets/Market/icon_download.png'
import uploadTimeIcon from '../assets/Market/icon_download_time.png'
import likeIcon from '../assets/Market/icon_like.png'

const MarketBox = styled.div`
  width: 100%;
  .filterMenu {
    margin-bottom: 32px;
    min-height: 660px;
    .leftMenu {
      width: 30%;
      background: #FFFFFF;
      padding: 20px 15px 0 15px;
      .seachTaskInput {
        width: 100%;
        height: 40px;
        background: #FFFFFF;
        border: 1px solid #B3E2FF;
        box-shadow: 3px 2px 10px 0px #FFFFFF, -3px -2px 8px 0px rgba(109,119,128,0.2);
        border-radius: 20px;
        padding-left: 30px;
        input {
          width: 85%;
          height: 38px;
          border: 0;
          outline: none;
          border-radius: 20px;
        }
        .magnifier {
          margin-left: 20px;
          width: 15px;
          height: 15px;
        }
      }
      .Multimodal {
        margin-top: 40px;
        .title {
          font-size: 20px;
          color: #222222;
          margin-bottom: 20px;
          img {
            width: 31px;
            height: 31px;
            margin-right: 10px;
            margin-top: -5px;
          }
        }
        .Row {
          margin-bottom: 10px;
        }
        .thirdRow {
          width: 195px;
          height: 30px;
        }
        .searchOptions {
          cursor: pointer;
          position: relative;
          background: #FFFFFF;
          font-size: 14px;
          color: #555555;
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
    }
    .rightData {
      width: 70%;
      background: #F8F8F8;
      padding: 20px 10px 0 10px;
      .Tabs {
        font-size: 22px;
        font-weight: bold;
        color: #222222;
        img {
          width: 35px;
          height: 35px;
          margin-right: 10px;
          margin-top: -5px;
        }
      }
      .seachNameInput {
        width: 371px;
        height: 40px;
        padding-left: 25px;
        margin: 20px 0;
        input {
          width: 85%;
          height: 38px;
          border: 0;
          outline: none;
          border-radius: 20px;
        }
        .magnifier {
          margin-left: 20px;
          width: 15px;
          height: 15px;
        }
      }
      .updata {
        margin: 20px 0;
        width: 133px;
        height: 34px;
        background: #0090FF;
        border-radius: 17px;
        color: #FFFFFF;
        font-size: 16px;
        line-height: 34px;
      }
    }
  }
  .comingsoon {
    text-align: center;
    color: #000;
    font-size: 22px;
    margin: auto;
  }
`
export const ModelsContent = styled.div`
  .DataItem {
    padding: 14px 20px;
    width: 32%;
    height: 88px;
    background: url(${dataItemBg});
    background-size: 100% 88px;
    &:hover {
      background: url(${dataItemBgHover});
      background-size: 100% 88px;
      .title {
        color: #009DFF;
      }
    }
    .title {
      font-size: 18px;
      color: #222222;
      img {
        margin-right: 10px;
      }
    }
    .info {
      margin-top: 10px;
      div {
        font-size: 12px;
        color: #888888;
        img {
          margin-right: 5px;
        }
      }
    }
  }
`
const DatasetsContent = styled.div``

export const Market = () => {
  const [ContentTabs, setContentTabs] = useState('Models')
  const [tagsInputValue, setTagsInputValue] = useState('')
  const [fileDataAll, setFileDataAll] = useState([] as any)
  const [ModelData, setModelData] = useState([] as any)
  const [DatasetsData, setDatasetsData] = useState([] as any)
  const history = useHistory()

  useEffect(()=> {
    getFileData()
  },[])

  const getFileData = async () => {
    const fileData = await uploadhttp.get(`v0/fileInfo`)
    setFileDataAll(fileData.data.data)
    const filterModel = fileData.data.data.filter((item: any) => {
      return item.type === 'Models' && item.state > 0
    })
    const filterDatasets = fileData.data.data.filter((item: any) => {
      return item.type === 'Datasets' && item.state > 0
    })
    setModelData(filterModel)
    setDatasetsData(filterDatasets)
  }

  const toUpload = () => {
    history.push({
      pathname: `/Market/Upload`
    })
  }
  const toDataInfo = (item: any) => {
    const parms = {
      Browse: item.Browse + 1
    }
    uploadhttp.put(`v0/fileInfo/${item.id}`, parms)
    history.push({
      pathname: `/Market/Details/${item.id}`
    })
  }

  const seachFiles = (tags: string) => {
    let filterModel
    let filterDatasets
    if (tags === 'All') {
      filterModel = fileDataAll.filter((item: any) => {
        return item.type === 'Models'
      })
      filterDatasets = fileDataAll.filter((item: any) => {
        return item.type === 'Datasets'
      })
      setModelData(filterModel)
      setDatasetsData(filterDatasets)
    } else {
      const filterData = fileDataAll.filter((item: any) => {
        return item.tags.indexOf(tags) !== -1
      })
      filterModel = filterData.filter((item: any) => {
        return item.type === 'Models'
      })
      filterDatasets = filterData.filter((item: any) => {
        return item.type === 'Datasets'
      })
      setModelData(filterModel)
      setDatasetsData(filterDatasets)
    }
  }

  const Enter = (e: any) => {
    if (e.keyCode === 13) {
      seachFiles(tagsInputValue)
    }
  }

  const tagsInputChange = useCallback((ele) => {
    const val = ele.currentTarget.value
    setTagsInputValue(val)
  }, [])

  return (
    <MarketBox>
      <div className="container filterMenu flex flex-justify-content">
        <div className="leftMenu">
          <div className="seachTaskInput">
            <input
              type="text"
              placeholder="Seach name or tags"
              value={tagsInputValue}
              onChange={tagsInputChange}
              onKeyDown={(e) => Enter(e)}
            />
            <img className="magnifier cursor" src={magnifier} alt="" />
          </div>
          <div className="Multimodal">
            <div className="title">
              <img src={MultimodalIcon} alt="" />
              Multimodal
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('All')}>
                All
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Summarization')}>
                Summarization
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Conversational')}>
                Conversational
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Feature Extraction')}>
                Feature Extraction
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Text-to-lmage')}>
                Text-to-lmage
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('lmage-to-Text')}>
                lmage-to-Text
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Text-to-Video')}>
                Text-to-Video
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Visual Question Answering')}>
                Visual Question Answering
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Text-to-3D')}>
                Text-to-3D
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('lmage-to-3D')}>
                lmage-to-3D
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Translation')}>
                Translation
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Table Question Answering')}>
                Table Question Answering
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Multiple Choice')}>
                Multiple Choice
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Question Answering')}>
                Question Answering
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Text Retrieval')}>
                Text Retrieval
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions" onClick={()=>seachFiles('Fill-Mask')}>
                Fill-Mask
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Table to Text')}>
                Table to Text
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions" onClick={()=>seachFiles('Text Generation')}>
                Text Generation
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="thirdRow searchOptions" onClick={()=>seachFiles('Graph Machine Learning')}>
              Graph Machine Learning
              <img src={rowIcon} alt="" />
            </div>
          </div>
        </div>
        <div className="rightData">
          <div className="Tabs flex flex-around">
            <div className="cursor" onClick={() => setContentTabs('Models')}>
              <img src={ContentTabs==='Models'? selectedModelsIcon:ModelsIcon} alt="" />
              Models
            </div>
            <div className="cursor" onClick={() => setContentTabs('Datasets')}>
              <img src={ContentTabs==='Datasets'? selectedDatasetsIcon:DatasetsIcon} alt="" />
              Datasets
            </div>
          </div>
          <div className="flex flex-column-between">
            <div className="seachNameInput">
              {/* <input
                type="text"
                placeholder="Filter by name"
              />
              <img className="magnifier cursor" src={magnifier} alt="" /> */}
            </div>
            <div className="updata text-center cursor" onClick={toUpload}><b>+</b> Upload</div>
          </div>
          {ContentTabs==='Models'? (
            <ModelsContent className="flex flex-column-between wrap">
              {ModelData&&ModelData.length? (
                ModelData.map((item: any, index: number) => (
                  <div className="DataItem cursor" key={index} onClick={() => toDataInfo(item)}>
                    <div className="title flex flex-v-center">
                      <img src={titleIcon} alt="" />
                      {item.fileName}
                    </div>
                    <div className="info flex flex-v-center flex-column-between">
                      <div className="flex flex-v-center">
                        <img src={downloadIcon} alt="" />
                        {item.download}
                      </div>
                      <div className="flex flex-v-center">
                        <img src={uploadTimeIcon} alt="" />
                        {item.uploadTime.slice(0,10)}
                      </div>
                      <div className="flex flex-v-center">
                        <img src={likeIcon} alt="" />
                        {item.like}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="comingsoon">No data...</div>
              )}
            </ModelsContent>
          ) : ''}
          {ContentTabs==='Datasets'? (
            <ModelsContent className="flex flex-column-between wrap">
              {DatasetsData&&DatasetsData.length? (
                DatasetsData.map((item: any, index: number) => (
                  <div className="DataItem cursor" key={index} onClick={() => toDataInfo(item)}>
                    <div className="title flex flex-v-center">
                      <img src={titleIcon} alt="" />
                      {item.fileName}
                    </div>
                    <div className="info flex flex-v-center flex-column-between">
                      <div className="flex flex-v-center">
                        <img src={downloadIcon} alt="" />
                        {item.download}
                      </div>
                      <div className="flex flex-v-center">
                        <img src={uploadTimeIcon} alt="" />
                        {item.uploadTime.slice(0,10)}
                      </div>
                      <div className="flex flex-v-center">
                        <img src={likeIcon} alt="" />
                        {item.like}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="comingsoon">No data...</div>
              )}
            </ModelsContent>
          ) : ''}
        </div>
      </div>
    </MarketBox>
  )
}
