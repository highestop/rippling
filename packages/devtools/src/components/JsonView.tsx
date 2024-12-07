import ReactJson from 'react-json-view';
import { getMockJsonData } from '../mocks/mockJsonData';

export function JsonView() {
  const jsonData = getMockJsonData();

  return (
    <ReactJson
      src={jsonData}
      theme={{
        base00: '#ffffff', // 背景色
        base01: '#f5f5f5', // 展开/折叠按钮背景
        base02: '#e8eaed', // 鼠标悬停背景
        base03: '#666666', // 键名颜色
        base04: '#999999', // 次要文本
        base05: '#202124', // 主要文本
        base06: '#1a73e8', // 链接颜色
        base07: '#202124', // 主要文本
        base08: '#c41a16', // null/undefined
        base09: '#1c00cf', // 数字/布尔值
        base0A: '#aa5d00', // 数组/对象
        base0B: '#007400', // 字符串
        base0C: '#aa5d00', // 日期
        base0D: '#aa5d00', // URL
        base0E: '#aa5d00', // 正则表达式
        base0F: '#aa5d00', // 函数
      }}
      displayDataTypes={false}
      enableClipboard={false}
      collapsed={1}
      style={{
        fontFamily: 'Consolas, Menlo, monospace',
        fontSize: '11px',
        lineHeight: '14px',
        height: '100%',
        backgroundColor: '#ffffff',
      }}
    />
  );
}
