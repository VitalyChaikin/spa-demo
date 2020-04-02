import React, { useState, useEffect, useRef } from 'react'
import { Link, Route, Switch, useRouteMatch, useParams, useHistory } from 'react-router-dom'
// import { useStores } from '../hooks/use-stores'
import Table from './Table'

const getSelectedFromPath = (cPath:string):string => {
  let result = cPath.replace('/files', '').replace('/', '')
  return result
}

interface INodeProps {
  node: INode,
  subNode: INode['nested'],
  activeItem: IMyFilesState['activeItem']
  items: IMyFilesState['items'],
  expandItem: any
}

const Node = (props:INodeProps) => {
  const { node, subNode, items, activeItem, expandItem } = props
  let childnodes:any = null
  let expanded:INode['expanded'] = false

  // the Node component calls itself if there are children
  if (subNode) {
    expanded = node.expanded
    childnodes = subNode.map(function (childnode) {
      return (
        <Node
          key={childnode.id}
          node={childnode as INode}
          subNode={(childnode as INode).nested }
          activeItem={activeItem}
          items={items}
          expandItem={expandItem}
        />
      )
    })
  }

  const expandList = (event:any) => {
    const selectedTopicId = parseInt(event.target.getAttribute('data-tag'))
    expandItem(selectedTopicId)    
  }

  // return our list element
  // display children if there are any
  return (
    <li key={node.id}>
      <Link to={'/files/' + node.id}>
        <span data-tag={node.id} onClick={expandList} id={node.id === activeItem ? 'activeItemFiles' : 'passiveItemFiles'}>
          {node.name}
        </span>
      </Link>
      {childnodes && expanded ? <ul className='ulList'>{childnodes}</ul> : null}
    </li>
  )
}

interface INodeLeaf {
  id: number,
  name: string
}

interface INode {
  id: number,
  name: string,
  expanded: boolean,
  nested: Array<INodeLeaf | INode>
}

interface IMyFilesState {
  loaded: boolean,
  activeItem: number,
  items: Array<INode>
}

