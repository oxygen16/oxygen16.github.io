/**
 * 智能地址订单管理系统 - 事件处理器和模板生成器
 * 统一管理事件处理逻辑和HTML模板生成
 */

/**
 * HTML模板生成器
 */
class TemplateGenerator {
    /**
     * 创建地址选项HTML
     * @param {Object} option - 产品选项配置
     * @param {number} index - 地址索引
     * @param {string} platform - 平台标识
     * @returns {string} HTML字符串
     */
    static createAddressOption(option, index, platform) {
        const { CSS_CLASSES } = window.AddressManagerConfig;
        
        return `
            <div class="${CSS_CLASSES.addressOption}">
                <input type="checkbox" 
                       id="${option.id}-${index}-${platform}" 
                       class="${CSS_CLASSES.checkbox} address-order-checkbox">
                <label for="${option.id}-${index}-${platform}" 
                       class="${CSS_CLASSES.label}">${option.name}</label>
                <input type="number" 
                       id="${option.id}-qty-${index}-${platform}" 
                       class="${CSS_CLASSES.addressQuantity}" 
                       min="0" 
                       value="0">
            </div>
        `;
    }

    /**
     * 创建地址项HTML
     * @param {string} address - 地址文本
     * @param {number} index - 地址索引
     * @param {string} platform - 平台标识
     * @returns {string} HTML字符串
     */
    static createAddressItem(address, index, platform) {
        const { PRODUCT_OPTIONS } = window.AddressManagerConfig;
        
        const addressOptionsHtml = PRODUCT_OPTIONS
            .map(option => this.createAddressOption(option, index, platform))
            .join('');
            
        return `
            <div class="row">
                <div class="col-12 col-lg-4 mb-2">
                    <div class="fw-bold text-primary address-text">${address}</div>
                </div>
                <div class="col-12 col-lg-8">
                    <div class="address-order-options d-flex flex-wrap">
                        ${addressOptionsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 创建表格元素
     * @param {Array} data - 数据数组
     * @returns {HTMLElement} 表格元素
     */
    static buildTableElement(data) {
        const table = document.createElement('table');
        table.className = 'table table-striped table-hover';
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'table-dark';
        const headerRow = document.createElement('tr');
        
        ['序号', '订单信息'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            
            [String(index + 1), item.fullResult || ''].forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        return table;
    }

    /**
     * 构建打印表格
     * @param {HTMLElement} element - 目标元素
     * @param {Array} data - 数据数组
     */
    static buildPrintTableInto(element, data) {
        element.innerHTML = '';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['序号', '订单信息'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        
        const tbody = document.createElement('tbody');
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            
            [String(index + 1), item.fullResult || ''].forEach(cellText => {
                const td = document.createElement('td');
                td.textContent = cellText;
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        element.appendChild(thead);
        element.appendChild(tbody);
    }
}

/**
 * 事件处理器工厂
 */
class EventHandlerFactory {
    /**
     * 创建地址处理事件处理器
     * @param {string} platform - 平台标识
     * @returns {Function}
     */
    static createProcessHandler(platform) {
        return function() {
            const { DOMUtils, ValidationUtils, MessageUtils } = window.AddressManagerUtils;
            const { AddressProcessorFactory } = window.AddressProcessor;
            
            const input = DOMUtils.getElement(`${platform}-input`).value.trim();
            
            // 验证输入
            const validation = ValidationUtils.validateInput(input, platform);
            if (!validation.isValid) {
                MessageUtils.showToast(validation.message, 'danger');
                return;
            }
            
            try {
                // 处理地址
                const results = AddressProcessorFactory.processAddresses(platform, input);
                
                // 更新UI
                AddressManager.updateProcessResults(platform, results);
                
            } catch (error) {
                console.error('地址处理失败:', error);
                MessageUtils.showToast(error.message, 'danger');
            }
        };
    }

    /**
     * 创建复制结果事件处理器
     * @param {string} platform - 平台标识
     * @returns {Function}
     */
    static createCopyHandler(platform) {
        return function() {
            const { DOMUtils, ClipboardUtils, MessageUtils } = window.AddressManagerUtils;
            const { MESSAGE_TEMPLATES } = window.AddressManagerConfig;
            
            const outputDiv = DOMUtils.getElement(`${platform}-output`);
            
            if (outputDiv.textContent && outputDiv.textContent !== MESSAGE_TEMPLATES.invalidFormat()) {
                ClipboardUtils.copyWithTemplate(outputDiv.textContent, platform, 'result');
            } else {
                MessageUtils.showMessage('noContent', 'warning');
            }
        };
    }

    /**
     * 创建添加订单信息事件处理器
     * @param {string} platform - 平台标识
     * @returns {Function}
     */
    static createAddOrderHandler(platform) {
        return function() {
            AddressManager.addOrderInfoForPlatform(platform);
        };
    }

    /**
     * 创建生成最终结果事件处理器
     * @param {string} platform - 平台标识
     * @returns {Function}
     */
    static createGenerateFinalHandler(platform) {
        return function() {
            AddressManager.generateFinalResultForPlatform(platform);
        };
    }

    /**
     * 创建复制最终结果事件处理器
     * @param {string} platform - 平台标识
     * @returns {Function}
     */
    static createFinalCopyHandler(platform) {
        return function() {
            const { DOMUtils, ClipboardUtils, MessageUtils } = window.AddressManagerUtils;
            
            const outputDiv = DOMUtils.getElement(`${platform}-final-output`);
            
            if (outputDiv.textContent) {
                ClipboardUtils.copyWithTemplate(outputDiv.textContent, platform, 'order');
            } else {
                MessageUtils.showMessage('noOrderContent', 'warning');
            }
        };
    }

    /**
     * 创建导出事件处理器
     * @param {string} platform - 平台标识
     * @param {string} type - 导出类型 ('table', 'image', 'pdf')
     * @returns {Function}
     */
    static createExportHandler(platform, type) {
        const exportFunctions = {
            table: (platform) => ExportManager.exportTableForPlatform(platform),
            image: (platform) => ExportManager.exportImageForPlatform(platform),
            pdf: (platform) => ExportManager.exportPdfForPlatform(platform)
        };
        
        return function() {
            const exportFunction = exportFunctions[type];
            if (exportFunction) {
                exportFunction(platform);
            } else {
                console.error(`不支持的导出类型: ${type}`);
            }
        };
    }

    /**
     * 为平台绑定所有事件处理器
     * @param {string} platform - 平台标识
     */
    static bindPlatformEvents(platform) {
        const { DOMUtils } = window.AddressManagerUtils;
        const { SELECTORS } = window.AddressManagerConfig;
        
        // 绑定处理地址按钮
        const processBtn = DOMUtils.getElement(SELECTORS.processBtn(platform));
        if (processBtn) {
            processBtn.addEventListener('click', this.createProcessHandler(platform));
        }
        
        // 绑定复制结果按钮
        const copyBtn = DOMUtils.getElement(SELECTORS.copyBtn(platform));
        if (copyBtn) {
            copyBtn.addEventListener('click', this.createCopyHandler(platform));
        }
        
        // 绑定添加订单信息按钮
        const addOrderBtn = DOMUtils.getElement(SELECTORS.addOrderBtn(platform));
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', this.createAddOrderHandler(platform));
        }
        
        // 绑定生成最终结果按钮
        const generateFinalBtn = DOMUtils.getElement(SELECTORS.generateFinalBtn(platform));
        if (generateFinalBtn) {
            generateFinalBtn.addEventListener('click', this.createGenerateFinalHandler(platform));
        }
        
        // 绑定复制最终结果按钮
        const finalCopyBtn = DOMUtils.getElement(SELECTORS.finalCopyBtn(platform));
        if (finalCopyBtn) {
            finalCopyBtn.addEventListener('click', this.createFinalCopyHandler(platform));
        }
        
        // 绑定导出按钮
        const exportTableBtn = DOMUtils.getElement(SELECTORS.exportTableBtn(platform));
        if (exportTableBtn) {
            exportTableBtn.addEventListener('click', this.createExportHandler(platform, 'table'));
        }
        
        const exportImageBtn = DOMUtils.getElement(SELECTORS.exportImageBtn(platform));
        if (exportImageBtn) {
            exportImageBtn.addEventListener('click', this.createExportHandler(platform, 'image'));
        }
        
        const exportPdfBtn = DOMUtils.getElement(SELECTORS.exportPdfBtn(platform));
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', this.createExportHandler(platform, 'pdf'));
        }
    }

    /**
     * 初始化所有平台的事件监听器
     */
    static initializeAllEvents() {
        const { PlatformUtils } = window.AddressManagerUtils;
        const platforms = PlatformUtils.getAllPlatforms();
        
        platforms.forEach(platform => {
            this.bindPlatformEvents(platform);
        });
    }
}

/**
 * 产品选项事件处理器
 */
class ProductOptionEventHandler {
    /**
     * 为地址项添加产品选项事件监听器
     * @param {number} index - 地址索引
     * @param {string} platform - 平台标识
     */
    static addProductOptionListeners(index, platform) {
        const { PRODUCT_OPTIONS } = window.AddressManagerConfig;
        const { DOMUtils, ValidationUtils } = window.AddressManagerUtils;
        
        PRODUCT_OPTIONS.forEach(option => {
            const checkbox = DOMUtils.getElement(`${option.id}-${index}-${platform}`);
            const qtyInput = DOMUtils.getElement(`${option.id}-qty-${index}-${platform}`);
            
            if (checkbox && qtyInput) {
                // 复选框变化事件
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        if (qtyInput.value === '0') {
                            qtyInput.value = '1';
                        }
                    } else {
                        qtyInput.value = '0';
                    }
                });
                
                // 数量输入变化事件
                qtyInput.addEventListener('change', function() {
                    const value = parseInt(this.value);
                    
                    if (ValidationUtils.validateQuantity(value)) {
                        if (value > 0) {
                            checkbox.checked = true;
                        } else {
                            checkbox.checked = false;
                            this.value = '0';
                        }
                    } else {
                        this.value = '0';
                        checkbox.checked = false;
                    }
                });
                
                // 输入验证事件
                qtyInput.addEventListener('input', function() {
                    const value = this.value;
                    if (value && !ValidationUtils.validateQuantity(value)) {
                        this.setCustomValidity('请输入有效的数量');
                    } else {
                        this.setCustomValidity('');
                    }
                });
            }
        });
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.AddressManagerEventHandlers = {
        TemplateGenerator,
        EventHandlerFactory,
        ProductOptionEventHandler
    };
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TemplateGenerator,
        EventHandlerFactory,
        ProductOptionEventHandler
    };
}
