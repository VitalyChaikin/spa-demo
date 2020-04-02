import React, { useState, useEffect, useRef } from 'react'
// import { useStores } from '../hooks/use-stores'
import { Switch, Route, Link, useRouteMatch, useParams } from 'react-router-dom'
import { useHistory } from 'react-router'

export interface IMyListState {
  error: any,
  isLoaded: boolean,
  items: Array<any>,
  activeItem: number
}
const MyList = ():React.ReactElement => {
  let { path } = useRouteMatch()
  const { push } = useHistory()
  //let { topicId } = useParams();

  //const { myStore } = useStores()
  const [state, _setState] = useState<IMyListState>({
    error: null,
    isLoaded: false,
    items: [],
    activeItem: 0
  })

  const thisComponentRef:any = useRef(null);  // thisComponentRef.current.focus()
  // define a ref, for use inside event Listener !
  const actualStateRef:any = useRef<IMyListState>(state)

  // in place of original `setState`
  const setState = (x:any) => {
    actualStateRef.current = x // keep updated
    _setState(x)
  }

  const { error, isLoaded, items, activeItem } = actualStateRef.current // state

  useEffect(() => {
    console.log('MyList: componentDidMount')
    thisComponentRef.current.focus()
    document.addEventListener('keydown', keyboardMyList, false)
    return () => {
      console.log('MyList: componentWillUnmount')
      document.removeEventListener('keydown', keyboardMyList, false)
    }
  }, [])

  const keyboardMyList = (event:any) => {
    let { activeItem: newActiveItem } = actualStateRef.current
    const { items } = actualStateRef.current

    let isNavigateKey = false
    if (event.keyCode === 40) {
      // KeyDown
      newActiveItem++
      isNavigateKey = true
    }
    if (event.keyCode === 38) {
      // KeyUp
      newActiveItem--
      isNavigateKey = true
    }

    let isOutofBounds = false
    if (newActiveItem < 0) isOutofBounds = true
    if (newActiveItem >= items.length) isOutofBounds = true
    
    if (isNavigateKey && !isOutofBounds) {      
      // console.log('keyboardTable setState', 'newActiveItem', newActiveItem)
      event.preventDefault()
      event.stopPropagation()
      updateActiveItem(newActiveItem)
      //setState({ ...actualStateRef.current, activeItem: newActiveItem })
    }

    // Enter || Arrow_Right
    if (event.keyCode === 13 || event.keyCode === 39) {      
      event.preventDefault()
      event.stopPropagation()
      navigateActiveItem(null)
      // console.log('newActiveItem =', newActiveItem)
      // console.log('items[newActiveItem] =', items[newActiveItem])
      // console.log('items[newActiveItem].id =', items[newActiveItem].id)      
    }

    // ESC || Arrow_Left
    if (event.keyCode === 27 || event.keyCode === 37) {
      event.preventDefault()
      event.stopPropagation()
      push('/')
    }

    //console.log(event.keyCode)
  }

  const updateActiveItem = ( newActiveItem:IMyListState['activeItem'] ):void => {
    setState({ ...actualStateRef.current, activeItem: newActiveItem })
  }

  // <Link to={'/list/' + buildTopicId(item.id.toString())}></Link>
  const navigateActiveItem = (event:any | null):void => {
    const { items, activeItem } = actualStateRef.current
    // if(event === null)
    //    console.log('navigateActiveItem', event, activeItem)
    if(event !== null) {
      // console.log('navigateActiveItem', event, parseInt(event.target.getAttribute('data-idx')))
      updateActiveItem(parseInt(event.target.getAttribute('data-idx')))
    }
    const cTopicId = '/list/' + buildTopicId(items[event === null ? activeItem : parseInt(event.target.getAttribute('data-idx'))].id.toString())
    //console.log('navigateActiveItem::cTopicId', cTopicId)
    push(cTopicId)
  }
  //</Link>

  useEffect(() => {
    const { isLoaded } = state
    let curPath:string = window.location.pathname   //  http://localhost:3000/list/item4
    const n:number = curPath.indexOf('item')
    let idItem:number = -1
    if(n > 0) {
      curPath = curPath.slice(n).replace('item','')
      idItem = parseInt(curPath)
    }
    // console.log('useEffect isLoaded=',isLoaded, 'idItem', idItem)
    
    // this.requestAnimationFrame.refs.dropdown.focus();
    if (!isLoaded)
      fetch('http://localhost:3000/listItems.txt')
        .then(res => res.json())
        .then(          
          result => {
            let idxActiveItem = 0
            if(idItem !== -1)
              result.items.forEach( (item:any, index:number) => {
                if(item.id === idItem) idxActiveItem = index
              })
            setState({
              ...actualStateRef.current,
              error: null,
              isLoaded: true,
              items: result.items,
              activeItem: idxActiveItem
            })
          },
          // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
          // чтобы не перехватывать исключения из ошибок в самих компонентах.
          error => {
            setState({
              ...actualStateRef.current,
              error,
              isLoaded: true,              
              items: []
            })
          }
        )
  }, [isLoaded])  

  let thList:Array<any> = []
  if (error) {
    console.log('error.message', error.message)
    thList.push(<div key='lLoading'>Ошибка: {error.message}</div>)
  } else if (!isLoaded) {
    // console.log('Загрузка')
    thList.push(<div key='lLoading'>Загрузка данных ...</div>)
  } else {
    //console.log('render : activeItem=',activeItem, items.length)
    items.map( (item:any,index:number) =>
      thList.push(
        <li key={item.id.toString()} id={index===activeItem ? 'activeItem' : 'passiveItem'} onClick={navigateActiveItem} data-idx={index}>
            {item.name} <br />
            <span className='ulMyList-li-2line' data-idx={index}>бюджет: {item.price}</span>          
        </li>
      )
    )
    // console.log("thList",thList.length)
    // ======================================== RETURN ====================================
    return (
      <div className='MyList' ref={thisComponentRef}>
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
                <br />
                <span className='lKey'>ESC</span>, <span className='lKey'>Enter</span>, 
                →(Enter), ←(ESC), ↑, ↓ - работают
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
  return <div className='MyList' ref={thisComponentRef}>{thList}</div>
}

function buildTopicId (cID:string):string {
  return 'item' + cID
}

interface IuseParams {
  topicId: string
}

interface ITopicProps {
  items: IMyListState['items']
}

function Topic (props:ITopicProps):React.ReactElement {
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
