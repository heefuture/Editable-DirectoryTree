import React, { useEffect, useState, Key, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { Tree, Input, Dropdown, Menu} from 'antd'
import { DownOutlined } from '@ant-design/icons';
import { TreeProps } from 'antd/lib/tree'
import { message } from 'antd'
import shortid from 'shortid';

import 'antd/dist/antd.css';

const { DirectoryTree } = Tree;

type ITreeProps = NeverPick<TreeProps, 'treeData'>

type NeverPick<T, U> = {
  [P in Exclude<keyof T, U>]?: T[P]
}

const INPUT_ID = 'inputId'

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
    onSelect?: (selectedKeys:Key[], node:any) => void
}

/**
 * 修改tree，action就返回修改后的item， 不修改就不返回
 */
export const deepTree = (tree = [], action = () => { }) => {
    return tree.map((item) => {
        const newItem = action({ ...item }) || item;
        if (newItem.children) {
            newItem.children = deepTree(newItem.children, action);
        }
        return newItem;
    });
};


/**
 * 递归遍历tree，返回符合func过滤的item数组
 */
export const deepTreeFilter = (tree = [], func = () => { }) => {
    let array = tree.filter((item) => func({ ...item }));
    let childArr = new Array;
    tree.forEach(function (item) {
        childArr = [...childArr, ...deepTreeFilter(item.children, func)];
    });

    return [...array, ...childArr];
};

//注意path改了底层也要更着改？？？？
const EditableDirectoryTree = ({
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
    const [showLine, setShowLine] = useState<boolean>(true);
    const [showIcon, setShowIcon] = useState<boolean>(false);
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

    useEffect(() => {
        // const list = JSON.parse(JSON.stringify(rootPath))
        // const treeData = reatPathTree(rootPath)
        setSelectKeys(selectedKeys);
        let newExpandItems = deepTreeFilter(treeData, (item) => {
            if (!item.isLeaf && selectedKeys.includes(item.key)){
                return true;
            }
            if (item.children) {
                let selectedchildren = item.children.filter( ({ key }) => selectedKeys.includes(key))
                if (selectedchildren.length > 0){
                    return true;
                }
            }
            return false;
        });
        let newExpandKeys = newExpandItems.map((item) => { return item.key; });
        handleExpand([...expandKeys, ...newExpandKeys]);

    }, [selectedKeys])

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

    let lastSelectNode = null;
    const handleNodeSelect = (
        selectedKeys: (string | number)[],
        info?: { nativeEvent: MouseEvent, node:any }
    ) => {
        const inputId: any = (info?.nativeEvent?.target as HTMLInputElement)?.id
        // 防止选中input所在的节点
        if (inputId !== INPUT_ID) {
            //if (lastSelectNode == 
            setSelectKeys(selectedKeys);
            onSelect && onSelect(selectedKeys, info?.node);
        }
    }

    const handleExpand = (expandedKeys: Key[], info?: {expanded: boolean, node: any}) => {
        setExpandKeys([...new Set(expandedKeys)]);
        //setAutoExpand(false)
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
    };
    console.log('render==', treeData);
    console.log('rightClickKey==', rightClickKey);
    return (
        <div style={{ display: 'flex'}}>
            {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input.Search
                    placeholder="input search text"
                    onSearch={onSearch}
                    style={{ width: 180 }}
                />
            </div> */}
            <DirectoryTree
                showLine={showLine}
                style={{ width: '100%' }}
                //draggable
                switcherIcon={<DownOutlined />}
                showIcon={showIcon}
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

export default EditableDirectoryTree