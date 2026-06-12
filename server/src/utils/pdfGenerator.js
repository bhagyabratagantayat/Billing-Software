const PdfPrinter = require('pdfmake/js/printer').default;
const path = require('path');
const fs = require('fs');
const numberToWordsIndian = require('./numberToWords');

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Medium.ttf'),
    italics: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', '..', 'fonts', 'Roboto-MediumItalic.ttf')
  }
};

const urlResolver = { resolve: () => {}, resolved: async () => {} };
const printer = new PdfPrinter(fonts, null, urlResolver);

const getLogoBase64 = () => {
  const imgPath = path.join(__dirname, '..', 'assets', 'logo.jpeg');
  if (fs.existsSync(imgPath)) {
    const img = fs.readFileSync(imgPath);
    return 'data:image/jpeg;base64,' + img.toString('base64');
  }
  return null;
};

const getSignatureBase64 = () => {
  const imgPath = path.join(__dirname, '..', 'assets', 'signature.png');
  if (fs.existsSync(imgPath)) {
    const img = fs.readFileSync(imgPath);
    return 'data:image/png;base64,' + img.toString('base64');
  }
  return null;
};

// Checkbox helper
const cb = (isChecked) => ({
  text: isChecked ? '✓' : '',
  color: isChecked ? 'white' : 'black',
  fillColor: isChecked ? '#1a2e6e' : 'white',
  alignment: 'center',
  margin: [0, 2, 0, 0]
});

