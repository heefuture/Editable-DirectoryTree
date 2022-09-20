import React, { useEffect, useState, Key, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Tree, Input } from 'antd'
import { TreeProps } from 'antd/lib/tree'
//import { DataNode } from 'rc-tree/lib/interface'
import { Dropdown, Menu, Tabs, Switch } from 'antd';
import { message } from 'antd'
import shortid from 'shortid';

import 'antd/dist/antd.css';
import '/src/index.css';

const { DirectoryTree } = Tree;

type ITreeProps = NeverPick<TreeProps, 'treeData'>

type NeverPick<T, U> = {
  [P in Exclude<keyof T, U>]?: T[P]
}

const INPUT_ID = 'inputId'

const ProjectPath = "/data"

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

export interface IPathAttr {
    key: string
    name: string
    isLeaf: boolean
    path: string
}

export interface IPathNode extends IPathAttr {
    isEdit: boolean
    isCreate: boolean
    parentKey: string
    children: IPathNode[]
}

interface IEditableTree {
    rootPath?: string
    roots: IPathNode[]
    onEdit?: (value: string, id: Key) => void
    onCreate?: (value: string, parentDir: Key) => void
    onDelete?: (id: Key) => void
    onSelect?: (selectedKeys:Key[]) => void
}

// function reatPathTree(path) {
//     var tree;
//     return tree;
// }
/**
 * 修改tree，action就返回修改后的item， 不修改就不返回
 */
export const deepTree = (tree = [], action = () => {}) => {
    return tree.map((item) => {
      const newItem = action({ ...item }) || item;
      if (newItem.children) {
        newItem.children = deepTree(newItem.children, action);
      }
      return newItem;
    });
};

//注意path改了底层也要更着改？？？？

