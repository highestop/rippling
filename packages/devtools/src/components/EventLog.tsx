function generateMockEvents() {
  const types = ['get', 'set', 'sub', 'unsub', 'notify'];
  const targetTypes = ['value', 'computed', 'effect'];
  const targets = ['user', 'cart', 'products', 'orders', 'settings'];

  const events = Array.from({ length: 100 }, () => {
    const type = types[Math.floor(Math.random() * types.length)];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];

    return {
      type,
      target,
      targetType,
      argsType: type === 'set' ? 'string | number' : undefined,
      returnType: type === 'get' ? 'string | number' : undefined,
      timestamp: Date.now() - Math.floor(Math.random() * 1000000),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  return events;
}

export function EventLog() {
  const events = generateMockEvents();

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
    <div className="h-full border-b border-[#eee8d5] bg-[#fdf6e3] flex flex-col">
      <div className="p-2 bg-[#e4ddc9] flex justify-between items-center">
        <div></div>
        <div>
          <input
            type="text"
            placeholder="debug label"
            className="px-3 py-1 rounded border border-[#93a1a1] bg-[#fdf6e3] text-[#586e75] text-sm focus:outline-none focus:border-[#586e75]"
          />
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-[#586e75]">
          <thead>
            <tr className="bg-[#eee8d5]">
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Op</th>
              <th className="text-left p-2">Atom</th>
              <th className="text-left p-2">Atom Type</th>
              <th className="text-left p-2">Args</th>
              <th className="text-left p-2">Return</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index} className="border-b border-[#eee8d5]">
                <td className="p-2">{formatTimestamp(event.timestamp)}</td>
                <td className="p-2">{event.type}</td>
                <td className="p-2">{event.target}</td>
                <td className="p-2">{event.targetType}</td>
                <td className="p-2">{event.argsType ?? '-'}</td>
                <td className="p-2">{event.returnType ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