const getReceiptDocDefinition = (data) => {
  const logo = getLogoBase64();
  const signature = getSignatureBase64();
  const amtInWords = numberToWordsIndian(data.amount);
  
  return {
    content: [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                // Inner content of the blue-bordered box
                layout: 'noBorders',
                table: {
                  widths: [80, '*', 100],
                  body: [
                    [
                      logo ? { image: logo, width: 70, margin: [5, 5, 5, 5] } : { text: '', width: 70 },
                      {
                        text: [
                          { text: 'AYUSH TECHNOLOGIES\n', fontSize: 20, bold: true, color: '#1a2e6e', alignment: 'center' },
                          { text: 'Corporate Office : BDA Market complex, Block-A, Baramunda, Bhubaneswar, Odisha 751003\n', fontSize: 8, alignment: 'center' },
                          { text: 'Email : founder@ayushtechnologies.in\n', fontSize: 8, alignment: 'center' }
                        ],
                        margin: [0, 10, 0, 0]
                      },
                      { text: 'Ph.: 8249441129', fontSize: 9, bold: true, alignment: 'right', margin: [0, 10, 10, 0] }
                    ]
                  ]
                }
              }
            ],
            [
              {
                // Title Row
                layout: 'noBorders',
                margin: [5, 5, 5, 5],
                table: {
                  widths: ['auto', '*', 'auto'],
                  body: [
                    [
                      { text: [{ text: 'Receipt No. : ' }, { text: data.receiptNo, bold: true, color: '#1a2e6e' }], fontSize: 10, margin: [0, 5, 0, 0] },
                      { text: 'MONEY RECEIPT', fontSize: 14, bold: true, color: 'white', fillColor: '#1a2e6e', alignment: 'center', margin: [0, 5, 0, 5] },
                      { text: [{ text: 'Date : ' }, { text: new Date(data.date).toLocaleDateString(), bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10, margin: [0, 5, 0, 0] }
                    ]
                  ]
                }
              }
            ],
            [
              { text: [{ text: 'Received with thanks from Mr. / Mrs. / M/s.  ' }, { text: data.clientName, bold: true, color: '#1a2e6e', decoration: 'underline' }], margin: [10, 8, 10, 8], fontSize: 10 }
            ],
            [
              { text: [{ text: 'the sum of Rupees (in words)  ' }, { text: amtInWords, bold: true, color: '#1a2e6e', decoration: 'underline' }], margin: [10, 8, 10, 8], fontSize: 10 }
            ],
            [
              {
                margin: [10, 5, 10, 5],
                layout: 'noBorders',
                table: {
                  widths: ['auto', 100],
                  body: [
                    [
                      { text: 'Rupees (in figures)', fontSize: 10, margin: [0, 5, 10, 0] },
                      {
                        table: {
                          widths: [20, '*'],
                          body: [
                            [
                              { text: '₹', bold: true, color: 'white', fillColor: '#1a2e6e', alignment: 'center', border: [true, true, false, true] },
                              { text: Number(data.amount).toFixed(2), bold: true, color: '#1a2e6e', border: [false, true, true, true], margin: [5, 0, 0, 0] }
                            ]
                          ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
                      }
                    ]
                  ]
                }
              }
            ],
            [
              { text: [{ text: 'Towards  ' }, { text: data.purpose, color: '#333', decoration: 'underline' }], margin: [10, 8, 10, 8], fontSize: 10 }
            ],
            [
              {
                margin: [10, 8, 10, 8],
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        layout: 'noBorders',
                        margin: [5, 5, 5, 5],
                        table: {
                          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                          body: [
                            [
                              { text: 'Paid by (Please tick in the appropriate box)', fontSize: 9, bold: true, colSpan: 11, alignment: 'center', margin: [0, 0, 0, 5] },
                              {},{},{},{},{},{},{},{},{},{}
                            ],
                            [
                              cb(data.paymentMode === 'Cash'), { text: ' CASH', fontSize: 9, margin: [2, 2, 10, 0] },
                              cb(data.paymentMode === 'Online'), { text: ' ONLINE', fontSize: 9, margin: [2, 2, 10, 0] },
                              cb(data.paymentMode === 'UPI'), { text: ' UPI', fontSize: 9, margin: [2, 2, 10, 0] },
                              cb(data.paymentMode === 'Cheque'), { text: ' CHEQUE', fontSize: 9, margin: [2, 2, 10, 0] },
                              cb(data.paymentMode === 'Bank Transfer' || data.paymentMode === 'NEFT' || data.paymentMode === 'RTGS'), { text: ' BANK TRANSFER', fontSize: 9, margin: [2, 2, 0, 0] },
                              {}
                            ]
                          ]
                        }
                      }
                    ]
                  ]
                },
                layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
              }
            ],
            [
              {
                layout: 'noBorders',
                margin: [10, 5, 10, 5],
                table: {
                  widths: ['*', 'auto'],
                  body: [
                    [
                      { text: [{ text: 'Transaction / Cheque / UTR No.  ' }, { text: data.utrNo || 'N/A', bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10 },
                      { text: [{ text: 'Date  ' }, { text: new Date(data.date).toLocaleDateString(), bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10 }
                    ]
                  ]
                }
              }
            ],
            [
              {
                layout: 'noBorders',
                margin: [10, 5, 10, 5],
                table: {
                  widths: ['*', '*'],
                  body: [
                    [
                      { text: [{ text: 'Bank Name  ' }, { text: data.bankName || 'N/A', bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10 },
                      { text: [{ text: 'Branch  ' }, { text: data.branch || 'N/A', bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10 }
                    ]
                  ]
                }
              }
            ],
            [
              { text: [{ text: 'Remarks (if any)  ' }, { text: data.remarks || 'None', color: '#333', decoration: 'underline' }], margin: [10, 5, 10, 5], fontSize: 10 }
            ],
            [
              {
                margin: [10, 15, 10, 5],
                layout: 'noBorders',
                table: {
                  widths: ['*', 120],
                  body: [
                    [
                      {
                        table: {
                          widths: [20, 80],
                          body: [
                            [
                              { text: 'Rs.', bold: true, color: 'white', fillColor: '#1a2e6e', alignment: 'center', border: [true, true, false, true] },
                              { text: Number(data.amount).toFixed(2), bold: true, color: '#1a2e6e', border: [false, true, true, true], margin: [5, 0, 0, 0] }
                            ]
                          ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
                      },
                      {
                        table: {
                          widths: ['*'],
                          body: [
                            [signature ? { image: signature, width: 80, alignment: 'center', margin: [0, 5, 0, 5], border: [true, true, true, true] } : { text: '', border: [true, true, true, true], margin: [0, 15, 0, 15] }], // Signature box
                            [{ text: 'Authorised Signature', fontSize: 8, alignment: 'center', border: [false, false, false, false] }]
                          ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
                      }
                    ]
                  ]
                }
              }
            ],
            [
              { text: '— Thank you for your payment! —', alignment: 'center', bold: true, color: '#1a2e6e', fontSize: 10, margin: [0, 5, 0, 5] }
            ],
            [
              {
                margin: [0, 0, 0, 0],
                layout: { hLineWidth: () => 0, vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0 : 1, vLineColor: () => '#1a2e6e' },
                table: {
                  widths: ['*', '*', '*', '*'],
                  body: [
                    [
                      { text: 'Received by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
                      { text: 'Prepared by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
                      { text: 'Checked by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] },
                      { text: 'Approved by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 5, 0, 5] }
                    ]
                  ]
                }
              }
            ]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 0;
          },
          hLineColor: function (i) { return '#1a2e6e'; },
          vLineColor: function (i) { return '#1a2e6e'; }
        }
      }
    ],
    defaultStyle: { font: 'Roboto' }
  };
};

const getVoucherDocDefinition = (data) => {
  const logo = getLogoBase64();
  const signature = getSignatureBase64();
  const amtInWords = numberToWordsIndian(data.amount);

  return {
    content: [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                layout: 'noBorders',
                table: {
                  widths: [80, '*', 100],
                  body: [
                    [
                      logo ? { image: logo, width: 70, margin: [5, 5, 5, 5] } : { text: '', width: 70 },
                      {
                        text: [
                          { text: 'AYUSH TECHNOLOGIES\n', fontSize: 20, bold: true, color: '#1a2e6e', alignment: 'center' },
                          { text: 'Corporate Office : BDA Market complex, Block-A, Baramunda, Bhubaneswar, Odisha 751003\n', fontSize: 8, alignment: 'center' },
                          { text: 'Email : founder@ayushtechnologies.in\n', fontSize: 8, alignment: 'center' }
                        ],
                        margin: [0, 10, 0, 0]
                      },
                      { text: 'Ph.: 8249441129', fontSize: 9, bold: true, alignment: 'right', margin: [0, 10, 10, 0] }
                    ]
                  ]
                }
              }
            ],
            [
              {
                layout: 'noBorders',
                margin: [5, 5, 5, 5],
                table: {
                  widths: ['auto', '*', 'auto'],
                  body: [
                    [
                      { text: [{ text: 'Ref. No. : ' }, { text: data.refNo, bold: true, color: '#1a2e6e' }], fontSize: 10, margin: [0, 5, 0, 0] },
                      { text: 'PAYMENT VOUCHER', fontSize: 14, bold: true, color: 'white', fillColor: '#1a2e6e', alignment: 'center', margin: [0, 5, 0, 5] },
                      { text: [{ text: 'Date : ' }, { text: new Date(data.date).toLocaleDateString(), bold: true, color: '#1a2e6e', decoration: 'underline' }], fontSize: 10, margin: [0, 5, 0, 0] }
                    ]
                  ]
                }
              }
            ],
            [
              { text: [{ text: 'Paid to Mr. / Mrs. / M/s.  ' }, { text: data.payeeName, bold: true, color: '#1a2e6e', decoration: 'underline' }], margin: [10, 12, 10, 8], fontSize: 10 }
            ],
            [
              { text: [{ text: 'Rupees (in words)  ' }, { text: amtInWords, bold: true, color: '#1a2e6e', decoration: 'underline' }], margin: [10, 8, 10, 12], fontSize: 10 }
            ],
            [
              { text: [{ text: 'Towards  ' }, { text: data.purpose, color: '#333', decoration: 'underline' }], margin: [10, 12, 10, 12], fontSize: 10 }
            ],
            [
              {
                margin: [10, 8, 10, 8],
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        layout: 'noBorders',
                        margin: [5, 5, 5, 5],
                        table: {
                          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                          body: [
                            [
                              { text: 'Payment Mode (Please tick ✓)', fontSize: 9, bold: true, colSpan: 11, alignment: 'left', margin: [0, 0, 0, 5] },
                              {},{},{},{},{},{},{},{},{},{}
                            ],
                            [
                              cb(data.paymentMode === 'Cash'), { text: ' CASH', fontSize: 9, margin: [2, 2, 15, 0] },
                              cb(data.paymentMode === 'Online'), { text: ' ONLINE', fontSize: 9, margin: [2, 2, 15, 0] },
                              cb(data.paymentMode === 'UPI'), { text: ' UPI', fontSize: 9, margin: [2, 2, 15, 0] },
                              cb(data.paymentMode === 'Cheque'), { text: ' CHEQUE', fontSize: 9, margin: [2, 2, 15, 0] },
                              cb(data.paymentMode === 'Bank Transfer' || data.paymentMode === 'NEFT' || data.paymentMode === 'RTGS'), { text: ' BANK TRANSFER', fontSize: 9, margin: [2, 2, 0, 0] },
                              {}
                            ]
                          ]
                        }
                      }
                    ]
                  ]
                },
                layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
              }
            ],
            [
              { text: [{ text: 'Transaction / Cheque / UTR No.  ' }, { text: data.utrNo || 'N/A', bold: true, color: '#1a2e6e', decoration: 'underline' }], margin: [10, 8, 10, 8], fontSize: 10 }
            ],
            [
              {
                margin: [10, 15, 10, 5],
                layout: 'noBorders',
                table: {
                  widths: ['*', 120],
                  body: [
                    [
                      {
                        table: {
                          widths: [20, 80],
                          body: [
                            [
                              { text: 'Rs.', bold: true, color: 'white', fillColor: '#1a2e6e', alignment: 'center', border: [true, true, false, true] },
                              { text: Number(data.amount).toFixed(2), bold: true, color: '#1a2e6e', border: [false, true, true, true], margin: [5, 0, 0, 0] }
                            ]
                          ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
                      },
                      {
                        table: {
                          widths: ['*'],
                          body: [
                            [{ text: '', border: [true, true, true, true], margin: [0, 15, 0, 15] }], // Signature box
                            [{ text: "Payee's Signature", fontSize: 8, alignment: 'center', border: [false, false, false, false] }]
                          ]
                        },
                        layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#1a2e6e', vLineColor: () => '#1a2e6e' }
                      }
                    ]
                  ]
                }
              }
            ],
            [
              {
                margin: [0, 0, 0, 0],
                layout: { hLineWidth: () => 0, vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0 : 1, vLineColor: () => '#1a2e6e' },
                table: {
                  widths: ['*', '*', '*'],
                  body: [
                    [
                      { text: 'Prepared by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 10, 0, 10] },
                      { text: 'Passed by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 10, 0, 10] },
                      signature 
                        ? { stack: [{ text: 'Approved by', fontSize: 9, alignment: 'center' }, { image: signature, width: 80, alignment: 'center', margin: [0, 5, 0, 0] }], margin: [0, 10, 0, 0] } 
                        : { text: 'Approved by\n\n__________________', fontSize: 9, alignment: 'center', margin: [0, 10, 0, 10] }
                    ]
                  ]
                }
              }
            ]
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1;
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 0;
          },
          hLineColor: function (i) { return '#1a2e6e'; },
          vLineColor: function (i) { return '#1a2e6e'; }
        }
      }
    ],
    defaultStyle: { font: 'Roboto' }
  };
};

const generatePDFBuffer = async (docDefinition) => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err) => reject(err));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generatePDFBuffer,
  getReceiptDocDefinition,
  getVoucherDocDefinition
};
