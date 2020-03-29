import React, { useState, useEffect } from 'react'
import { Link, Route, Switch, useRouteMatch, useParams } from 'react-router-dom'
// import { useStores } from '../hooks/use-stores'
import Table from './Table'

const getSelectedFromPath = (cPath:string):string => {
  let result = cPath.replace('/files', '').replace('/', '')
  return result
}

interface INodeProps {
  node: INode,
  subNode: INode['nested'],
  items: IMyFilesState['items'],
  setState: React.SetStateAction<any>
}

const Node = (props:INodeProps) => {
  const { node, subNode, items, setState } = props
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
          items={items}
          setState={setState}
        />
      )
    })
  }

  const expandList = (event:any) => {
    const topicId = parseInt(event.target.getAttribute('data-tag'))
    const selectedTopicId = topicId
    //console.log('expandList: topicId', topicId, typeof topicId);
    //let params = useParams();
    // console.log('Topic() params', params);

    items.forEach(item => {
      if (item.id === selectedTopicId) {
        // console.log('Switched !', item.expanded, typeof item.expanded)
        if (item.expanded !== undefined)
          // for files in root
          item.expanded = !item.expanded
      }
    })
    setState({ loaded: true, items: items })
  }

  // return our list element
  // display children if there are any
  return (
    <li key={node.id}>
      <Link to={'/files/' + node.id}>
        <span data-tag={node.id} onClick={expandList}>
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
  items: Array<INode>
}

const MyFiles = () => {
  //const { myStore } = useStores()
  let { path } = useRouteMatch()
  // console.log('window.location.pathname', window.location.pathname)
  // console.log('path', path)

  const [currentLink, setLink] = useState(window.location.pathname) // "/files/1"
  const [state, setState] = useState<IMyFilesState>({
    loaded: false,
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

  const { loaded, items } = state
  //const { currentLnk } = currentLink
  //console.log('component: loaded', loaded)

  useEffect(() => {
    // console.log('useEffect loaded = ', loaded)
    if (!loaded) {
      const currentSelectedItem = getSelectedFromPath(window.location.pathname)
      if (currentSelectedItem !== '') {
        // Expand selected item node
        let selectedTopicId:number = parseInt(currentSelectedItem)
        if (selectedTopicId >= 10)
          selectedTopicId = (selectedTopicId - (selectedTopicId % 10)) / 10

        let changed:boolean = false
        items.forEach(item => {
          if (item.id === selectedTopicId) {
            // console.log('Switched !', item.expanded, typeof item.expanded)
            if (item.expanded !== undefined) {
              // for files in root
              item.expanded = true
              changed = true
            }
          }
        })
        if (changed) {
          setState({ loaded: true, items: items })
          // console.log('useEffect state changed !')
        }
      }
    }
  }, [currentLink, items, loaded])

  let nodes = items.map(function (item) {
    return (
      <Node
        key={item.id}
        node={item}
        subNode={item.nested}
        items={items}
        setState={setState}
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

  const [state, setState] = useState<Topic1State>({
    loaded: false,
    fileId: topicId,
    content: '',
    itemsView: []
  })

  const { loaded, fileId, content, itemsView } = state

  if (topicId !== fileId) {
    //console.log('Topic1 fileId = ', fileId, ' need change state !')
    setState({
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
    // if(fileId>10 && !loaded) {
    //   fetch(fileNameOnServer).then( response => {
    //     setState({
    //       ...state,
    //       loaded: true,
    //       content: response.text()
    //     });
    //   })
    // }
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
              // setState({
              //   ...state,
              //   itemsView : result.items
              // });
            },
            // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
            // чтобы не перехватывать исключения из ошибок в самих компонентах.
            error => {
              console.log('error fetch', fileDataOnServer)
              setState({
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
            setState({
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
            setState({
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
