import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { uploadhttp } from './Store'
import whiteStrIcon from '../assets/Market/icon_white_str.png'
import effectPreviewBg from '../assets/Market/data_info_bg.png'
import DetailsIcon from '../assets/Market/icon_Details.png'
import rowIcon from '../assets/Market/Row_item_icon.png'
import like from '../assets/Market/like.png'
import likeIcon from '../assets/Market/icon_like.png'
import download from '../assets/Market/download.png'
import downloadIcon from '../assets/Market/icon_download.png'
import share from '../assets/Market/share.png'
import shareIcon from '../assets/Market/icon_share.png'
import viewer from '../assets/Market/icon_Viewer.png'
import arrow from '../assets/icon_select.svg'
import defaults from '../assets/default.png'

const DataInfoBox = styled.div`
  padding-top: 40px;
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
    height: 640px;
    width: 90%;
    margin: auto;
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
      top: 97px;
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
    padding-left: 20px;
    margin-bottom: 20px;
  }
  .fileNumber {
    height: 50px;
    line-height: 50px;
  }
  .Reviews {
    padding-top: 10px;
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
`

export const MarketDataInfo = () => {
  const { id } = useParams() as any
  const [dataInfo, setDataInfo] = useState({} as any)
  const [Tags, setTags] = useState([] as any)

  useEffect(() => {
    getData()
  }, [id])

  const getData = async () => {
    const data = await uploadhttp.get(`v0/fileInfo/${id}`)
    setDataInfo(data.data.data[0])
    const tagsArr = data.data.data[0].tags.split(",")
    setTags(tagsArr)
  }

  return (
    <DataInfoBox className="container flex">
      <LeftInfo>
        <div className="first flex flex-v-center">
          <div className="title">{dataInfo.fileName}</div>
          <div className="score flex flex-v-center">
            <div className="borders"></div>
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
          </div>
        </div>
        <div className="Tags flex">
          {Tags&&Tags.length?(
            Tags.map((item: any, index: number) => (
              <div key={index}>{item}</div>
            ))
          ):''}
        </div>
        <div className="effectPreview"></div>
      </LeftInfo>
      <RightInfo>
        <div className="Details flex flex-v-center">
          <img src={DetailsIcon} alt="" />
          Details
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
            <div className="title">Category:</div>
            <div className="content Row">
              {dataInfo.category}
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
          {/* <div className="infoItem flex">
            <div className="title">Hash:</div>
            <div className="content Row">94F45BF623</div>
          </div> */}
          <div className="func flex wrap flex-justify-content">
            <img src={like} alt="" />
            <img src={download} alt="" />
            <img src={share} alt="" />
          </div>
        </div>
        <div className="fileNumber infoBorder relative cursor">
          2 Files
        </div>
        <div className="Reviews infoBorder relative flex flex-v-center">
          <div>
            <div className="title">
              Reviews
            </div>
            <div className="scoreInfo flex">
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              <img src={whiteStrIcon} alt="" />
              &nbsp;4.95 out of 5
            </div>
          </div>
          <div className="addReview text-center cursor">Add Review</div>
          <img src={arrow} className="arrowIcon" />
        </div>
        <div className="userInfo infoBorder relative">
          <div className="flex flex-column-between flex-v-center">
            <div className="flex flex-v-center">
              <img className="avatar" src={defaults} alt="" />
              <div className="userName">Haley</div>
            </div>
            <div className="followButton text-center">Follow</div>
          </div>
          <div className="statistical flex">
            <div>
              <img src={shareIcon} alt="" />
              2.36K
            </div>
            <div>
              <img src={viewer} alt="" />
              2.36K
            </div>
            <div>
              <img src={likeIcon} alt="" />
              2.36K
            </div>
            <div>
              <img src={downloadIcon} alt="" />
              2.36K
            </div>
          </div>
        </div>
      </RightInfo>
    </DataInfoBox>
  )
}