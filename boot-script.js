/**
 * 智能地址订单管理系统 - Bootstrap版本脚本文件
 * 支持拼多多、抖音、淘宝三个平台的地址处理和订单管理
 */

// 防止移动端滑动刷新
let startY = 0;
let isAtTop = false;
let isAtBottom = false;

document.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
    isAtTop = window.scrollY === 0;
    isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    const currentY = e.touches[0].clientY;
    const diffY = startY - currentY;
    
    // 防止在顶部向下滑动刷新
    if (isAtTop && diffY < 0) {
        e.preventDefault();
    }
    
    // 防止在底部向上滑动刷新
    if (isAtBottom && diffY > 0) {
        e.preventDefault();
    }
}, { passive: false });

// 工具函数
function buildTableElement(data) {
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover';
    const thead = document.createElement('thead');
    thead.className = 'table-dark';
    const trHead = document.createElement('tr');
    const headers = ['序号', '订单信息'];
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    const tbody = document.createElement('tbody');
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        const cells = [
            String(index + 1),
            item.fullResult || ''
        ];
        cells.forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

function buildPrintTableInto(element, data) {
    element.innerHTML = '';
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const headers = ['序号', '订单信息'];
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    const tbody = document.createElement('tbody');
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        const cells = [
            String(index + 1),
            item.fullResult || ''
        ];
        cells.forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    element.appendChild(thead);
    element.appendChild(tbody);
}

function csvEscape(value) {
    const str = (value ?? '').toString().replace(/"/g, '""');
    return '"' + str + '"';
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (show) {
        loadingEl.classList.remove('d-none');
    } else {
        loadingEl.classList.add('d-none');
    }
}

function withVisiblePrintContainer(run) {
    const pc = document.getElementById('print-container');
    const prev = { display: pc.style.display, position: pc.style.position, left: pc.style.left, top: pc.style.top };
    pc.style.display = 'block';
    pc.style.position = 'fixed';
    pc.style.left = '-99999px';
    pc.style.top = '0';
    const finalize = () => {
        pc.style.display = prev.display;
        pc.style.position = prev.position;
        pc.style.left = prev.left;
        pc.style.top = prev.top;
    };
    return run().finally(finalize);
}

// 产品选项配置
const productOptions = [
    { id: 'p5-white', name: '5支装白色', group: '5支装', color: '白色' },
    { id: 'p5-3color', name: '5支装3色', group: '5支装', color: '3色' },
    { id: 'p5-5color', name: '5支装彩色', group: '5支装', color: '彩色' },
    { id: 'p72-white', name: '72支装白色', group: '72支装', color: '白色' },
    { id: 'p72-3color', name: '72支装3色', group: '72支装', color: '3色' },
    { id: 'p72-6color', name: '72支装彩色', group: '72支装', color: '彩色' },
    { id: 'gift-bag', name: '礼品袋', group: '礼品袋', color: '' }
];

// 统一的地址处理函数
function processAddresses(platform, input) {
    const resultDiv = document.getElementById(`${platform}-result`);
    const outputDiv = document.getElementById(`${platform}-output`);
    const orderSection = document.getElementById(`${platform}-order-section`);
    const finalResultDiv = document.getElementById(`${platform}-final-result`);
    const tablePreviewDiv = document.getElementById(`${platform}-table-preview`);
    
    if (!input) {
        // 使用Bootstrap的toast显示错误消息
        showToast(`请输入${platform === 'pdd' ? '拼多多' : platform === 'dy' ? '抖音' : '淘宝'}地址`, 'danger');
        return;
    }
    
    let results = [];
    
    if (platform === 'pdd') {
        // 拼多多处理逻辑 - 支持分号分隔的格式
        let processedInput = input;
        
        // 处理分号分隔的格式
        if (input.includes('；')) {
            // 将分号替换为换行符，并清理多余的换行
            processedInput = input.replace(/；\s*/g, '\n').replace(/\n+/g, '\n').trim();
        }
        
        const lines = processedInput.split('\n').filter(line => line.trim() !== '');
        
        // 检查行数是否为3的倍数
        if (lines.length % 3 !== 0) {
            showToast(`输入的总行数应为3的倍数（姓名、电话、地址）。当前行数：${lines.length}。请检查后重试。`, 'danger');
            return;
        }
        
        for (let i = 0; i < lines.length; i += 3) {
            let nameLine = lines[i].trim();
            let phoneLine = lines[i + 1].trim();
            let addressLine = lines[i + 2].trim();
            
            // 清理地址中的多余分号和编号
            addressLine = addressLine.replace(/；\s*$/, '').replace(/\[\d+\]；\s*$/, '').trim();
            
            if (nameLine.includes('[') && nameLine.includes(']')) {
                results.push({
                    shortAddress: nameLine,
                    originalName: nameLine,
                    phone: phoneLine,
                    address: addressLine
                });
            } else {
                if (phoneLine.length >= 4) {
                    const phoneSuffix = phoneLine.slice(-4);
                    results.push({
                        shortAddress: `${nameLine}-${phoneSuffix}`,
                        originalName: nameLine,
                        phone: phoneLine,
                        address: addressLine
                    });
                } else {
                    results.push({
                        shortAddress: `${nameLine}-${phoneLine}`,
                        originalName: nameLine,
                        phone: phoneLine,
                        address: addressLine
                    });
                }
            }
        }
    } else if (platform === 'dy') {
        // 抖音处理逻辑
        const lines = input.split('\n').filter(line => line.trim() !== '');
        
        for (const rawLine of lines) {
            const line = rawLine.replace(/，/g, ',');
            const parts = line.split(',').map(p => p.trim()).filter(Boolean);
            if (parts.length < 2) continue;
            
            const namePart = parts[0];
            const phonePart = parts[1] || '';
            const addressPart = parts.slice(2).join(',');
            
            let phoneSuffix = '';
            let phoneNumber = phonePart;
            if (phoneNumber) {
                const hyphenParts = phoneNumber.split('-');
                if (hyphenParts.length >= 2) {
                    phoneSuffix = '-' + hyphenParts[1];
                    phoneNumber = hyphenParts[0];
                } else {
                    phoneSuffix = '-' + (phoneNumber.length >= 4 ? phoneNumber.slice(-4) : phoneNumber);
                }
            }
            
            results.push({
                shortAddress: namePart + phoneSuffix,
                originalName: namePart,
                phone: phoneNumber,
                address: addressPart
            });
        }
    } else if (platform === 'tb') {
        // 淘宝处理逻辑
        const lines = input.split('\n').filter(line => line.trim() !== '');
        
        for (const rawLine of lines) {
            const line = rawLine.replace(/，/g, ',');
            const parts = line.split(',');
            if (parts.length < 2) continue;
            const phonePart = parts.length >= 3 ? parts[parts.length - 1].trim() : '';
            const namePart = parts[parts.length - 2].trim();
            const addressPart = parts.slice(0, parts.length - 2).join(',').trim();
            
            let phoneSuffix = '';
            let phoneNumber = phonePart;
            if (phoneNumber) {
                const phoneHyphenParts = phoneNumber.split('-');
                if (phoneHyphenParts.length >= 2) {
                    phoneSuffix = '-' + phoneHyphenParts[1];
                } else {
                    phoneSuffix = '-' + (phoneNumber.length >= 4 ? phoneNumber.slice(-4) : phoneNumber);
                }
            }
            
            results.push({
                shortAddress: namePart + phoneSuffix,
                originalName: namePart,
                phone: phoneNumber,
                address: addressPart
            });
        }
    }
    
    if (results.length === 0) {
        outputDiv.textContent = '无法提取信息，请检查输入格式';
        orderSection.classList.add('d-none');
    } else {
        outputDiv.textContent = results.map(item => item.shortAddress).join('\n');
        orderSection.classList.remove('d-none');
        document.getElementById(`${platform}-output`).dataset.fullData = JSON.stringify(results);
        document.getElementById(`${platform}-address-list`).innerHTML = '';
        results.forEach((addressData, index) => {
            addAddressItem(addressData.shortAddress, index, platform);
        });
    }
    
    resultDiv.classList.remove('d-none');
    finalResultDiv.classList.add('d-none');
    tablePreviewDiv.classList.add('d-none');
}

// 添加地址项
function addAddressItem(address, index, platform) {
    const addressList = document.getElementById(`${platform}-address-list`);
    
    const addressItem = document.createElement('div');
    addressItem.className = 'address-item p-3 mb-3';
    addressItem.id = `${platform}-address-item-${index}`;
    
    let addressOptionsHtml = '';
    productOptions.forEach(option => {
        addressOptionsHtml += `
            <div class="address-order-option p-2 me-2 mb-2 d-inline-flex align-items-center">
                <input type="checkbox" id="${option.id}-${index}-${platform}" class="form-check-input address-order-checkbox me-1">
                <label for="${option.id}-${index}-${platform}" class="form-check-label me-1 small">${option.name}</label>
                <input type="number" id="${option.id}-qty-${index}-${platform}" class="form-control address-quantity" min="0" value="0">
            </div>
        `;
    });
    
    addressItem.innerHTML = `
        <div class="row">
            <div class="col-12 col-lg-4 mb-2">
                <div class="fw-bold text-primary address-text"></div>
            </div>
            <div class="col-12 col-lg-8">
                <div class="address-order-options d-flex flex-wrap">
                    ${addressOptionsHtml}
                </div>
            </div>
        </div>
    `;
    
    addressList.appendChild(addressItem);
    addressItem.querySelector('.address-text').textContent = address;
    
    // 为每个地址的产品选项添加事件监听器
    productOptions.forEach(option => {
        const checkbox = document.getElementById(`${option.id}-${index}-${platform}`);
        const qtyInput = document.getElementById(`${option.id}-qty-${index}-${platform}`);
        
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (qtyInput.value === '0') {
                    qtyInput.value = '1';
                }
            } else {
                qtyInput.value = '0';
            }
        });
        
        qtyInput.addEventListener('change', function() {
            if (parseInt(this.value) > 0) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
                this.value = '0';
            }
        });
    });
}

// Toast 提示函数
function showToast(message, type = 'info') {
    // 创建toast容器如果不存在
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // 自动删除toast元素
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// 为平台添加订单信息（默认勾选5支装白色，其余不选）
function addOrderInfoForPlatform(platform) {
    const addressItems = document.querySelectorAll(`#${platform}-address-list .address-item`);
    addressItems.forEach(item => {
        const checkboxes = item.querySelectorAll('.address-order-checkbox');
        checkboxes.forEach(checkbox => {
            // 只默认勾选5支装白色
            if (checkbox.id.includes('p5-white')) {
                checkbox.checked = true;
                const qtyInput = checkbox.closest('.address-order-option')?.querySelector('.address-quantity');
                if (qtyInput) {
                    qtyInput.value = '1';
                }
            } else {
                checkbox.checked = false;
                const qtyInput = checkbox.closest('.address-order-option')?.querySelector('.address-quantity');
                if (qtyInput) {
                    qtyInput.value = '0';
                }
            }
        });
    });
}

// 为平台生成最终结果
function generateFinalResultForPlatform(platform) {
    const outputDiv = document.getElementById(`${platform}-output`);
    const finalResultDiv = document.getElementById(`${platform}-final-result`);
    const finalOutputDiv = document.getElementById(`${platform}-final-output`);
    const tablePreviewDiv = document.getElementById(`${platform}-table-preview`);
    
    const addresses = outputDiv.textContent.split('\n').filter(addr => addr.trim() !== '');
    const finalResults = [];
    
    const originalData = JSON.parse(outputDiv.dataset.fullData || '[]');
    
    addresses.forEach((address, index) => {
        const orderInfo = getOrderInfoForAddress(index, platform);
        if (orderInfo) {
            finalResults.push({
                shortAddress: address,
                fullAddress: originalData[index] ? originalData[index].address : '',
                originalName: originalData[index] ? originalData[index].originalName : '',
                phone: originalData[index] ? originalData[index].phone : '',
                orderInfo: orderInfo,
                fullResult: `${address} ${orderInfo}`
            });
        } else {
            finalResults.push({
                shortAddress: address,
                fullAddress: originalData[index] ? originalData[index].address : '',
                originalName: originalData[index] ? originalData[index].originalName : '',
                phone: originalData[index] ? originalData[index].phone : '',
                orderInfo: '',
                fullResult: address
            });
        }
    });
    
    finalOutputDiv.textContent = finalResults.map(item => item.fullResult).join('\n');
    finalResultDiv.classList.remove('d-none');
    
    finalOutputDiv.dataset.fullResultData = JSON.stringify(finalResults);
}

// 获取地址的订单信息
function getOrderInfoForAddress(index, platform) {
    const groups = {
        '5支装': [],
        '72支装': [],
        '礼品袋': []
    };
    
    productOptions.forEach(option => {
        const checkbox = document.getElementById(`${option.id}-${index}-${platform}`);
        const qtyInput = document.getElementById(`${option.id}-qty-${index}-${platform}`);
        
        if (checkbox && qtyInput && checkbox.checked && parseInt(qtyInput.value) > 0) {
            groups[option.group].push({
                name: option.name,
                color: option.color,
                quantity: parseInt(qtyInput.value),
                fullName: option.name
            });
        }
    });
    
    const orderParts = [];
    
    if (groups['5支装'].length > 0) {
        const sortedProducts = sortProductsByColor(groups['5支装'], ['白色', '3色', '5色']);
        const colorParts = sortedProducts.map(product => `${product.color}*${product.quantity}`);
        orderParts.push(`5支装【${colorParts.join('+')}】`);
    }
    
    if (groups['72支装'].length > 0) {
        const sortedProducts = sortProductsByColor(groups['72支装'], ['白色', '3色', '6色']);
        const colorParts = sortedProducts.map(product => `${product.color}*${product.quantity}`);
        orderParts.push(`72支装【${colorParts.join('+')}】`);
    }
    
    if (groups['礼品袋'].length > 0) {
        const giftBagParts = groups['礼品袋'].map(product => `${product.name}*${product.quantity}`);
        orderParts.push(`礼品袋【${giftBagParts.join('+')}】`);
    }
    
    return orderParts.join('+');
}

// 按照颜色顺序排序产品
function sortProductsByColor(products, colorOrder) {
    return products.sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color));
}

// 为平台导出表格
function exportTableForPlatform(platform) {
    const finalOutputDiv = document.getElementById(`${platform}-final-output`);
    const tablePreviewDiv = document.getElementById(`${platform}-table-preview`);
    const tableContainer = document.getElementById(`${platform}-table-container`);
    
    if (!finalOutputDiv.dataset.fullResultData) {
        showToast('请先生成订单信息', 'warning');
        return;
    }
    
    const data = JSON.parse(finalOutputDiv.dataset.fullResultData);
    
    if (data.length === 0) {
        showToast('没有数据可导出', 'warning');
        return;
    }
    
    // 预览表格
    tableContainer.innerHTML = '';
    tableContainer.appendChild(buildTableElement(data));
    tablePreviewDiv.classList.remove('d-none');
    
    // CSV 内容
    let csvContent = '\ufeff';
    csvContent += '序号,订单信息\n';
    data.forEach((item, index) => {
        const row = [
            index + 1,
            item.fullResult
        ].map(csvEscape).join(',');
        csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('download', `${platform === 'pdd' ? '拼多多' : platform === 'tb' ? '淘宝' : '抖音'}订单数据_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('表格已导出成功', 'success');
}

// 为平台导出图片
function exportImageForPlatform(platform) {
    const finalOutputDiv = document.getElementById(`${platform}-final-output`);
    
    if (!finalOutputDiv.dataset.fullResultData) {
        showToast('请先生成订单信息', 'warning');
        return;
    }
    
    const data = JSON.parse(finalOutputDiv.dataset.fullResultData);
    
    if (data.length === 0) {
        showToast('没有数据可导出', 'warning');
        return;
    }
    
    showLoading(true);
    const printContainer = document.getElementById('print-container');
    const printTitle = document.getElementById('print-title');
    const printTable = document.getElementById('print-table');
    const printFooter = document.getElementById('print-footer');
    
    printTitle.textContent = `${platform === 'pdd' ? '拼多多' : platform === 'tb' ? '淘宝' : '抖音'}订单数据`;
    buildPrintTableInto(printTable, data);
    printFooter.textContent = `生成时间：${new Date().toLocaleString()}`;
    
    withVisiblePrintContainer(() => html2canvas(printContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: printContainer.scrollWidth,
        height: printContainer.scrollHeight,
        dpi: 300
    }).then(canvas => {
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            link.setAttribute('download', `${platform === 'pdd' ? '拼多多' : platform === 'tb' ? '淘宝' : '抖音'}订单数据_${timestamp}.png`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('图片已导出成功', 'success');
        });
    }).catch(error => {
        console.error('生成图片失败:', error);
        showToast('生成图片失败，请重试', 'danger');
    }).finally(() => {
        showLoading(false);
    }));
}

// 为平台导出PDF
function exportPdfForPlatform(platform) {
    const finalOutputDiv = document.getElementById(`${platform}-final-output`);
    
    if (!finalOutputDiv.dataset.fullResultData) {
        showToast('请先生成订单信息', 'warning');
        return;
    }
    
    const data = JSON.parse(finalOutputDiv.dataset.fullResultData);
    
    if (data.length === 0) {
        showToast('没有数据可导出', 'warning');
        return;
    }
    
    showLoading(true);
    const printContainer = document.getElementById('print-container');
    const printTitle = document.getElementById('print-title');
    const printTable = document.getElementById('print-table');
    const printFooter = document.getElementById('print-footer');
    
    printTitle.textContent = `${platform === 'pdd' ? '拼多多' : platform === 'tb' ? '淘宝' : '抖音'}订单数据`;
    buildPrintTableInto(printTable, data);
    printFooter.textContent = `生成时间：${new Date().toLocaleString()}`;
    
    withVisiblePrintContainer(() => html2canvas(printContainer, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: printContainer.scrollWidth,
        height: printContainer.scrollHeight,
        dpi: 300
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        pdf.save(`${platform === 'pdd' ? '拼多多' : platform === 'tb' ? '淘宝' : '抖音'}订单数据_${timestamp}.pdf`);
        showToast('PDF已导出成功', 'success');
    }).catch(error => {
        console.error('生成PDF失败:', error);
        showToast('生成PDF失败，请重试', 'danger');
    }).finally(() => {
        showLoading(false);
    }));
}

// 初始化事件监听器
function initializeEventListeners() {
    ['pdd', 'dy', 'tb'].forEach(platform => {
        // 处理地址按钮
        document.getElementById(`${platform}-process-btn`).addEventListener('click', function() {
            const input = document.getElementById(`${platform}-input`).value.trim();
            processAddresses(platform, input);
        });
        
        // 复制结果按钮
        document.getElementById(`${platform}-copy`).addEventListener('click', function() {
            const outputDiv = document.getElementById(`${platform}-output`);
            if (outputDiv.textContent && outputDiv.textContent !== '无法提取信息，请检查输入格式') {
                navigator.clipboard.writeText(outputDiv.textContent).then(function() {
                    showToast(`${platform === 'pdd' ? '拼多多' : platform === 'dy' ? '抖音' : '淘宝'}处理结果已复制到剪贴板`, 'success');
                }).catch(function() {
                    showToast('复制失败，请手动复制', 'danger');
                });
            } else {
                showToast('没有可复制的内容，请先处理地址', 'warning');
            }
        });
        
        // 添加订单信息按钮
        document.getElementById(`${platform}-add-order-btn`).addEventListener('click', function() {
            addOrderInfoForPlatform(platform);
        });
        
        // 生成最终结果按钮
        document.getElementById(`${platform}-generate-final-btn`).addEventListener('click', function() {
            generateFinalResultForPlatform(platform);
        });
        
        // 复制最终结果按钮
        document.getElementById(`${platform}-final-copy`).addEventListener('click', function() {
            const outputDiv = document.getElementById(`${platform}-final-output`);
            if (outputDiv.textContent) {
                navigator.clipboard.writeText(outputDiv.textContent).then(function() {
                    showToast('订单信息已复制到剪贴板', 'success');
                }).catch(function() {
                    showToast('复制失败，请手动复制', 'danger');
                });
            } else {
                showToast('没有可复制的内容，请先生成订单信息', 'warning');
            }
        });
        
        // 导出表格按钮
        document.getElementById(`${platform}-export-table`).addEventListener('click', function() {
            exportTableForPlatform(platform);
        });
        
        // 导出图片按钮
        document.getElementById(`${platform}-export-image`).addEventListener('click', function() {
            exportImageForPlatform(platform);
        });
        
        // 导出PDF按钮
        document.getElementById(`${platform}-export-pdf`).addEventListener('click', function() {
            exportPdfForPlatform(platform);
        });
    });
}

// 当DOM加载完成时初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});
