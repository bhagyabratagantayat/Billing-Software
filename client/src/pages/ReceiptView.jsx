import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer, Download, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const numberToWordsIndian = (num) => {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
};

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/receipts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReceipt(res.data);
      } catch (err) {
        toast.error('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/receipts/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${receipt.receiptNo}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!receipt) return <div className="p-8 text-center text-red-500">Receipt not found</div>;

  const cb = (condition) => condition ? "✓" : "";
  const cbClass = (condition) => condition ? "bg-[#1a2e6e] text-white font-black text-[9px]" : "bg-white";

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:p-0">
      
      {/* Controls (Hidden when printing) */}
      <div className="max-w-[720px] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded shadow hover:bg-gray-50">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* A4 Page */}
      <div className="wrap max-w-[720px] mx-auto font-sans print:m-0">
        
        {/* Status Pills */}
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 print:hidden">
          Money Receipt — auto-email + print ready | AYUSH Technologies
        </div>

        <div className="card bg-white border-[2.5px] border-[#1a2e6e] text-[#111]">
          {/* Header */}
          <div className="hdr flex items-center border-b-[2.5px] border-[#1a2e6e] p-[10px_16px] relative">
            <div className="absolute top-2.5 right-3.5 text-[11px] font-bold text-[#222]">Ph.: 8249441129</div>
            
            <svg className="w-[90px] h-[90px] shrink-0" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="44" cy="50" rx="28" ry="11" fill="none" stroke="#2a7de1" strokeWidth="2.2" transform="rotate(-18 44 50)"/>
              <polygon points="44,10 28,62 36,62 44,36 52,62 60,62" fill="#1a2e6e"/>
              <polygon points="34,50 54,50 52,56 36,56" fill="#1a2e6e"/>
              <rect x="33" y="30" width="22" height="5" fill="#2a7de1"/>
              <rect x="64" y="12" width="5" height="5" fill="#2a7de1" opacity="0.9"/>
              <rect x="70" y="8" width="4" height="4" fill="#2a7de1" opacity="0.7"/>
              <rect x="69" y="15" width="3" height="3" fill="#1a2e6e" opacity="0.5"/>
              <rect x="75" y="12" width="3" height="3" fill="#2a7de1" opacity="0.4"/>
              <text x="44" y="78" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1a2e6e" fontFamily="Arial" letterSpacing="2">AYUSH</text>
              <text x="44" y="86" textAnchor="middle" fontSize="5.5" fill="#2a7de1" fontFamily="Arial" letterSpacing="1.5">TECHNOLOGIES</text>
            </svg>

            <div className="flex-1 text-center px-2">
              <h1 className="text-[26px] font-black text-[#1a2e6e] tracking-[1px] mb-1">AYUSH TECHNOLOGIES</h1>
              <p className="text-[10.5px] text-[#222] leading-[1.6]">Corporate Office : BDA Market complex, Block-A, Baramunda, Bhubaneswar, Odisha 751003</p>
              <p className="text-[10.5px] text-[#222] leading-[1.6]">Email : founder@ayushtechnologies.in</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-[9px_16px] border-b border-[#1a2e6e]">
            <div className="text-xs">Receipt No. : <b className="text-[#1a2e6e]">{receipt.receiptNo}</b></div>
            <div className="bg-[#1a2e6e] text-white text-base font-black px-9 py-2 tracking-[1.5px]">MONEY RECEIPT</div>
            <div className="text-xs">Date : <b className="text-[#1a2e6e] border-b border-[#1a2e6e] pl-1 pr-12 pb-[1px]">{new Date(receipt.date).toLocaleDateString('en-IN')}</b></div>
          </div>

          <div className="p-[9px_16px] border-b border-[#ddd] text-xs flex items-baseline gap-1.5">
            <span className="whitespace-nowrap">Received with thanks from Mr. / Mrs. / M/s.</span>
            <span className="font-bold text-[#1a2e6e] border-b border-[#555] flex-1 pb-[1px] min-w-0">{receipt.clientName}</span>
          </div>

          <div className="p-[9px_16px] border-b border-[#ddd] text-xs flex items-baseline gap-1.5">
            <span className="whitespace-nowrap">the sum of Rupees (in words)</span>
            <span className="font-bold text-[#1a2e6e] border-b border-[#555] flex-1 pb-[1px] min-w-0">{numberToWordsIndian(receipt.amount)}</span>
          </div>

          <div className="p-[9px_16px] border-b border-[#ddd] flex items-center gap-3.5 text-xs">
            <span>Rupees (in figures)</span>
            <div className="flex border-[1.5px] border-[#1a2e6e]">
              <div className="bg-[#1a2e6e] text-white font-black text-[13px] px-[11px] py-[5px]">₹</div>
              <div className="px-[10px] pr-[56px] py-[5px] font-bold text-[13px] text-[#1a2e6e] border-l border-[#1a2e6e]">{Number(receipt.amount).toFixed(2)}</div>
            </div>
          </div>

          <div className="p-[9px_16px] border-b border-[#ddd] text-xs flex items-baseline gap-1.5">
            <span className="whitespace-nowrap">Towards</span>
            <span className="font-normal text-[#333] border-b border-[#555] flex-1 pb-[1px] min-w-0">{receipt.purpose}</span>
          </div>

          <div className="m-[7px_16px] border-[1.5px] border-[#1a2e6e] p-[7px_12px_9px]">
            <div className="text-[11px] font-bold text-center mb-[7px]">Paid by &nbsp;<span className="font-normal">(Please tick in the appropriate box)</span></div>
            <div className="flex items-center justify-around text-[11.5px] font-bold">
              <div className="flex items-center gap-1.5"><div className={`w-[13px] h-[13px] border-[1.5px] border-[#333] flex items-center justify-center shrink-0 ${cbClass(receipt.paymentMode === 'Cash')}`}>{cb(receipt.paymentMode === 'Cash')}</div> CASH</div>
              <div className="w-[1px] h-4 bg-[#1a2e6e]"></div>
              <div className="flex items-center gap-1.5"><div className={`w-[13px] h-[13px] border-[1.5px] border-[#333] flex items-center justify-center shrink-0 ${cbClass(receipt.paymentMode === 'Online')}`}>{cb(receipt.paymentMode === 'Online')}</div> ONLINE</div>
              <div className="w-[1px] h-4 bg-[#1a2e6e]"></div>
              <div className="flex items-center gap-1.5"><div className={`w-[13px] h-[13px] border-[1.5px] border-[#333] flex items-center justify-center shrink-0 ${cbClass(receipt.paymentMode === 'UPI')}`}>{cb(receipt.paymentMode === 'UPI')}</div> UPI</div>
              <div className="w-[1px] h-4 bg-[#1a2e6e]"></div>
              <div className="flex items-center gap-1.5"><div className={`w-[13px] h-[13px] border-[1.5px] border-[#333] flex items-center justify-center shrink-0 ${cbClass(receipt.paymentMode === 'Cheque')}`}>{cb(receipt.paymentMode === 'Cheque')}</div> CHEQUE</div>
              <div className="w-[1px] h-4 bg-[#1a2e6e]"></div>
              <div className="flex items-center gap-1.5"><div className={`w-[13px] h-[13px] border-[1.5px] border-[#333] flex items-center justify-center shrink-0 ${cbClass(['Bank Transfer', 'NEFT', 'RTGS'].includes(receipt.paymentMode))}`}>{cb(['Bank Transfer', 'NEFT', 'RTGS'].includes(receipt.paymentMode))}</div> BANK TRANSFER</div>
            </div>
          </div>

          <div className="p-[7px_16px] border-b border-[#ddd] text-[11.5px] grid grid-cols-[1fr_auto] gap-3 items-baseline">
            <div className="text-[#111]">Transaction / Cheque / UTR No. &nbsp;<b className="text-[#1a2e6e] border-b border-[#555] pb-[1px]">{receipt.utrNo || 'N/A'}</b></div>
            <div className="flex gap-2">Date &nbsp;<b className="text-[#1a2e6e] border-b border-[#555] pb-[1px] pr-10">{new Date(receipt.date).toLocaleDateString('en-IN')}</b></div>
          </div>

          <div className="grid grid-cols-2 p-[6px_16px] border-b border-[#ddd] text-[11.5px] gap-3">
            <div>Bank Name <b className="text-[#1a2e6e] border-b border-[#555] pb-[1px] ml-1">{receipt.bankName || 'N/A'}</b></div>
            <div>Branch <b className="text-[#1a2e6e] border-b border-[#555] pb-[1px] ml-1">{receipt.branch || 'N/A'}</b></div>
          </div>

          <div className="p-[6px_16px] border-b border-[#ddd] text-[11.5px]">
            Remarks (if any) <b className="text-[#333] font-normal border-b border-[#aaa] pb-[1px] ml-1">{receipt.remarks || 'None'}</b>
          </div>

          <div className="flex items-end justify-between p-[9px_16px] border-b border-[#ddd]">
            <div className="flex border-[1.5px] border-[#1a2e6e]">
              <div className="bg-[#1a2e6e] text-white font-black text-[13px] px-3 py-1.5">Rs.</div>
              <div className="px-2.5 pr-14 py-1.5 font-bold text-[13px] text-[#1a2e6e]">{Number(receipt.amount).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="border-[1.5px] border-[#1a2e6e] w-[130px] h-[42px] mb-1 ml-auto"></div>
              <div className="text-[10px] text-[#333]">Authorised Signature</div>
            </div>
          </div>

          <div className="text-center p-[7px_16px] italic text-[12.5px] font-bold text-[#1a2e6e] border-b-2 border-[#1a2e6e]">
            — Thank you for your payment! —
          </div>

          <div className="grid grid-cols-4 text-[11px]">
            <div className="p-[8px_10px_6px] border-r border-[#1a2e6e]"><div className="text-[#333] mb-3.5">Received by</div><div className="border-b border-[#555]"></div></div>
            <div className="p-[8px_10px_6px] border-r border-[#1a2e6e]"><div className="text-[#333] mb-3.5">Prepared by</div><div className="border-b border-[#555]"></div></div>
            <div className="p-[8px_10px_6px] border-r border-[#1a2e6e]"><div className="text-[#333] mb-3.5">Checked by</div><div className="border-b border-[#555]"></div></div>
            <div className="p-[8px_10px_6px]"><div className="text-[#333] mb-3.5">Approved by</div><div className="border-b border-[#555]"></div></div>
          </div>

        </div>

        {/* Footer actions info */}
        <div className="mt-2.5 flex gap-2.5 flex-wrap print:hidden">
          {receipt.emailSent && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#3b6d11] bg-[#eaf3de] border-[0.5px] border-[#c0dd97] rounded-md px-3 py-1">
              <Mail size={14} /> Auto-sent to: {receipt.email}
            </div>
          )}
          {receipt.pdfUrl && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#0c447c] bg-[#e6f1fb] border-[0.5px] border-[#b5d4f4] rounded-md px-3 py-1">
              <Download size={14} /> PDF saved · {receipt.receiptNo}.pdf
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReceiptView;
