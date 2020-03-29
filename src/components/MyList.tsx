import React, { useState, useEffect } from 'react'
// import { useStores } from '../hooks/use-stores'
import { Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom'

export interface IMyListState {
  error: any,
  isLoaded: boolean,
  items: Array<any>
}
const MyList = ():React.ReactElement => {
  let { path } = useRouteMatch()
  //let { topicId } = useParams();

  //const { myStore } = useStores()
  const [state, setState] = useState<IMyListState>({
    error: null,
    isLoaded: false,
    items: []
  })

  useEffect(() => {
    const { isLoaded } = state
    if (!isLoaded)
      fetch('http://localhost:3000/listItems.txt')
        .then(res => res.json())
        .then(
          result => {
            setState({
              error: null,
              isLoaded: true,
              items: result.items
            })
          },
          // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
          // чтобы не перехватывать исключения из ошибок в самих компонентах.
          error => {
            setState({
              error,
              isLoaded: true,              
              items: []
            })
          }
        )
  })
  const { error, isLoaded, items } = state

  let thList:Array<any> = []
  if (error) {
    console.log('error.message', error.message)
    thList.push(<div key='lLoading'>Ошибка: {error.message}</div>)
  } else if (!isLoaded) {
    // console.log('Загрузка')
    thList.push(<div key='lLoading'>Загрузка данных ...</div>)
  } else {
    items.map(item =>
      thList.push(
        <li key={item.id.toString()}>
          <Link to={'/list/' + buildTopicId(item.id.toString())}>
            {item.name} <br />{' '}
            <span className='ulMyList-li-2line'>бюджет: {item.price}</span>
          </Link>
        </li>
      )
    )
    // console.log("thList",thList.length)
    // ======================================== RETURN ====================================
    return (
      <div className='MyList'>
        <div className='MyListLeftPanel'>
          <ul className='ulMyList'>{thList}</ul>
        </div>
        <div className='MyListRightPanel'>
          <Switch>
            <Route exact path={path}>
              <h3>
                В левой части список полученный с сервера
                <br />
                Выберите элемент списка, чтобы получить детальную информацию.
                <br />
                <br />
                Router ссылки отрабатывают корректно. Обновление страницы по
                ссылке - работает.
                <br />
              </h3>
            </Route>
            <Route path={`${path}/:topicId`}>
              <Topic items={state.items} />
            </Route>
          </Switch>
        </div>
      </div>
    )
  }
  // ============================ ERROR/LOADING =================================
  return <div className='MyList'>{thList}</div>
}

function buildTopicId (cID:string):string {
  return 'item' + cID
}

interface IuseParams {
  topicId: string
}
function Topic (props:Pick<IMyListState,'items'>):React.ReactElement {
  // The <Route> that rendered this component has a
  // path of `/topics/:topicId`. The `:topicId` portion
  // of the URL indicates a placeholder that we can
  // get from `useParams()`.
  let { topicId } = useParams<IuseParams>()
  // console.log('Topic() topicId', topicId);
  //let params = useParams();
  // console.log('Topic() params', params);
  const items = props.items
  let selectedItem:any = items.find(
    item => buildTopicId(item.id.toString()) === topicId
  )
  // console.log("selectedItem",selectedItem)
  let formatedText:Array<any> = []
  let plainText:string = selectedItem.desc
  let n:number = plainText.indexOf(';')
  let key:number = 0
  while (n !== -1) {
    key++
    let leftText:string = plainText.substring(0, n)
    formatedText.push(
      <span key={key}>
        {leftText}
        <br />
      </span>
    )
    plainText = plainText.substring(n + 1)
    n = plainText.indexOf(';')
  }
  formatedText.push(<span key='formatedtext'>{plainText}</span>)

  return (
    <div className='MyListRightPanelText'>
      <p>{formatedText}</p>
    </div>
  )
}

export default MyList
