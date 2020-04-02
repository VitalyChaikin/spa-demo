import React, { useState, useEffect, useRef } from 'react'
// import { useStores } from '../hooks/use-stores'
import { useHistory } from 'react-router'
//import { Link } from 'react-router-dom'



interface INavPanelState {  
  items: Array<any>
  activeItem: number,
  isKeyboardActive: boolean
}
const NavPanel = (props:any):React.ReactElement => {
  const { push } = useHistory()
  //const { myStore } = useStores()
  const [state, _setState] = useState<INavPanelState>({
    items: ['Button1/search', 'Button2/list', 'Button3/files'],
    activeItem: 0,
    isKeyboardActive: false
  })
  
  // define a ref, for use inside event Listener !
  const actualStateRef:any = useRef<INavPanelState>(state)

  // in place of original `setState`
  const setState = (x:any) => {
    actualStateRef.current = x // keep updated
    _setState(x)
  }

  const { items, activeItem, isKeyboardActive } = actualStateRef.current // state

  useEffect(() => {
    // console.log('NP: componentDidMount')
    //console.log('NP: useEffect')
    if(window.location.pathname === '/') {
      if(!isKeyboardActive) {
        console.log('NP: addEventListener')
        document.addEventListener('keydown', keyboardNavPanel, false)
        setState({ ...actualStateRef.current, isKeyboardActive: true })
      }
    }
    // return () => {
    //   console.log('NP: componentWillUnmount')
    //   if(isKeyboardActive) {
    //     console.log('removeEventListener')
    //     document.removeEventListener('keydown', keyboardNavPanel, false)
    //     // setState({ ...actualStateRef.current, isKeyboardActive: false })
    //   }
    // }
  })  // []


  useEffect(() => {
    //console.log('NP: useEffect set state by nested path')
    const curPath:string = window.location.pathname  // "/files/1"
    let nestedPath:string = curPath
    let n:number = curPath.indexOf('/', 1)
    if(n !== -1) nestedPath = nestedPath.slice(0,n)
    //console.log('nestedPath', nestedPath)
    if(nestedPath.length > 1) {   // skip '' and '/'
      let newActiveItem:INavPanelState['activeItem'] = -1
      items.forEach( (item:any, index:number) => {
        if(item.indexOf(nestedPath) !== -1)
          newActiveItem = index
      });
      if(activeItem !== newActiveItem && newActiveItem !== -1) {
        //console.log('NP: SET state by nested path')
        updateActiveItem(newActiveItem)
      }
    }
  })

  const keyboardNavPanel = (event:any) => {
    let { activeItem: newActiveItem } = actualStateRef.current    

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
      console.log('NP: navigateActiveItem =', newActiveItem)
      navigateActiveItem(null)      
      // console.log('items[newActiveItem] =', items[newActiveItem])
      // console.log('items[newActiveItem].id =', items[newActiveItem].id)      
    }

    // ESC || Arrow_Left
    // if (event.keyCode === 27 || event.keyCode === 37) {
    //   event.preventDefault()
    //   push('/')
    // }

    //console.log(event.keyCode)
  }

  const getItemCaption = ( item:any ):string => {
    // 'Button1/search'
    const sCaption:string = item.slice(0,item.indexOf('/'))
    //console.log('getItemCaption', sCaption)
    return sCaption
  }

  const getItemNavigation = ( item:any ):string => {
    // 'Button1/search'
    const sCaption:string = item.slice(item.indexOf('/'))
    // console.log('getItemNavigation', sCaption)
    return sCaption
  }

  const updateActiveItem = ( newActiveItem:INavPanelState['activeItem'] ):void => {
    //console.log('updateActiveItem')
    setState({ ...actualStateRef.current, activeItem: newActiveItem })
  }

  // <Link to={'/list/' + buildTopicId(item.id.toString())}></Link>
  const navigateActiveItem = (event:any | null):void => {
    const { items, activeItem, isKeyboardActive } = actualStateRef.current
    // if(event === null)
    //    console.log('navigateActiveItem', event, activeItem)
    if(event !== null) {
      // console.log('navigateActiveItem', event, parseInt(event.target.getAttribute('data-idx')))
      updateActiveItem(parseInt(event.target.getAttribute('data-idx')))
    }
    const cTopicId = getItemNavigation(items[event === null ? activeItem : parseInt(event.target.getAttribute('data-idx'))])
    //console.log('navigateActiveItem::cTopicId', cTopicId)
    if(isKeyboardActive) {
      document.removeEventListener('keydown', keyboardNavPanel, false)
      //console.log('navigateActiveItem::removeEventListener')
      setState({ ...actualStateRef.current, isKeyboardActive: false })
    } //else
      //console.log('Keyboard is NOT Active')    
    
    push(cTopicId)
  }
  //</Link>

  // if(window.location.pathname === '/') {
  //   if(!isKeyboardActive) {
  //     console.log('addEventListener')
  //     document.addEventListener('keydown', keyboardNavPanel, false)
  //     setState({ ...actualStateRef.current, isKeyboardActive: true })
  //   }
  // } else {
  //   if(isKeyboardActive) {
  //     console.log('removeEventListener')
  //     document.removeEventListener('keydown', keyboardNavPanel, false)
  //     setState({ ...actualStateRef.current, isKeyboardActive: false })
  //   }
  // }

  // isKeyboardActive
  //console.log('NP: render: ', window.location.pathname)
  let thList:Array<any> = []
  items.map( (item:any,index:number) =>
    thList.push(
      <li key={index} id={index===activeItem ? 'activeItem' : 'passiveItem'} onClick={navigateActiveItem} data-idx={index}>
          {getItemCaption(item)}
      </li>
    )
  )

  return (
    <div className='NavPanel'>
      <ul className='ulNavPanel'>
        {thList}        
      </ul>
    </div>
  )
}

export default NavPanel
