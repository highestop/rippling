import { useGet } from 'rippling';
import { generateMockEvents } from '../mocks/mockEvents';
import { selectedStoreIndex } from '../atoms/selectedStore';

const events = generateMockEvents();
export function EventLog() {
  const index = useGet(selectedStoreIndex);
  if (index === undefined) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) +
      '.' +
      date.getMilliseconds().toString().padStart(3, '0')
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-2 border-b border-[#e0e0e0] flex justify-between items-center bg-[#f3f3f3]">
        <div></div>
        <div className="relative">
          <input
            type="text"
            placeholder="debug label"
            className="h-[20px] pl-[20px] pr-2 rounded text-[11px] bg-white border border-[#ccc] focus:outline-none focus:border-[#2196f3] focus:ring-1 focus:ring-[#2196f3] placeholder:text-[#999]"
          />
          <svg
            className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#666]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse text-[11px] leading-[14px]">
          <thead>
            <tr className="bg-[#f3f3f3] text-[#5f6368]">
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Time</th>
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Op</th>
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Atom</th>
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Atom Type</th>
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Args</th>
              <th className="text-left py-[3px] px-[6px] font-normal border-b border-[#e0e0e0]">Return</th>
            </tr>
          </thead>
          <tbody className="text-[#333]">
            {events.map((event, index) => (
              <tr
                key={index}
                className={`border-b border-[#e0e0e0] hover:bg-[#f5f5f5] ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                }`}
              >
                <td className="py-[1px] px-[6px] font-mono">{formatTimestamp(event.timestamp)}</td>
                <td className="py-[1px] px-[6px]">{event.type.toUpperCase()}</td>
                <td className="py-[1px] px-[6px]">{event.target}</td>
                <td className="py-[1px] px-[6px]">{event.targetType}</td>
                <td className="py-[1px] px-[6px]">{event.argsType ?? '-'}</td>
                <td className="py-[1px] px-[6px]">{event.returnType ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
