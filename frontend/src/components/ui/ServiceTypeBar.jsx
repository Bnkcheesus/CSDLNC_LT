import React from 'react';

const TYPES = [
    { key: 'all', label: 'Tất cả dịch vụ' },
    { key: 'KB', label: 'Khám bệnh' },
    { key: 'TP', label: 'Tiêm phòng' },
    { key: 'MH', label: 'Mua hàng' },
];

export default function ServiceTypeBar({ active = 'all', onChange }) {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4">
        <ul className="flex gap-3 py-3 text-sm">
          {TYPES.map((t) => {
            const isActive = active === t.key;
            return (
              <li key={t.key}>
                <button
                  onClick={() => onChange && onChange(t.key)}
                  className={
                    "px-4 py-2 rounded-sm transition-colors " +
                    (isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-700 hover:bg-blue-50")
                  }
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}