const MyFiles = () => {
  //const { myStore } = useStores()
  let { path } = useRouteMatch()
  const { push } = useHistory()
  // console.log('window.location.pathname', window.location.pathname)
  // console.log('path', path)

  const [currentLink, setLink] = useState(window.location.pathname) // "/files/1"
  const [state, _setState] = useState<IMyFilesState>({
    loaded: false,
    activeItem: 1,
    // nested id = parentId * 10 +(1..9)
    items: [
      {
        id: 1,
        name: 'Папка 1',
        expanded: false,
        nested: [
          { id: 11, name: 'Папка 1 --- файл 1' },
          { id: 12, name: 'Папка 1 --- файл 2' }
        ]
      },
      {
        id: 2,
        name: 'Папка 2',
        expanded: false,
        nested: [
          { id: 21, name: 'Папка 2 --- файл 1' },
          { id: 22, name: 'Папка 2 --- файл 2' }
        ]
      },
      {
        id: 3,
        name: 'Папка 3',
        expanded: false,
        nested: [
          { id: 31, name: 'Папка 3 --- файл 1' },
          { id: 32, name: 'Папка 3 --- файл 2' }
        ]
      },
      {
        id: 4,
        name: 'Папка 4',
        expanded: false,
        nested: [
          { id: 41, name: 'Папка 4 --- файл 1' },
          { id: 42, name: 'Папка 4 --- файл 2' },
          { id: 43, name: 'Папка 4 --- файл 3' }
        ]
      },
      {
        id: 5,
        name: 'Папка 5',
        expanded: false,
        nested: [
          { id: 51, name: 'Папка 5 --- файл 1' },
          { id: 52, name: 'Папка 5 --- файл 2' }
        ]
      }
    ]
  })

  // define a ref, for use inside event Listener !
  const actualStateRef:any = useRef<IMyFilesState>(state)

  // in place of original `setState`
  const setState = (x:any) => {
    actualStateRef.current = x // keep updated
    _setState(x)
  }
  const { loaded, activeItem, items } = actualStateRef.current
  //const { currentLnk } = currentLink
  //console.log('component: loaded', loaded)

  useEffect(() => {
    //console.log('useEffect loaded = ', loaded)
    if (!loaded) {
      const currentSelectedItem = getSelectedFromPath(window.location.pathname)
      if (currentSelectedItem !== '') {
        // Expand selected item node
        let selectedTopicId:number = parseInt(currentSelectedItem)
        let selectedNodeId:number = selectedTopicId
        if (selectedTopicId >= 10)
          selectedNodeId = (selectedTopicId - (selectedTopicId % 10)) / 10

        let changed:boolean = false
        items.forEach( (item:any) => {
          if (item.id === selectedNodeId) {
            //console.log('useEffect: Switched !', item.expanded, typeof item.expanded)
            if (item.expanded !== undefined) {
              // for files in root
              item.expanded = true
              changed = true
            }
          }
        })
        if (changed) {          
          setState({ ...actualStateRef.current, loaded: true, activeItem: selectedTopicId, items: items })          
        }
      }
    }
  }, [currentLink, items, loaded])

  
  useEffect(() => {
    console.log('MyFiles: componentDidMount - addEventListener')
    // thisComponentRef.current.focus()
    document.addEventListener('keydown', keyboardMyFiles, false)
    return () => {
      console.log('MyFiles: componentWillUnmount - removeEventListener')
      document.removeEventListener('keydown', keyboardMyFiles, false)
    }
  }, [])

  const getNodeByID = (nodeId:INode['id'], fromNested:any = undefined ):INode | undefined => {
    let { items } = actualStateRef.current
    if(fromNested !== undefined) items = fromNested

    let node:INode | undefined = undefined
    // id nested.id
    items.forEach( (item:any) => {
      if(node === undefined) {
        if(item.id === nodeId) 
          node = item
        else 
          if(item.nested !== undefined) node = getNodeByID(nodeId, item.nested)
      }      
    });
    return node
  }
  const isNodeExpanded = (nodeId:INode['id'] ):INode['expanded'] => {    
    const node:INode | undefined = getNodeByID(nodeId)
    //console.log('isNodeExpanded : nodeId', nodeId, node)
    //console.log('isNodeExpanded : node.expanded', (node as INode).expanded)
    let result:boolean = false
    if(node !== undefined && node.expanded !== undefined) {
      result = (node as INode).expanded
      //console.log('isNodeExpanded : result', result)
    }
    return result
  }

  const tryChangeActiveItem = (newActiveItem:INode['id'], direction:number):INode['id'] => {
    //console.log('tryChangeActiveItem', newActiveItem, direction)
    if(getNodeByID(newActiveItem + direction) !== undefined) {
      //console.log('ChangeActiveItem to:', newActiveItem + direction)
      return newActiveItem + direction
    }
    const parentItemId = getParentItemId(newActiveItem)
    //console.log('parentItemId:', parentItemId)
    if(parentItemId === 0) 
      return newActiveItem  // out of bounds

    if(direction === 1) {
      if(getNodeByID(parentItemId + direction) !== undefined) 
        return parentItemId + direction
      else 
        return newActiveItem
    } else // direction === -1
        return parentItemId
  }

  const getParentItemId = (nodeId:INode['id']):INode['id'] => {
    // parentId = целая часть от деления на 10;  
    return (nodeId - nodeId % 10) / 10
  }

  const getLastNested = (nodeId:INode['id']):INode['id'] => {
    let node = getNodeByID(nodeId)  // always INode never undefined
    const maxNested = (node as INode).nested.length - 1
    const lastNested = (node as INode).nested[maxNested]    
    return lastNested.id
  }
  
  const updateActiveItem = ( newActiveItem:IMyFilesState['activeItem'] ):void => {    
    setState({ ...actualStateRef.current, activeItem: newActiveItem })    
  }

  // <Link to={'/files/' + node.id}>
  const navigateActiveItem = (event:any | null):void => {
    const { activeItem } = actualStateRef.current    
    push('/files/' + activeItem.toString())    
  }
  //</Link>
  const expandItem = (selectedTopicId:IMyFilesState['activeItem']):void => {
    const { items } = actualStateRef.current

    items.forEach( (item:any) => {
      if (item.id === selectedTopicId) {
        //console.log('Switched !', item.expanded, typeof item.expanded)
        if (item.expanded !== undefined) {
          // for files in root
          item.expanded = !item.expanded
          //console.log('Changed !', item.expanded, typeof item.expanded)
        }
      }
    })
    
    setState({ ...actualStateRef.current, activeItem: selectedTopicId, items: items })    
  }
  const keyboardMyFiles = (event:any) => {
    let { activeItem: newActiveItem } = actualStateRef.current
    // const { items } = actualStateRef.current
    let navActiveItem:INode['id'] = 0

    let isNavigateKey = false
    if (event.keyCode === 40) {
      // console.log('KeyDown')      
      isNavigateKey = true
      if(isNodeExpanded(newActiveItem)) newActiveItem = (getNodeByID(newActiveItem) as INode).nested[0].id
        else {
          navActiveItem = tryChangeActiveItem(newActiveItem, +1)
          //console.log('(+1) navActiveItem = ', navActiveItem, newActiveItem)
          if(navActiveItem !== newActiveItem)  // success MoveDOWN
            newActiveItem = navActiveItem
        }
    }
    if (event.keyCode === 38) {
      //console.log('KeyUp')
      isNavigateKey = true
      navActiveItem = tryChangeActiveItem(newActiveItem, -1)
      //console.log('KeyUp: ', navActiveItem)
      if(navActiveItem !== newActiveItem) { // success MoveUP
        //console.log('KeyUp: navActiveItem - newActiveItem = ',navActiveItem - newActiveItem)
        if(navActiveItem - newActiveItem === -1)  // move up and node Level dont change:
          while(isNodeExpanded(navActiveItem))    // then if node expanded, move to getLastNested()
            navActiveItem = getLastNested(navActiveItem)  // continue until find not-expanded nested item
      }
      newActiveItem = navActiveItem
    }

    let isOutofBounds = false // Allready checked by tryChangeActiveItem(newActiveItem, +/- 1)
    // if (newActiveItem <= 0) isOutofBounds = true
    // if (newActiveItem > items.length) isOutofBounds = true
    
    if (isNavigateKey && !isOutofBounds) {      
      // console.log('keyboardTable setState', 'newActiveItem', newActiveItem)
      event.preventDefault()
      event.stopPropagation()
      updateActiveItem(newActiveItem)      
    }

    // Enter || Arrow_Right
    if (event.keyCode === 13 || event.keyCode === 39) {      
      event.preventDefault()
      event.stopPropagation()
      expandItem(newActiveItem)
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


  

  let nodes = items.map(function (item:any) {
    return (
      <Node
        key={item.id}
        node={item}
        subNode={item.nested}
        activeItem={activeItem}
        items={items}
        expandItem={expandItem}
      />
    )
  })

  return (
    <div className='MyFiles'>
      <div className='MyFilesLeftPanel'>
        <ul>{nodes}</ul>
      </div>
      <div className='MyFilesRightPanel'>
        <Switch>
          <Route exact path={path}>
            <h3>
              Раскройте элемент списка (папку)
              <br />
              Затем выберите элемент списка файл:
              <br />
              При этом с помощью fetch() с сервера будет получено содержимое
              файла,
              <br />
              второй fetch() запросит данные об Авторе и обработает их json()-ом
              <br />
              <br />
              Router ссылки отрабатывают корректно. Обновление страницы по
              ссылке - работает.
              <br />
            </h3>
          </Route>
          <Route path={`${path}/:topicId`}>
            <Topic1 items={items} setState={setState} />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

const getColumnName = (propName:string):string => {
  return getAllColumnNames()[propName]
}

const getAllColumnNames = ():{[key:string]: string} => {
  return {
    id: 'hidden', // hidden = dont dysplay this in component
    author: 'Автор',
    book: 'Произведение'
  }
}

interface Topic1Props {
  items: IMyFilesState['items'],
  setState: React.SetStateAction<any>
}

interface Topic1State {
  loaded: boolean,
  fileId: string | undefined,
  content: string,
  itemsView: Array<any>
}

interface filesdataItem { 
  id: number, 
  author: string, 
  book: string
}

interface filesdata {
  items: Array<filesdataItem>
}

function Topic1 (props:Topic1Props) {
  // The <Route> that rendered this component has a
  // path of `/topics/:topicId`. The `:topicId` portion
  // of the URL indicates a placeholder that we can
  // get from `useParams()`.
  let { topicId } = useParams()
  //console.log('Topic1 topicId = ', topicId)

  const [state, setTopicState] = useState<Topic1State>({
    loaded: false,
    fileId: topicId,
    content: '',
    itemsView: []
  })

  const { loaded, fileId, content, itemsView } = state

  if (topicId !== fileId) {
    //console.log('Topic1 fileId = ', fileId, ' need change state !')
    setTopicState({
      loaded: false,
      fileId: topicId,
      content: '',
      itemsView: []
    })
  }

  useEffect(() => {
    //console.log('Topic1 useEffect fileId', fileId)    
    const fileNameOnServer:string = 'http://localhost:3000/filedata' + fileId + '.txt'
    const fileDataOnServer:string = 'http://localhost:3000/filesdata.txt'
    
    let cFileId:number = (fileId === undefined ? -1 : parseInt(fileId))

    if (cFileId > 10 && !loaded) {
      let newItemsView:Topic1State['itemsView'] = []
      if (itemsView.length === 0)
        fetch(fileDataOnServer)
          .then(response => response.json()) // res.text()
          .then(
            result => {
              // console.log('success fetch', fileDataOnServer)
              // console.log('result.items', result.items)
              newItemsView = (result as filesdata).items.filter(
                item => item.id === (fileId === undefined ? -1 : parseInt(fileId))
              )              
            },
            // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
            // чтобы не перехватывать исключения из ошибок в самих компонентах.
            error => {
              console.log('error fetch', fileDataOnServer)
              setTopicState({
                ...state,
                itemsView: []
              })
            }
          )
      else newItemsView = itemsView

      fetch(fileNameOnServer)
        .then(response => response.text()) // res.json()
        .then(
          result => {
            const ifEmptyHtmlResponse:boolean =
              (result as string).slice(0, 15) === '<!DOCTYPE html>'
            setTopicState({
              ...state,
              loaded: true,
              content: ifEmptyHtmlResponse
                ? 'Нет файла по адресу: ' + fileNameOnServer
                : result,
              itemsView: newItemsView
            })
          },
          // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
          // чтобы не перехватывать исключения из ошибок в самих компонентах.
          error => {
            console.log('error fetch', fileNameOnServer)
            setTopicState({
              ...state,
              loaded: true,
              content: 'Ошибка загрузки данных из файла: ' + fileNameOnServer,
              itemsView: newItemsView
            })
          }
        )
    }
  }, [fileId, itemsView, loaded, state])

  const isItemSelected = itemsView.length > 0

  return (
    <div className='FilesRightContent'>
      {isItemSelected ? (
        <Table
          data={itemsView}
          skipEvents={true}
          changeSortOrder={null}
          sortColumn=''
          sortDirection={1}
          getColumnName={getColumnName}          
        />
      ) : null}
      <div className='FilesRightContentText'>
        <pre>{content}</pre>
      </div>
    </div>
  )
}

export default MyFiles
