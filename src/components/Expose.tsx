import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { bschttp } from './Store'
import { useActiveWeb3React } from '../hooks'
import defaultImg from '../assets/default.png'

const ExposeBox = styled.div`
  margin: auto;
  margin-top: 72px;
  width: 1600px;
  min-height: 400px;
`
const ArticleBox = styled.div`
  border-bottom: 1px solid #e5e5e5;
  font-family: Noto Sans S Chinese-Regular, Noto Sans S Chinese;
  color: #333333;
  margin-bottom: 48px;
  .information {
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .userName {
      margin: 0 16px;
      font-size: 24px;
    }
    .time {
      font-size: 24px;
      color: #999999;
    }
  }
  .title {
    font-size: 48px;
    font-family: Noto Sans S Chinese-Bold, Noto Sans S Chinese;
    font-weight: bold;
    margin: 24px 0;
  }
  .context {
    -webkit-line-clamp: 5;
  }
  .frequency {
    font-size: 18px;
    color: #d0d0d0;
    margin: 24px 0;
  }
`
export const Expose = () => {
  const { account } = useActiveWeb3React()
  const [ArticleAll, setArticleAll] = useState([] as any)
  const [userInfo, setUserInfo] = useState([] as any)
  const history = useHistory()
  const getData = async () => {
    const userdata = await bschttp.get(`v0/userinfo`)
    setUserInfo(userdata.data.data)
    const mirrowData = (await bschttp.get('v0/mirrow_article')).data.data
    mirrowData.map((item: any) => {
      item.type = 'Mirror'
    })
    const postsdata = (await bschttp.get(`v0/posts`)).data.data
    postsdata.map((item: any) => {
      item.type = 'Gameland'
    })
    const articleData = [...mirrowData, ...postsdata].filter((item) => {
      return item.is_use === 1
    })
    const arr = articleData.sort(() => {
      return Math.random() - 0.5
    })
    setArticleAll(arr)
  }
  useEffect(() => {
    getData()
  }, [account])
  const filterUserData = (item: any) => {
    if (item.type === 'Mirror') {
      return userInfo.filter((ele: any) => {
        return ele.useraddress.toLowerCase() === item.owner.toLowerCase()
      })
    } else if (item.type === 'Gameland') {
      return userInfo.filter((ele: any) => {
        return ele.useraddress.toLowerCase() === item.useraddress.toLowerCase()
      })
    }
  }
  const handleImgError = (e: any) => {
    e.target.src = defaultImg
  }
  const ItemClick = async (item: any) => {
    history.push({
      pathname: `/Article/${item.type}/${item.owner || item.useraddress}/${item.id}`
    })
    if (item.owner.toLowerCase() === account?.toLowerCase()) return
    const params = {
      view: item.view + 1
    }
    if (item.type === 'Mirror') {
      bschttp.put(`/v0/mirrow_article/${item.id}`, params)
    } else if (item.type === 'Gameland') {
      bschttp.put(`/v0/posts/${item.id}`, params)
    }
  }
  return (
    <ExposeBox>
      {ArticleAll && ArticleAll.length
        ? ArticleAll.map((item: any, index: any) => (
            <ArticleBox key={index} onClick={() => ItemClick(item)} className="cursor">
              <div className="information flex flex-v-center">
                <img src={filterUserData(item)[0].image} onError={handleImgError} />
                <div className="userName">{filterUserData(item)[0].username}</div>
                <div className="time">· {item.datetime || item.createdAt}</div>
              </div>
              <div className="title">{item.title}</div>
              <div className="context line-clamp">{item.context_text}</div>
              <div className="frequency">
                {item.view || 0} view · from {item.type}
              </div>
            </ArticleBox>
          ))
        : ''}
    </ExposeBox>
  )
}
