import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import ModelsIcon from '../assets/Market/icon_models.png'
import selectedModelsIcon from '../assets/Market/icon_models_selected.png'
import DatasetsIcon from '../assets/Market/icon_Datasets.png'
import selectedDatasetsIcon from '../assets/Market/icon_Datasets_selected.png'
import magnifier from '../assets/magnifier.png'
import MultimodalIcon from '../assets/Market/icon_Multimodal.png'
import rowIcon from '../assets/Market/Row_item_icon.png';

const MarketBox = styled.div`
  width: 100%;
  .filterMenu {
    margin-bottom: 32px;
    min-height: 650px;
    .leftMenu {
      width: 41%;
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
          height: 30px;
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
      width: 59%;
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
        background: #FFFFFF;
        border: 1px solid #B3E2FF;
        box-shadow: 3px 2px 10px 0px #FFFFFF, -3px -2px 8px 0px rgba(109,119,128,0.2);
        border-radius: 20px;
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
  }
`
const DataContent = styled.div``

export const Market = () => {
  const [ContentTabs, setContentTabs] = useState('Models')

  return (
    <MarketBox>
      <div className="container filterMenu flex flex-justify-content">
        <div className="leftMenu">
          <div className="seachTaskInput">
            <input
              type="text"
              placeholder="Filter Tasks by name..."
            />
            <img className="magnifier cursor" src={magnifier} alt="" />
          </div>
          <div className="Multimodal">
            <div className="title">
              <img src={MultimodalIcon} alt="" />
              Multimodal
            </div>
            <div className="Row flex">
              <div className="searchOptions">
                Feature Extraction
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions">
                Text-to-lmage
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions">
                lmage-to-Text
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="Row flex">
              <div className="searchOptions">
                Text-to-Video
                <img src={rowIcon} alt="" />
              </div>
              <div className="searchOptions">
                Visual Question Answering
                <img src={rowIcon} alt="" />
              </div>
            </div>
            <div className="thirdRow searchOptions">
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
              <input
                type="text"
                placeholder="Filter by name"
              />
              <img className="magnifier cursor" src={magnifier} alt="" />
            </div>
            <div className="updata text-center cursor"><b>+</b> Upload</div>
          </div>
          <div className="comingsoon">No data...</div>
        </div>
      </div>
      {/* <div className="comingsoon">coming soon...</div> */}
    </MarketBox>
  )
}