const EditableTree = ({
    roots,
    rootPath,
    onEdit,
    onCreate,
    onDelete,
    onSelect,
    expandedKeys = [],
    selectedKeys = [],
    autoExpandParent = true,
    ...props
}: IEditableTree & ITreeProps) => {
    const [showLine, setShowLine] = useState<boolean>(false);
    const [isInputShow, setInputShow] = useState(true);
    const [isUpdated, setUpdated] = useState(false);
    const [rightClickKey, setRightClickKey] = useState();
    //const [lineList, setLineList] = useState<ILeafNode>();
    const [treeData, setTreeData] = useState([...roots]);
    const [expandKeys, setExpandKeys] = useState<Key[]>(expandedKeys);
    const [selectKeys, setSelectKeys] = useState<Key[]>(selectedKeys);
    const [autoExpand, setAutoExpand] = useState(autoExpandParent);
    const [inputValue, setInputValue] = useState('');

    // useEffect(() => {
    //     const lineList: IPathNode[] = isNotEmptyArray(list)
    //         ? list.map((item) => ({
    //             ...item,
    //             key: item.id,
    //             title: item.name,
    //             isCreate: false,
    //             isEdit: false,
    //             children: []
    //         }))
    //         : []
    //     setLineList(lineList)
    // }, [list])

    // useEffect(() => {
    //     // const list = JSON.parse(JSON.stringify(rootPath))
    //     // const treeData = reatPathTree(rootPath)
    //     setTreeData(treeData)
    // }, [treeData])

    const inputNode = useCallback(
        (input) => {
            isInputShow && input && input.focus()
        },
        [isInputShow]
    )

    const toggleNodeEdit = (node: any, isEdit: boolean) => {
        let newTree = deepTree(treeData, (item) => {
            return {
                ...item,
                isCreate: false,
                isEdit: item.key === node.key ? isEdit : false
            }
        });

        setUpdated(false);
        setTreeData(newTree);
        setInputShow(isEdit);
    }

    const toggleNodeCreate = (node: any, isCreateDir: boolean) => {
        let newPath = node.path;
        let newParentKey = node.key;
        if (!node.isLeaf) {
            newPath = node.path + "/" + node.name;
        }
        else {
            //newDirKey = item.parentKey;
            newParentKey = node.parentKey;
        }
        let newTree = deepTree(treeData, (item) => {
            if (item.key === newParentKey) {
                if (isCreateDir) {
                    return {
                        ...item,
                        children: [
                            ...item.children,
                            {
                                key: shortid.generate(),
                                name: '',
                                isLeaf: !isCreateDir,
                                path: newPath,
                                parentKey: newParentKey,
                                isEdit: false,
                                isCreate: true,
                                children: [],
                            },
                        ],
                    };
                }
                else {
                    return {
                        ...item,
                        children: [
                            ...item.children,
                            {
                                key: shortid.generate(),
                                name: '',
                                isLeaf: !isCreateDir,
                                path: newPath,
                                parentKey: newParentKey,
                                isEdit: false,
                                isCreate: true,
                            },
                        ],
                    };
                }
                
            }
        });
        setTreeData(newTree);
        handleExpand([...expandKeys, newParentKey]);
        setInputShow(true);
    }

    const handleNodeEdit = (value: string, node: any) => {
        let newTree = deepTree(treeData, (item) => {
            if (item.key === node.key)
            return {
                ...item,
                name: value,
                isEdit: false
            }
        });

        setUpdated(false);
        setTreeData(newTree);
        setInputValue('')
        isUpdated && onEdit && onEdit(value, node.key)
    }

    const handleNodeCreate = (value: string, node: any) => {
        if (value == ''){
            handleNodeDelete(node.key);
        }
        else {
            let newTree = deepTree(treeData, (item) => {
                if (item.key === node.key) {
                    return {
                        ...item,
                        name: value,
                        isCreate: false,
                    };
                }
            });
            setTreeData(newTree);
        }
        
        setInputShow(false);
        setInputValue('');
        onCreate && onCreate(value, node.path);
    }

    const toggleNodeDelete = (item: any) => {
        handleNodeDelete(item.key);
    }

    const handleNodeDelete = (delKey: Key) => {
        const outer = treeData.find((item) => item.key === delKey);
        if (outer) {
            setTreeData(treeData.filter((item) => item.key !== delKey));
            return;
        }
        setTreeData(
            deepTree(treeData, (item) => {
                if (item.children) {
                    return {
                        ...item,
                        children: item.children.filter(
                            ({ key }) => key !== delKey
                        ),
                    };
                }
                return item;
            })
        );

        onDelete && onDelete(delKey)
    }

    const handleNodeSelect = (
        selectedKeys: (string | number)[],
        info?: { nativeEvent: MouseEvent }
    ) => {
        const inputId: any = (info?.nativeEvent?.target as HTMLInputElement)?.id
        // 防止选中input所在的节点
        if (inputId !== INPUT_ID) {
            setSelectKeys(selectedKeys);
            onSelect && onSelect(selectedKeys);
        }
    }

    const handleExpand = (expandedKeys: Key[]) => {
        setExpandKeys([...new Set(expandedKeys)])
        setAutoExpand(false)
    }

    const menu = (item) => (
        <Menu
          onClick={({ key, domEvent }) => {
            domEvent.stopPropagation();
            console.log('menuClick', item, key);
            setRightClickKey();
            // 如果要操作顶层文件夹（添加/删除）可以直接操作最外层数组不用递归
            switch (key) {
              case 'addPath':
                toggleNodeCreate(item, true); break;
            case 'addFile':
                toggleNodeCreate(item, false); break;
              case 'delete':
                toggleNodeDelete(item); break;
              case 'edit':
                toggleNodeEdit(item, true);
                setInputValue(item.name);
                break;
            }
          }}
          items={[
            { label: 'addFile', key: 'addFile' },,
            { label: 'addPath', key: 'addPath' },
            { label: 'delete', key: 'delete', danger: true },
            { label: 'rename', key: 'edit' },
          ]}
        >
        </Menu>
    );

    const genItemTitle = (item) => {
        if (item.isCreate) {
            return (
                <Input
                    maxLength={8}
                    id={INPUT_ID}
                    ref={inputNode}
                    value={inputValue}
                    placeholder="输入限制为8个字符"
                    suffix={<span>{inputValue.length}/8</span>}
                    onChange={({ currentTarget }) => {
                        setInputValue(currentTarget.value)
                    }}
                    onBlur={({ currentTarget }) => {
                        handleNodeCreate(currentTarget.value, item)
                    }}
                    onPressEnter={({ currentTarget }: any) => {
                        handleNodeCreate(currentTarget.value, item)
                    }}
                />
            )
        }
        else {
            if (item.isEdit) {
                return (
                    <Input
                        id={INPUT_ID}
                        maxLength={10}
                        ref={inputNode}
                        value={inputValue}
                        placeholder="输入限制为10个字符"
                        suffix={<span>{inputValue.length}/10</span>}
                        onChange={({ currentTarget }) => {
                            const val = currentTarget.value
                            setInputValue(val)
                            setUpdated(val !== item.name)
                        }}
                        onPressEnter={({ currentTarget }) => {
                            handleNodeEdit(currentTarget.value, item)
                        }}
                        onBlur={({ currentTarget }) => {
                            handleNodeEdit(currentTarget.value, item)
                        }}
                    />
                )
            }
            else {
                return (
                    <Dropdown
                        trigger={['contextMenu']}
                        open={rightClickKey === item.key}
                        onOpenChange={() => setRightClickKey()}
                        overlayStyle={{ width: 80 }}
                        overlay={menu(item)}
                    >
                        <span>{item.name}</span>
                    </Dropdown>
                )
            }
        }
    };

    const renderTree: any = (
        roots: IPathNode[]
    ) => {
        return [
            ...deepTree(roots, (item) => {
                return {
                    ...item,
                    key: item.key,
                    name: item.name,
                    isLeaf: item.isLeaf,
                    title: genItemTitle(item),
                };
            }),
        ]
        // const tree = deepTree(roots, (item) => {
        //     return {
        //         key: item.key,
        //         name: item.name,
        //         title: genItemTitle(item),
        //     };
        // });
        // return tree;
    };
    console.log('render==', treeData);
    console.log('rightClickKey==', rightClickKey);
    return (
        <div style={{ display: 'flex' }}>
        {/* <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input.Search
            placeholder="input search text"
            onSearch={onSearch}
            style={{ width: 180 }}
          />
          <Switch
            checkedChildren="关联右侧"
            unCheckedChildren="不关联右侧"
            checked={rightConnect}
            onChange={setRightConnect}
          />
        </div> */}
            <DirectoryTree
                showLine={showLine}
                style={{ width: 280 }}
                //draggable
                blockNode
                defaultExpandAll
                onRightClick={({ node }) => setRightClickKey(node.key)}
                onSelect={handleNodeSelect}
                //   selectedKeys={rightConnect ? [activeTabKey] : selectKeys}
                selectedKeys={selectKeys}
                expandedKeys={expandKeys}
                onExpand={handleExpand}
                treeData={renderTree(treeData)}
                autoExpandParent={autoExpand}
            />

        </div>
    )
}

//export default EditableTree

const App = () => {
    const [expandKeys, setExpandKeys] = useState<Key[]>();
    const [selectKeys, setSelectKeys] = useState<Key[]>();
    const [activeTabKey, setActiveTabKey] = useState();
    const [tabItems, seTabItems] = useState([]);
    // const [dataList, setDataList] = useState([
    //   {
    //     id: 1,
    //     name: 'hhh',
    //     parentId: 0
    //   },
    //   {
    //     id: 2,
    //     name: 'zzz',
    //     parentId: 0
    //   }
    // ])
  
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
    return (
     <div style={{ display: 'flex' }}>
      <div className="container-demo">
        <EditableTree
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
            handleDelete(id)
          }}
          expandedKeys={expandKeys}
          selectedKeys={selectKeys}
        />
        </div>
        <Tabs
            hideAdd
            type="editable-card"
            //onEdit={onEdit}
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            items={tabItems.map((item) => ({
                ...item,
                key:'',
                label:'',
              }))
            }
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
  