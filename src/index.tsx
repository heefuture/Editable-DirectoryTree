import React, { useState } from 'react';
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom';
import {  Tabs} from 'antd';
import { message } from 'antd';
import EditableDirectoryTree from './EditableDirectoryTree';
import { deepTree, deepTreeFilter, IPathNode, IPathAttr } from './EditableDirectoryTree';

import 'antd/dist/antd.css';
import './index.css';

const { TabPane } = Tabs;

const testTreeData = [
    {
        key: '0-0',
        name: 'parent 0',
        isLeaf: false,
        path: 'parent 0',
        isCreate: false,
        isEdit: false,
        parentKey: '',
        children: [
            {
                name: 'leaf 0-0',
                key: '0-0-0',
                isLeaf: true,
                path: 'parent 0',
                isCreate: false,
                isEdit: false,
                parentKey: '0-0',
                children: []
            },
            {
                name: 'leaf 0-1',
                key: '0-0-1',
                isLeaf: false,
                path: 'parent 0',
                isCreate: false,
                isEdit: false,
                parentKey: '0-0',
                children: [],
            },
        ],
    },
    {
        name: 'parent 1',
        key: '0-1',
        isLeaf: false,
        path: 'parent 0',
        isCreate: false,
        isEdit: false,
        parentKey: '',
        children: [
            {
                name: 'leaf 1-0',
                key: '0-1-0',
                isLeaf: true,
                path: 'parent 0',
                isCreate: false,
                isEdit: false,
                parentKey: '0-1',
                children: []
            },
            {
                name: 'leaf 1-1',
                key: '0-1-1',
                isLeaf: true,
                path: 'parent 0',
                isCreate: false,
                isEdit: false,
                parentKey: '0-1',
                children: []
            },
        ],
    },
];

const App = () => {
    //const [expandKeys, setExpandKeys] = useState<Key[]>();
    const [selectKeys, setSelectKeys] = useState<Key[]>(['1']);
    const [activeTabKey, setActiveTabKey] = useState();
    const [tabItems, seTabItems] = useState([]);
  
    const handleEdit = (value: string, id: Key) => {
    //   const list = dataList.map((item) => ({
    //     ...item,
    //     name: id === item.id ? value : item.name
    //   }))
    //   setDataList(list)
    }
  
    const handleCreate = (value: string, parentId: Key) => {
    //   const list = [
    //     ...dataList,
    //     {
    //       id: Math.floor(Math.random() * 6000000) + 1,
    //       name: value,
    //       parentId: Number(parentId)
    //     }
    //   ]
    //   setDataList(list)
    }
  
    const handleDelete = (id: Key) => {
    //   const list = deletedList(id)
    //   setDataList(list)
    }
  
    const deletedList = (parentId: Key) => {
    //   const list = JSON.parse(JSON.stringify(dataList))
    //   const arr = [parentId]
    //   for (let i = 0; i < list.length; i++) {
    //     const isLeafOrChild =
    //       arr.includes(list[i].id) || arr.includes(list[i].parentId)
  
    //     if (isLeafOrChild) {
    //       arr.push(list[i].id)
    //       list.splice(i, 1)
    //       i--
    //     }
    //   }
    //  return list
    }

    const onTabsEdit = (targetKey, action) => {
        switch (action) {
            case 'remove':
                seTabItems(tabItems.filter((item) => item.key !== targetKey));
                break;
        }
    };

    const handleSelect = (keys: Key[], node:any) => {
        if (keys.length == 1 && node.isLeaf){
            seTabItems([
                ...tabItems.filter((item) => item.key !== keys[0]),
                { 
                    key: keys[0],
                    label: node.name,
                },
            ]);
            handleActiveTab(keys[0]);
        }
    }

    const handleActiveTab = (key: Key) => {
        setActiveTabKey(key);
        setSelectKeys([key]);
    }

    return (
     <div style={{ display: 'flex' }}>
      <div className="container-demo">
        <EditableDirectoryTree
          roots={testTreeData}
          onEdit={(value, id) => {
            console.log('value, id: ', value, id);
            value && handleEdit(value, id);
            value
              ? message.success(`value:${value}, id:${id}`)
              : message.warn(`value为空`);
          }}
          onCreate={(value, parentId) => {
            console.log('value,parentId: ', value, parentId);
            value
              ? message.success(`value:${value}, parentId:${parentId}`)
              : message.warn(`value为空`);
            value && handleCreate(value, parentId);
          }}
          onDelete={(id) => {
            message.success(`成功删除节点${id}`);
            handleDelete(id);
          }}
          onSelect={(keys, node) => {
            handleSelect(keys, node);
          }}
          selectedKeys={selectKeys}
        />
        </div>
        <Tabs
            hideAdd
            type="editable-card"
            onEdit={onTabsEdit}
            activeKey={activeTabKey}
            onChange={handleActiveTab}
            items={tabItems}
        >

        </Tabs>
        {/* <Input.TextArea
          rows={27}
          className="data-input"
          value={JSON.stringify(testTreeData)}
          onChange={({ currentTarget }) => {
            try {
              //setDataList(JSON.parse(currentTarget.value))
            } catch (error) {}
          }}
        /> */}
      
      </div>
    )
  }
  
createRoot(document.getElementById('container')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
