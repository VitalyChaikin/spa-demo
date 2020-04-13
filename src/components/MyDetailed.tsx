import React from 'react'
import { useState, useEffect, useRef } from 'react'
// import { useStores } from '../hooks/use-stores'
import { FuncChangeDetailed } from './MySearch'
import { Form, Input, Row, Col, Button, Checkbox, InputNumber, Select } from 'antd';


interface IMyDetailedState {
  isLoaded: boolean,
  itemsView: Array<any>,
  idDetailed: number,
  txtJson: string
}

export interface IMyDetailedProps {
  data: Array<any>,
  idDetailed: number,
  changeDetailed: FuncChangeDetailed
}


const MyDetailed = (props:IMyDetailedProps) => {
  const { data: arrData, idDetailed: newIdDetailed, changeDetailed } = props

  const [form] = Form.useForm()
  
  const layout = {    
    labelCol: { span: 10 },
    wrapperCol: { span: 15 },
  }
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  //const { myStore } = useStores()
  const inputId:any = useRef<HTMLElement>(null)
  const inputName:any = useRef<HTMLElement>(null)
  const inputType:any = useRef<HTMLElement>(null)
  const inputPrice:any = useRef<HTMLElement>(null)
  const inputDesc:any = useRef<HTMLElement>(null)
  const inputInfo:any = useRef<HTMLElement>(null)

  const [state, setState] = useState<IMyDetailedState>({
    isLoaded: false,
    itemsView: arrData.filter(value => newIdDetailed === value.id),
    idDetailed: newIdDetailed,
    txtJson: ''
  })

  const { itemsView, txtJson } = state

  // Init form values
  useEffect(() => {
    form.setFieldsValue({      
      id:   itemsView[0].id,
      type: itemsView[0].type,
      name: itemsView[0].name,
      price:itemsView[0].price,
      desc: itemsView[0].desc
    });
  }, []);


  // let isPropsChanged = false
  // //console.log('1. newIdDetailed: ', newIdDetailed, 'idDetailed:', idDetailed, 'arrData.length', arrData.length, 'itemsView.length', itemsView.length)
  // if(newIdDetailed !== idDetailed) // || arrData.length !== itemsView.length)
  //   isPropsChanged = true

  // //if (isPropsChanged) {
  //   console.log('isPropsChanged: arrData.length', arrData.length)
  //   const _itemsView = arrData.filter( (value) => newIdDetailed===value.id )
  //   console.log('isPropsChanged: _itemsView', _itemsView.length, _itemsView[0])

  useEffect(() => {
    // console.log('2. useEffect: itemsView.length', itemsView.length)
    if (itemsView.length === 1) {
      // console.log('3. useEffect: itemsView[0].id', itemsView[0].id)
      // inputId.current.value = itemsView[0].id
      // inputName.current.value = itemsView[0].name
      // inputType.current.value = itemsView[0].type
      // inputPrice.current.value = itemsView[0].price
      // inputDesc.current.value = itemsView[0].desc
      // inputInfo.current.value = itemsView[0].info
    }
    fetch('http://localhost:3000/filesdata.txt')
      .then(res => res.text())
      .then(
        result => {
          setState({
            ...state,
            isLoaded: true,
            txtJson: result
          })
        },
        // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(),
        // чтобы не перехватывать исключения из ошибок в самих компонентах.
        error => {
          setState({
            ...state,
            isLoaded: true,
            txtJson:
              'Ошибка при загрузке файла http://localhost:3000/filesdata.txt'
          })
        }
      )
  }, [])

  const onClickBackButton = (event:any) => {
    changeDetailed()
  }

  const onFinish = (values:any) => {
    console.log(values);
  };

  const antForm = () => {
    const { TextArea } = Input
    const { Option } = Select;
    return (
    <div id='txt_1'>
      <Form labelCol={{ span: 8 }} wrapperCol={{ span: 24 }} size='small' form={form} name="detailedInfo" onFinish={onFinish}>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>id#:</Col>
            <Col>
              <InputNumber name="id" value={itemsView[0].id} style={{ marginLeft: 10, width: 100}} />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>Ресурс:</Col>
            <Col>              
              <Select defaultValue={itemsView[0].type} style={{ marginLeft: 10, width: 100 }} >
                <Option value="газ">газ</Option>
                <Option value="нефть">нефть</Option>
                <Option value="уголь">уголь</Option>                
              </Select>
            </Col>
          </Row>          
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>Марка:</Col>
            <Col>
              <Input name="name" value={itemsView[0].name} style={{ marginLeft: 10, width: 150 }} />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>Цена:</Col>
            <Col>
              <InputNumber name="price" value={itemsView[0].price} style={{ marginLeft: 10, width: 100 }} />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>Описание:</Col>
            <Col>
              <Input name="desc" value={itemsView[0].desc} style={{ marginLeft: 10, width: 250 }} />
            </Col>
          </Row>          
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Row>
            <Col className='lblField' style={{ marginLeft: 5, width: 100, textAlign: "right" }}>Информация:</Col>
            <Col>
              <TextArea rows={5} name="info" value={itemsView[0].info} style={{ marginLeft: 10, width: 550 }} />
            </Col>
          </Row>          
        </Form.Item>
      </Form>
    </div> 
    )
  }

  // return (antForm())

  return (
    <div className='MyDetailed'>
      <div className='tabs'>
        <input type='radio' name='inset' value='' id='tab_1' defaultChecked />
        <label htmlFor='tab_1'>Подробная информация</label>

        <input type='radio' name='inset' value='' id='tab_2' />
        <label htmlFor='tab_2'>Произведения Лермонтова</label>

        <input type='radio' name='inset' value='' id='tab_3' />
        <label htmlFor='tab_3'>Самое сложное в этом проекте</label>

        <input type='radio' name='inset' value='' id='tab_4' />
        <label htmlFor='tab_4'>Что есть в проекте</label>

        <div id='txt_1'>          
          {antForm()}          
          <div className='inputField'>
            <button className='bBack' onClick={onClickBackButton}>
              Назад
            </button>
          </div>
        </div>
        <div id='txt_2'>
          <p>
            Так выглядит файл со списком произведений Лермонтова (загружен с
            сервера)
          </p>
          <pre>{txtJson}</pre>
          <div className='inputField'>
            <button className='bBack' onClick={onClickBackButton}>
              Назад
            </button>
          </div>
        </div>
        <div id='txt_3'>
          <p>
            &nbsp;Наиболее сложной задачей в этом тестовом задании было
            подключение клавиатуры.
          </p>
          Выяснилось, что внутри обработчика событий клавиатуры недоступен state
          ???
          <br />
          Вернее доступно только его начальное значение, даже если на момент
          нажатия клавиши state изменился.
          <br />
          Понять это явление, оказалось не так просто. Костылей для решения этой
          проблемы в интернете <br />
          предлагалось несколько. Но все они касались компонентов на классах, а
          я то пишу - функциональный компонент.
          <br />
          Для функциональных компонентов иногда предлагались странные решения )
          <br />
          Например, убрать зависимости useEffect( ,[]) ?! Трудно поверить, но
          это работает по какой-то неведомой причине.
          <br />
          Здоровым решением взятым на вооружение стало использование useRef()
          для state.
          <br />
          Теперь обращение к ...state выглядит как ...actualStateRef.current
          <br />
          Это позволяет получать актуальный state внутри обработчика клавиатуры;
          Однако есть еще один нюанс. <br />
          Когда дочерний компонент из обработчика клавиатуры вызывает
          callback-функцию родительского компонента,
          <br />
          внутри callback-функции state родительского компонента снова доступен
          только в начальном состоянии ...
          <br />
          Пришлось чинить родительский компонент, менять ...state на
          ...actualStateRef.current
          <br />
          Настораживает сам факт, что подключение к уже работающему компоненту,
          компонента-использующего-клавиатуру -<br />
          способно превратить работающий компонент в не работающий ...
          <br />
          <br /> Виталий
          <div className='inputField'>
            <button className='bBack' onClick={onClickBackButton}>
              Назад
            </button>
          </div>
        </div>
        <div id='txt_4'>
          <p>
            SASS : все стили лежат в папке scss; Собираются с помощью скрипта:{' '}
            <i>npm run watch-css</i>
          </p>
          <p>Компоненты : 9 штук лежат в папке components;</p>
          <p>Файлы данных txt/json: 14 штук лежат в папке public;</p>
          <p>GIT: https://github.com/VitalyChaikin/spa-demo</p>
          <p>
            GIT: перед загрузкой использовалось форматирование prettier-standard
            --format скриптом: <i>npm run format</i>
          </p>
          <div className='inputField'>
            <button className='bBack' onClick={onClickBackButton}>
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyDetailed
