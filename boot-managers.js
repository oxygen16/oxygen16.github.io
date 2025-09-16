/**
 * 智能地址订单管理系统 - 管理器类
 * 地址管理器和导出管理器，整合业务逻辑
 */

/**
 * 地址管理器 - 负责地址处理和订单生成的核心业务逻辑
 */
class AddressManager {
    /**
     * 更新地址处理结果到UI
     * @param {string} platform - 平台标识
     * @param {Array} results - 处理结果
     */
    static updateProcessResults(platform, results) {
        const { DOMUtils } = window.AddressManagerUtils;
        const { TemplateGenerator, ProductOptionEventHandler } = window.AddressManagerEventHandlers;
        
        const elements = DOMUtils.getPlatformElements(platform);
        
        if (results.length === 0) {
            DOMUtils.setTextContent(elements.output, '无法提取信息，请检查输入格式');
            DOMUtils.toggleElement(elements.orderSection, false);
        } else {
            // 更新输出结果
            const shortAddresses = results.map(item => item.shortAddress).join('\n');
            DOMUtils.setTextContent(elements.output, shortAddresses);
            
            // 存储完整数据
            elements.output.dataset.fullData = JSON.stringify(results);
            
            // 显示订单区域
            DOMUtils.toggleElement(elements.orderSection, true);
            
            // 清空并重新生成地址列表
            DOMUtils.clearElement(elements.addressList);
            
            results.forEach((addressData, index) => {
                this.addAddressItem(addressData.shortAddress, index, platform);
            });
        }
        
        // 显示结果区域，隐藏其他区域
        DOMUtils.toggleElements(elements, {
            result: true,
            finalResult: false,
            tablePreview: false
        });
    }

    /**
     * 添加地址项到列表
     * @param {string} address - 地址文本
     * @param {number} index - 索引
     * @param {string} platform - 平台标识
     */
    static addAddressItem(address, index, platform) {
        const { DOMUtils } = window.AddressManagerUtils;
        const { TemplateGenerator, ProductOptionEventHandler } = window.AddressManagerEventHandlers;
        const { CSS_CLASSES } = window.AddressManagerConfig;
        
        const addressList = DOMUtils.getElement(`${platform}-address-list`);
        
        // 创建地址项容器
        const addressItem = document.createElement('div');
        addressItem.className = CSS_CLASSES.addressItem;
        addressItem.id = `${platform}-address-item-${index}`;
        
        // 生成HTML内容
        addressItem.innerHTML = TemplateGenerator.createAddressItem(address, index, platform);
        
        // 添加到列表
        addressList.appendChild(addressItem);
        
        // 添加产品选项事件监听器
        ProductOptionEventHandler.addProductOptionListeners(index, platform);
    }

    /**
     * 为平台添加默认订单信息（5支装白色）
     * @param {string} platform - 平台标识
     */
    static addOrderInfoForPlatform(platform) {
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

    /**
     * 生成最终订单结果
     * @param {string} platform - 平台标识
     */
    static generateFinalResultForPlatform(platform) {
        const { DOMUtils } = window.AddressManagerUtils;
        const elements = DOMUtils.getPlatformElements(platform);
        
        const addresses = elements.output.textContent.split('\n').filter(addr => addr.trim() !== '');
        const originalData = JSON.parse(elements.output.dataset.fullData || '[]');
        const finalResults = [];
        
        addresses.forEach((address, index) => {
            const orderInfo = this.getOrderInfoForAddress(index, platform);
            const fullResult = orderInfo ? `${address} ${orderInfo}` : address;
            
            finalResults.push({
                shortAddress: address,
                fullAddress: originalData[index]?.address || '',
                originalName: originalData[index]?.originalName || '',
                phone: originalData[index]?.phone || '',
                orderInfo: orderInfo,
                fullResult: fullResult
            });
        });
        
        // 更新最终结果显示
        const finalOutput = finalResults.map(item => item.fullResult).join('\n');
        DOMUtils.setTextContent(elements.finalOutput, finalOutput);
        
        // 存储完整结果数据
        elements.finalOutput.dataset.fullResultData = JSON.stringify(finalResults);
        
        // 显示最终结果区域
        DOMUtils.toggleElement(elements.finalResult, true);
    }

    /**
     * 获取地址的订单信息
     * @param {number} index - 地址索引
     * @param {string} platform - 平台标识
     * @returns {string} 订单信息字符串
     */
    static getOrderInfoForAddress(index, platform) {
        const { PRODUCT_OPTIONS, COLOR_ORDER } = window.AddressManagerConfig;
        const { DOMUtils } = window.AddressManagerUtils;
        
        const groups = {
            '5支装': [],
            '72支装': [],
            '礼品袋': []
        };
        
        // 收集选中的产品选项
        PRODUCT_OPTIONS.forEach(option => {
            const checkbox = DOMUtils.getElement(`${option.id}-${index}-${platform}`);
            const qtyInput = DOMUtils.getElement(`${option.id}-qty-${index}-${platform}`);
            
            if (checkbox && qtyInput && checkbox.checked && parseInt(qtyInput.value) > 0) {
                groups[option.group].push({
                    name: option.name,
                    color: option.color,
                    quantity: parseInt(qtyInput.value)
                });
            }
        });
        
        const orderParts = [];
        
        // 处理5支装
        if (groups['5支装'].length > 0) {
            const sortedProducts = this.sortProductsByColor(groups['5支装'], COLOR_ORDER['5支装']);
            const colorParts = sortedProducts.map(product => `${product.color}*${product.quantity}`);
            orderParts.push(`5支装【${colorParts.join('+')}】`);
        }
        
        // 处理72支装
        if (groups['72支装'].length > 0) {
            const sortedProducts = this.sortProductsByColor(groups['72支装'], COLOR_ORDER['72支装']);
            const colorParts = sortedProducts.map(product => `${product.color}*${product.quantity}`);
            orderParts.push(`72支装【${colorParts.join('+')}】`);
        }
        
        // 处理礼品袋
        if (groups['礼品袋'].length > 0) {
            const giftBagParts = groups['礼品袋'].map(product => `${product.name}*${product.quantity}`);
            orderParts.push(`礼品袋【${giftBagParts.join('+')}】`);
        }
        
        return orderParts.join('+');
    }

    /**
     * 按颜色顺序排序产品
     * @param {Array} products - 产品数组
     * @param {Array} colorOrder - 颜色顺序
     * @returns {Array} 排序后的产品数组
     */
    static sortProductsByColor(products, colorOrder) {
        return products.sort((a, b) => {
            const indexA = colorOrder.indexOf(a.color);
            const indexB = colorOrder.indexOf(b.color);
            return indexA - indexB;
        });
    }
}

/**
 * 导出管理器 - 负责各种格式的数据导出
 */
class ExportManager {
    /**
     * 导出表格数据
     * @param {string} platform - 平台标识
     */
    static exportTableForPlatform(platform) {
        const { DOMUtils, FileUtils, MessageUtils } = window.AddressManagerUtils;
        const { TemplateGenerator } = window.AddressManagerEventHandlers;
        
        const elements = DOMUtils.getPlatformElements(platform);
        
        if (!elements.finalOutput.dataset.fullResultData) {
            MessageUtils.showMessage('generateOrderFirst', 'warning');
            return;
        }
        
        const data = JSON.parse(elements.finalOutput.dataset.fullResultData);
        
        if (data.length === 0) {
            MessageUtils.showMessage('noDataToExport', 'warning');
            return;
        }
        
        // 预览表格
        DOMUtils.clearElement(elements.tableContainer);
        const table = TemplateGenerator.buildTableElement(data);
        elements.tableContainer.appendChild(table);
        DOMUtils.toggleElement(elements.tablePreview, true);
        
        // 生成CSV内容
        let csvContent = '\ufeff'; // BOM for UTF-8
        csvContent += '序号,订单信息\n';
        
        data.forEach((item, index) => {
            const row = [
                index + 1,
                item.fullResult
            ].map(value => FileUtils.csvEscape(value)).join(',');
            csvContent += row + '\n';
        });
        
        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = FileUtils.generateFileName(platform, 'csv');
        FileUtils.downloadFile(blob, filename);
        
        MessageUtils.showMessage('exportSuccess', 'success', '表格');
    }

    /**
     * 导出图片
     * @param {string} platform - 平台标识
     */
    static exportImageForPlatform(platform) {
        const { DOMUtils, MessageUtils, LoadingUtils, PrintUtils, FileUtils, PlatformUtils } = window.AddressManagerUtils;
        const { TemplateGenerator } = window.AddressManagerEventHandlers;
        
        const elements = DOMUtils.getPlatformElements(platform);
        
        if (!elements.finalOutput.dataset.fullResultData) {
            MessageUtils.showMessage('generateOrderFirst', 'warning');
            return;
        }
        
        const data = JSON.parse(elements.finalOutput.dataset.fullResultData);
        
        if (data.length === 0) {
            MessageUtils.showMessage('noDataToExport', 'warning');
            return;
        }
        
        LoadingUtils.withLoading(async () => {
            const printContainer = DOMUtils.getElement('print-container');
            const printTitle = DOMUtils.getElement('print-title');
            const printTable = DOMUtils.getElement('print-table');
            const printFooter = DOMUtils.getElement('print-footer');
            
            // 设置打印内容
            const platformName = PlatformUtils.getPlatformName(platform);
            DOMUtils.setTextContent(printTitle, `${platformName}订单数据`);
            TemplateGenerator.buildPrintTableInto(printTable, data);
            DOMUtils.setTextContent(printFooter, `生成时间：${new Date().toLocaleString()}`);
            
            return PrintUtils.withVisiblePrintContainer(() => {
                return html2canvas(printContainer, {
                    scale: 3,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    width: printContainer.scrollWidth,
                    height: printContainer.scrollHeight,
                    dpi: 300
                });
            }).then(canvas => {
                return new Promise(resolve => {
                    canvas.toBlob(blob => {
                        const filename = FileUtils.generateFileName(platform, 'png');
                        FileUtils.downloadFile(blob, filename);
                        MessageUtils.showMessage('exportSuccess', 'success', '图片');
                        resolve();
                    });
                });
            });
        }).catch(error => {
            console.error('生成图片失败:', error);
            MessageUtils.showMessage('exportFailed', 'danger', '图片');
        });
    }

    /**
     * 导出PDF
     * @param {string} platform - 平台标识
     */
    static exportPdfForPlatform(platform) {
        const { DOMUtils, MessageUtils, LoadingUtils, PrintUtils, FileUtils, PlatformUtils } = window.AddressManagerUtils;
        const { TemplateGenerator } = window.AddressManagerEventHandlers;
        
        const elements = DOMUtils.getPlatformElements(platform);
        
        if (!elements.finalOutput.dataset.fullResultData) {
            MessageUtils.showMessage('generateOrderFirst', 'warning');
            return;
        }
        
        const data = JSON.parse(elements.finalOutput.dataset.fullResultData);
        
        if (data.length === 0) {
            MessageUtils.showMessage('noDataToExport', 'warning');
            return;
        }
        
        LoadingUtils.withLoading(async () => {
            const printContainer = DOMUtils.getElement('print-container');
            const printTitle = DOMUtils.getElement('print-title');
            const printTable = DOMUtils.getElement('print-table');
            const printFooter = DOMUtils.getElement('print-footer');
            
            // 设置打印内容
            const platformName = PlatformUtils.getPlatformName(platform);
            DOMUtils.setTextContent(printTitle, `${platformName}订单数据`);
            TemplateGenerator.buildPrintTableInto(printTable, data);
            DOMUtils.setTextContent(printFooter, `生成时间：${new Date().toLocaleString()}`);
            
            return PrintUtils.withVisiblePrintContainer(() => {
                return html2canvas(printContainer, {
                    scale: 3,
                    backgroundColor: '#ffffff',
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    width: printContainer.scrollWidth,
                    height: printContainer.scrollHeight,
                    dpi: 300
                });
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                
                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                // 添加图片到PDF
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // 处理多页情况
                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // 保存PDF
                const filename = FileUtils.generateFileName(platform, 'pdf');
                pdf.save(filename);
                MessageUtils.showMessage('exportSuccess', 'success', 'PDF');
            });
        }).catch(error => {
            console.error('生成PDF失败:', error);
            MessageUtils.showMessage('exportFailed', 'danger', 'PDF');
        });
    }
}

/**
 * 状态管理器 - 集中管理应用状态
 */
class StateManager {
    constructor() {
        this.state = {
            platforms: {},
            currentData: {},
            settings: {}
        };
    }

    /**
     * 设置平台状态
     * @param {string} platform - 平台标识
     * @param {string} key - 状态键
     * @param {any} value - 状态值
     */
    setPlatformState(platform, key, value) {
        if (!this.state.platforms[platform]) {
            this.state.platforms[platform] = {};
        }
        this.state.platforms[platform][key] = value;
    }

    /**
     * 获取平台状态
     * @param {string} platform - 平台标识
     * @param {string} key - 状态键
     * @returns {any} 状态值
     */
    getPlatformState(platform, key) {
        return this.state.platforms[platform]?.[key];
    }

    /**
     * 清除平台状态
     * @param {string} platform - 平台标识
     */
    clearPlatformState(platform) {
        this.state.platforms[platform] = {};
    }

    /**
     * 获取所有状态
     * @returns {Object} 完整状态对象
     */
    getAllState() {
        return { ...this.state };
    }

    /**
     * 重置所有状态
     */
    reset() {
        this.state = {
            platforms: {},
            currentData: {},
            settings: {}
        };
    }
}

// 创建全局状态管理器实例
const globalStateManager = new StateManager();

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.AddressManagerCore = {
        AddressManager,
        ExportManager,
        StateManager,
        globalStateManager
    };
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AddressManager,
        ExportManager,
        StateManager
    };
}
