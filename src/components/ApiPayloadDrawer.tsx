import React, { useState } from 'react';
import { HdbRecord } from '../types/hdb';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface ApiPayloadDrawerProps {
  town: string;
  flatType: string;
  records: HdbRecord[];
}

export const ApiPayloadDrawer: React.FC<ApiPayloadDrawerProps> = ({
  town,
  flatType,
  records,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<'curl' | 'json' | null>(null);

  const filterObj: Record<string, string> = {};
  if (town && town !== 'ALL') filterObj.town = town;
  if (flatType && flatType !== 'ALL') filterObj.flat_type = flatType;

  const filtersString = JSON.stringify(filterObj);

  // Exact curl command matching user specification
  const curlCommand = `curl -G "https://data.gov.sg/api/action/datastore_search" \\
  --data-urlencode "resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc" \\
  --data-urlencode 'filters=${filtersString}' \\
  --data-urlencode "limit=5" \\
  --data-urlencode "sort=month desc"`;

  const top5Records = records.slice(0, 5).map((r) => ({
    _id: r._id,
    month: r.month,
    town: r.town,
    flat_type: r.flat_type,
    block: r.block,
    street_name: r.street_name,
    storey_range: r.storey_range,
    floor_area_sqm: r.floor_area_sqm.toFixed(2),
    flat_model: r.flat_model,
    lease_commence_date: String(r.lease_commence_date),
    remaining_lease: r.remaining_lease,
    resale_price: String(r.resale_price),
  }));

  const jsonPayloadString = JSON.stringify(top5Records, null, 2);

  const copyToClipboard = (text: string, type: 'curl' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
            <Terminal className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Developer API & Response Inspector</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Data.gov.sg JSON
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inspect the exact curl command and JSON payload structure for {town} · {flatType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
          <span>{isOpen ? 'Collapse' : 'Expand Inspector'}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-neutral-200 p-5 bg-neutral-950 text-neutral-200 space-y-5 animate-in fade-in duration-150">
          {/* Curl Command Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-neutral-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-rose-400" />
                Equivalent cURL Query
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(curlCommand, 'curl')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                {copiedType === 'curl' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-neutral-800 leading-relaxed">
              {curlCommand}
            </pre>
          </div>

          {/* JSON Payload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-neutral-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Sample API Response (5 Transacted Records)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(jsonPayloadString, 'json')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                {copiedType === 'json' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-neutral-900 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-72 border border-neutral-800 leading-relaxed">
              {jsonPayloadString}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};
