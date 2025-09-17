/**
 * 智能地址订单管理系统 - 统一界面事件处理器
 * 专门为统一界面设计的事件处理和UI更新逻辑
 */

/**
 * 统一界面管理器
 */
class UnifiedInterfaceManager {
    constructor() {
        this.currentPlatform = 'pdd';
        this.processedData = null;
        this.finalData = null;
        this.stats = {
            totalProcessed: 0,
            totalOrders: 0
        };
    }

    /**
     * 初始化界面
     */
    init() {
        try {
            this.initPlatformSelector();
            this.initEventListeners();
            this.updatePlatformUI('pdd');
            console.log('统一界面管理器初始化完成');
        } catch (error) {
            console.error('统一界面管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化平台选择器
     */
    initPlatformSelector() {
        const platformButtons = document.querySelectorAll('.btn-platform');
        
        platformButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.dataset.platform;
                this.switchPlatform(platform);
            });
        });
    }

    /**
     * 切换平台
     * @param {string} platform - 目标平台
     */
    switchPlatform(platform) {
        if (platform === this.currentPlatform) return;
        
        // 更新按钮状态
        document.querySelectorAll('.btn-platform').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-platform="${platform}"]`).classList.add('active');
        
        // 更新当前平台
        this.currentPlatform = platform;
        
        // 更新UI
        this.updatePlatformUI(platform);
        
        // 清空结果
        this.clearResults();
        
        console.log(`已切换到${this.getPlatformName(platform)}平台`);
    }

    /**
     * 更新平台相关的UI元素
     * @param {string} platform - 平台标识
     */
    updatePlatformUI(platform) {
        const config = PLATFORM_CONFIG[platform];
        if (!config) return;
        
        // 更新平台名称显示
        const elements = {
            platformName: document.getElementById('current-platform-name'),
            platformBadge: document.getElementById('current-platform-badge'),
            platformStat: document.getElementById('current-platform-stat'),
            formatTitle: document.getElementById('platform-format-title'),
            formatDesc: document.getElementById('platform-format-desc'),
            example: document.getElementById('platform-example'),
            tips: document.getElementById('platform-tips'),
            input: document.getElementById('address-input')
        };
        
        // 更新文本内容
        if (elements.platformName) elements.platformName.textContent = config.name;
        if (elements.platformBadge) {
            elements.platformBadge.textContent = config.name;
            elements.platformBadge.className = `badge platform-badge platform-${platform}`;
        }
        if (elements.platformStat) elements.platformStat.textContent = config.name;
        if (elements.formatTitle) elements.formatTitle.textContent = `${config.name}格式说明`;
        if (elements.formatDesc) elements.formatDesc.textContent = config.inputFormat;
        if (elements.example) elements.example.innerHTML = config.example.replace(/\n/g, '<br>');
        if (elements.tips) elements.tips.textContent = config.description;
        if (elements.input) elements.input.placeholder = config.placeholder.replace(/\\n/g, '\n');
        
        // 添加平台特定的CSS类
        document.body.className = document.body.className.replace(/platform-\w+/g, '');
        document.body.classList.add(`platform-${platform}`);
    }

    /**
     * 初始化所有事件监听器
     */
    initEventListeners() {
        // 处理地址按钮
        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.handleProcessAddresses());
        } else {
            console.error('找不到处理地址按钮 (process-btn)');
        }
        
        // 清空按钮
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearInput());
        }
        
        // 复制输入按钮
        const copyInputBtn = document.getElementById('copy-input-btn');
        if (copyInputBtn) {
            copyInputBtn.addEventListener('click', () => this.handleCopyInput());
        }
        
        
        // 复制结果按钮
        const copyResultsBtn = document.getElementById('copy-results-btn');
        if (copyResultsBtn) {
            copyResultsBtn.addEventListener('click', () => this.handleCopyResults());
        }
        
        // 添加订单按钮
        const addOrdersBtn = document.getElementById('add-orders-btn');
        if (addOrdersBtn) {
            addOrdersBtn.addEventListener('click', () => this.handleAddOrders());
        }
        
        // 生成最终订单按钮
        const generateFinalBtn = document.getElementById('generate-final-btn');
        if (generateFinalBtn) {
            generateFinalBtn.addEventListener('click', () => this.handleGenerateFinal());
        }
        
        // 复制最终结果按钮
        const copyFinalBtn = document.getElementById('copy-final-btn');
        if (copyFinalBtn) {
            copyFinalBtn.addEventListener('click', () => this.handleCopyFinal());
        }
        
        // 导出按钮
        const exportButtons = [
            { id: 'export-table-btn', type: 'table' },
            { id: 'export-image-btn', type: 'image' },
            { id: 'export-pdf-btn', type: 'pdf' }
        ];
        
        exportButtons.forEach(({ id, type }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.handleExport(type));
            }
        });
    }

    /**
     * 处理地址数据
     */
    handleProcessAddresses() {
        const inputElement = document.getElementById('address-input');
        if (!inputElement) {
            this.showMessage('找不到输入框，请刷新页面', 'danger');
            return;
        }
        
        const input = inputElement.value.trim();
        if (!input) {
            this.showMessage('请输入地址数据', 'warning');
            return;
        }
        
        // 检查 AddressProcessor 是否可用
        if (typeof AddressProcessor === 'undefined' || !AddressProcessor.AddressProcessorFactory) {
            console.error('AddressProcessor 或 AddressProcessorFactory 未定义');
            this.showMessage('地址处理器未加载，请刷新页面', 'danger');
            return;
        }
        
        try {
            // 处理地址
            const results = AddressProcessor.AddressProcessorFactory.processAddresses(this.currentPlatform, input);
            
            if (!results || results.length === 0) {
                this.showMessage('未能处理任何地址，请检查输入格式', 'warning');
                return;
            }
            
            this.processedData = results;
            
            // 更新结果显示
            this.updateResultsDisplay(results);
            
            // 更新统计
            this.stats.totalProcessed = results.length;
            this.updateStats();
            
            this.showMessage(`成功处理 ${results.length} 条地址`, 'success');
            
        } catch (error) {
            console.error('地址处理失败:', error);
            this.showMessage(error.message || '地址处理失败，请重试', 'danger');
        }
    }

    /**
     * 显示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    showMessage(message, type = 'info') {
        // 使用Bootstrap Toast显示消息
        try {
            // 创建toast容器（如果不存在）
            let toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
                toastContainer.style.zIndex = '11';
                document.body.appendChild(toastContainer);
            }

            // 创建toast元素
            const toastId = `toast-${Date.now()}`;
            const bgClass = type === 'success' ? 'bg-success' : 
                          type === 'error' || type === 'danger' ? 'bg-danger' : 
                          type === 'warning' ? 'bg-warning' : 'bg-info';
            
            const toastHtml = `
                <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;
            
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);
            
            // 显示toast
            const toastElement = document.getElementById(toastId);
            if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
                const toast = new bootstrap.Toast(toastElement, {
                    autohide: true,
                    delay: 3000
                });
                toast.show();
                
                // 自动清理
                toastElement.addEventListener('hidden.bs.toast', () => {
                    toastElement.remove();
                });
            } else {
                // Bootstrap未加载时的备用方案
                setTimeout(() => toastElement.remove(), 3000);
            }
            
        } catch (error) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            console.error('Toast显示失败:', error);
            // 对于重要消息，使用alert作为最后的备用方案
            if (type === 'danger' || type === 'warning') {
                alert(message);
            }
        }
    }

    /**
     * 复制到剪贴板
     * @param {string} text - 要复制的文本
     * @param {string} successMessage - 成功消息
     */
    async copyToClipboard(text, successMessage = '已复制到剪贴板') {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                this.showMessage(successMessage, 'success');
            } else {
                // 备用方法
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage(successMessage, 'success');
            }
        } catch (err) {
            console.error('复制失败:', err);
            this.showMessage('复制失败，请手动复制', 'danger');
        }
    }

    /**
     * 更新结果显示
     * @param {Array} results - 处理结果
     */
    updateResultsDisplay(results) {
        const elements = {
            resultsSection: document.getElementById('results-section'),
            processedResults: document.getElementById('processed-results'),
            resultCount: document.getElementById('result-count')
        };
        
        if (results.length > 0) {
            // 显示结果
            const resultText = results.map(item => item.shortAddress).join('\n');
            if (elements.processedResults) {
                elements.processedResults.textContent = resultText;
            }
            if (elements.resultCount) {
                elements.resultCount.textContent = results.length.toString();
            }
            
            // 显示结果区域
            if (elements.resultsSection) {
                elements.resultsSection.classList.remove('d-none');
                elements.resultsSection.classList.add('fade-in');
                
                // 滚动到结果区域
                elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    /**
     * 清空输入
     */
    handleClearInput() {
        const input = document.getElementById('address-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        
        this.clearResults();
        this.showMessage('已清空输入内容', 'info');
    }

    /**
     * 复制输入内容
     */
    handleCopyInput() {
        const input = document.getElementById('address-input');
        if (input && input.value.trim()) {
            this.copyToClipboard(input.value, '输入内容已复制到剪贴板');
        } else {
            this.showMessage('没有内容可复制', 'warning');
        }
    }

    /**
     * 复制处理结果
     */
    handleCopyResults() {
        if (this.processedData && this.processedData.length > 0) {
            const resultText = this.processedData.map(item => item.shortAddress).join('\n');
            this.copyToClipboard(resultText, `${this.getPlatformName(this.currentPlatform)}处理结果已复制到剪贴板`);
        } else {
            this.showMessage('没有可复制的结果，请先处理地址', 'warning');
        }
    }

    /**
     * 添加订单信息
     */
    handleAddOrders() {
        if (!this.processedData || this.processedData.length === 0) {
            this.showMessage('请先处理地址数据', 'warning');
            return;
        }
        
        // 显示订单配置区域
        const orderSection = document.getElementById('order-config-section');
        if (orderSection) {
            orderSection.classList.remove('d-none');
            orderSection.classList.add('fade-in');
            
            // 生成地址列表
            this.generateAddressList();
            
            // 滚动到订单配置区域
            orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 生成地址列表
     */
    generateAddressList() {
        const addressList = document.getElementById('address-list');
        if (!addressList) return;
        
        addressList.innerHTML = '';
        
        this.processedData.forEach((addressData, index) => {
            const addressItem = document.createElement('div');
            addressItem.className = 'address-item slide-in';
            addressItem.style.animationDelay = `${index * 0.1}s`;
            
            addressItem.innerHTML = this.createAddressItemHTML(addressData.shortAddress, index);
            addressList.appendChild(addressItem);
        });
        
        // 默认添加5支装白色
        this.addDefaultOrders();
    }

    /**
     * 创建地址项HTML
     * @param {string} address - 地址
     * @param {number} index - 索引
     * @returns {string} HTML字符串
     */
    createAddressItemHTML(address, index) {
        const options = PRODUCT_OPTIONS.map(option => `
            <div class="address-order-option p-2 me-2 mb-2 d-inline-flex align-items-center">
                <input type="checkbox" id="${option.id}-${index}-unified" class="form-check-input address-order-checkbox me-1">
                <label for="${option.id}-${index}-unified" class="form-check-label me-1 small">${option.name}</label>
                <input type="number" id="${option.id}-qty-${index}-unified" class="form-control address-quantity" min="0" value="0">
            </div>
        `).join('');

        return `
            <div class="row">
                <div class="col-12 col-lg-4 mb-2">
                    <div class="fw-bold text-primary address-text">${address}</div>
                </div>
                <div class="col-12 col-lg-8">
                    <div class="address-order-options d-flex flex-wrap">
                        ${options}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 添加默认订单（5支装白色）
     */
    addDefaultOrders() {
        const addressItems = document.querySelectorAll('#address-list .address-item');
        
        addressItems.forEach(item => {
            const whiteCheckbox = item.querySelector('input[id*="p5-white"]');
            const whiteQtyInput = item.querySelector('input[id*="p5-white-qty"]');
            
            if (whiteCheckbox && whiteQtyInput) {
                whiteCheckbox.checked = true;
                whiteQtyInput.value = '1';
            }
        });
    }

    /**
     * 生成最终订单
     */
    handleGenerateFinal() {
        if (!this.processedData || this.processedData.length === 0) {
            this.showMessage('请先处理地址数据', 'warning');
            return;
        }
        
        // 检查必要的配置
        if (typeof PRODUCT_OPTIONS === 'undefined') {
            console.error('PRODUCT_OPTIONS 未定义');
            this.showMessage('产品配置未加载', 'danger');
            return;
        }
        
        if (typeof COLOR_ORDER === 'undefined') {
            console.error('COLOR_ORDER 未定义');
            this.showMessage('颜色排序配置未加载', 'danger');
            return;
        }
        
        try {
            const finalResults = this.generateFinalResults();
            this.finalData = finalResults;
            
            // 更新最终结果显示
            this.updateFinalResultsDisplay(finalResults);
            
            // 更新统计
            this.stats.totalOrders = finalResults.length;
            this.updateStats();
            
            this.showMessage(`成功生成 ${finalResults.length} 条订单`, 'success');
            
        } catch (error) {
            console.error('生成最终订单失败:', error);
            this.showMessage(`生成订单失败: ${error.message}`, 'danger');
        }
    }

    /**
     * 生成最终结果数据
     * @returns {Array} 最终结果数组
     */
    generateFinalResults() {
        const finalResults = [];
        
        this.processedData.forEach((addressData, index) => {
            const orderInfo = this.getOrderInfoForAddress(index);
            const fullResult = orderInfo ? `${addressData.shortAddress} ${orderInfo}` : addressData.shortAddress;
            
            finalResults.push({
                address: addressData.shortAddress || addressData.address || '地址信息缺失',
                fullAddress: addressData.address || '完整地址信息缺失',
                shortAddress: addressData.shortAddress || '短地址信息缺失',
                originalName: addressData.originalName || '姓名信息缺失',
                phone: addressData.phone || '电话信息缺失',
                orderInfo: orderInfo || '',
                fullResult: fullResult || '结果信息缺失'
            });
        });
        
        return finalResults;
    }

    /**
     * 获取地址的订单信息
     * @param {number} index - 地址索引
     * @returns {string} 订单信息字符串
     */
    getOrderInfoForAddress(index) {
        const groups = {
            '5支装': [],
            '72支装': [],
            '礼品袋': []
        };
        
        // 收集选中的产品选项
        PRODUCT_OPTIONS.forEach(option => {
            const checkboxId = `${option.id}-${index}-unified`;
            const qtyInputId = `${option.id}-qty-${index}-unified`;
            const checkbox = document.getElementById(checkboxId);
            const qtyInput = document.getElementById(qtyInputId);
            
            if (checkbox && qtyInput && checkbox.checked && parseInt(qtyInput.value) > 0) {
                groups[option.group].push({
                    name: option.name,
                    color: option.color,
                    quantity: parseInt(qtyInput.value)
                });
            }
        });
        
        const orderParts = [];
        
        // 处理各产品组
        ['5支装', '72支装'].forEach(group => {
            if (groups[group].length > 0) {
                const colorOrder = COLOR_ORDER[group] || [];
                const sortedProducts = this.sortProductsByColor(groups[group], colorOrder);
                const colorParts = sortedProducts.map(product => `${product.color}*${product.quantity}`);
                orderParts.push(`${group}【${colorParts.join('+')}】`);
            }
        });
        
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
    sortProductsByColor(products, colorOrder) {
        return products.sort((a, b) => {
            const indexA = colorOrder.indexOf(a.color);
            const indexB = colorOrder.indexOf(b.color);
            return indexA - indexB;
        });
    }

    /**
     * 更新最终结果显示
     * @param {Array} results - 最终结果
     */
    updateFinalResultsDisplay(results) {
        const elements = {
            finalSection: document.getElementById('final-orders-section'),
            finalResults: document.getElementById('final-results'),
            finalCount: document.getElementById('final-count')
        };
        
        if (results.length > 0) {
            // 显示结果（添加序号）
            const resultText = results.map((item, index) => {
                const orderNumber = String(index + 1).padStart(3, '0');
                return `${orderNumber}. ${item.fullResult}`;
            }).join('\n');
            if (elements.finalResults) {
                elements.finalResults.textContent = resultText;
            }
            if (elements.finalCount) {
                elements.finalCount.textContent = results.length.toString();
            }
            
            // 显示结果区域
            if (elements.finalSection) {
                elements.finalSection.classList.remove('d-none');
                elements.finalSection.classList.add('fade-in');
                
                // 滚动到结果区域
                elements.finalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    /**
     * 复制最终结果
     */
    handleCopyFinal() {
        if (this.finalData && this.finalData.length > 0) {
            // 生成带序号的结果文本
            const resultText = this.finalData.map((item, index) => {
                const orderNumber = String(index + 1).padStart(3, '0');
                return `${orderNumber}. ${item.fullResult}`;
            }).join('\n');
            this.copyToClipboard(resultText, `${this.getPlatformName(this.currentPlatform)}订单信息已复制到剪贴板`);
        } else {
            this.showMessage('没有可复制的订单，请先生成订单', 'warning');
        }
    }

    /**
     * 处理导出
     * @param {string} type - 导出类型
     */
    handleExport(type) {
        // 基础数据验证
        if (!this.finalData || this.finalData.length === 0) {
            this.showMessage('请先生成订单数据', 'warning');
            return;
        }

        // 详细数据验证 - 检查数据结构完整性
        try {
            const hasValidStructure = this.finalData.every(item => 
                item && typeof item === 'object'
            );
            
            if (!hasValidStructure) {
                console.error('数据结构验证失败:', this.finalData);
                this.showMessage('数据结构不完整，请重新生成订单', 'danger');
                return;
            }
            
            // 检查是否有可用的地址信息
            const hasAddressData = this.finalData.some(item =>
                item.address || item.shortAddress || item.fullResult
            );
            
            if (!hasAddressData) {
                console.error('无有效地址数据:', this.finalData);
                this.showMessage('没有有效的地址数据可导出', 'warning');
                return;
            }
            
        } catch (validationError) {
            console.error('数据验证出错:', validationError);
            this.showMessage('数据验证失败，请检查数据完整性', 'danger');
            return;
        }
        
        try {
            // 调用导出功能
            switch (type) {
                case 'table':
                    this.exportTable();
                    break;
                case 'image':
                    this.exportImage();
                    break;
                case 'pdf':
                    this.exportPdf();
                    break;
                default:
                    console.error(`不支持的导出类型: ${type}`);
                    this.showMessage(`不支持的导出类型: ${type}`, 'danger');
            }
        } catch (error) {
            console.error('导出失败:', error);
            this.showMessage(`导出失败: ${error.message}`, 'danger');
        }
    }

    /**
     * 导出表格
     */
    exportTable() {
        // 数据验证
        if (!this.finalData || this.finalData.length === 0) {
            this.showMessage('没有可导出的数据，请先生成订单', 'warning');
            return;
        }

        // 数据完整性检查
        const hasValidData = this.finalData.some(item => 
            (item.address || item.shortAddress || item.fullResult)
        );
        
        if (!hasValidData) {
            this.showMessage('数据不完整，无法导出', 'warning');
            return;
        }

        // 预览表格元素
        const tableSection = document.getElementById('table-preview-section');
        const tableContainer = document.getElementById('table-container');
        
        try {
            if (tableContainer) {
                tableContainer.innerHTML = '';
                const table = this.createTableElement();
                tableContainer.appendChild(table);
            }
        } catch (error) {
            console.error('导出表格失败:', error);
            this.showMessage(`导出表格失败: ${error.message}`, 'danger');
            return;
        }
        
        if (tableSection) {
            tableSection.classList.remove('d-none');
            tableSection.classList.add('fade-in');
        }
        
        // 生成CSV - 添加更多详细信息和美化格式
        let csvContent = '\ufeff'; // BOM for UTF-8
        
        // 添加标题头部
        csvContent += `"${this.getPlatformName(this.currentPlatform)} - 订单信息表"\n`;
        csvContent += `"导出时间：${new Date().toLocaleString('zh-CN')}"\n`;
        csvContent += `"总计订单数：${this.finalData.length}"\n`;
        csvContent += '\n'; // 空行分隔
        
        // 列标题
        csvContent += '序号,平台,地址信息,订单详情,处理时间\n';
        
        this.finalData.forEach((item, index) => {
            // 安全访问数据，避免 undefined 错误
            const address = (item.address || item.shortAddress || '地址信息缺失').toString();
            const orderInfo = (item.orderInfo || '无订单信息').toString();
            const platform = this.getPlatformName(this.currentPlatform) || '未知平台';
            
            const row = [
                index + 1,
                `"${platform}"`,
                `"${address.replace(/"/g, '""')}"`,
                `"${orderInfo.replace(/"/g, '""')}"`,
                `"${new Date().toLocaleString('zh-CN')}"`
            ].join(',');
            csvContent += row + '\n';
        });
        
        // 添加页脚信息
        csvContent += '\n'; // 空行分隔
        csvContent += `"系统信息：智能地址订单管理系统 - 统一界面版"\n`;
        csvContent += `"文件生成时间戳：${this.getFormattedTimestamp()}"\n`;
        
        try {
            // 下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `${this.getPlatformName(this.currentPlatform)}_订单_${this.getFormattedTimestamp()}.csv`;
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('表格已导出成功', 'success');
            
        } catch (downloadError) {
            console.error('下载失败:', downloadError);
            this.showMessage(`下载失败: ${downloadError.message}`, 'danger');
        }
        
        // 滚动到表格预览
        if (tableSection) {
            tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 创建表格元素
     * @returns {HTMLElement} 包含表格和标题的容器元素
     */
    createTableElement() {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'export-table-container';
        container.style.cssText = `
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
        `;

        // 添加标题区域
        const header = document.createElement('div');
        header.className = 'export-header';
        header.style.cssText = `
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 15px;
        `;
        
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 8px 0;
        `;
        title.textContent = `${this.getPlatformName(this.currentPlatform)} - 订单信息表`;
        
        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 8px;
        `;
        subtitle.textContent = `导出时间: ${new Date().toLocaleString('zh-CN')}`;
        
        const summary = document.createElement('div');
        summary.style.cssText = `
            color: #e74c3c;
            font-size: 16px;
            font-weight: 500;
        `;
        summary.textContent = `总计: ${this.finalData.length} 条订单`;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        header.appendChild(summary);
        
        // 创建表格
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.style.cssText = `
            margin: 0;
            border-collapse: collapse;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            border-radius: 8px;
            overflow: hidden;
        `;
        
        const thead = document.createElement('thead');
        thead.style.cssText = `
            background-color: #6c757d;
            color: white;
        `;
        thead.innerHTML = `
            <tr>
                <th style="width: 80px; padding: 15px 12px; font-size: 14px; font-weight: 600; text-align: center; border: none;">序号</th>
                <th style="padding: 15px 20px; font-size: 14px; font-weight: 600; border: none;">订单详情</th>
            </tr>
        `;
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        this.finalData.forEach((item, index) => {
            // 安全访问数据，避免 undefined 错误
            const address = item.address || item.shortAddress || '地址信息缺失';
            const orderInfo = item.orderInfo || '无订单信息';
            
            const row = document.createElement('tr');
            row.style.cssText = `
                transition: background-color 0.2s ease;
                ${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: #ffffff;'}
            `;
            row.innerHTML = `
                <td style="text-align: center; padding: 15px 12px; font-weight: 600; color: #495057; border: 1px solid #e9ecef; vertical-align: middle;">
                    ${String(index + 1).padStart(3, '0')}
                </td>
                <td style="padding: 15px 20px; line-height: 1.6; color: #212529; border: 1px solid #e9ecef; word-break: break-all;">
                    <div style="font-weight: 500; margin-bottom: 5px;">${this.escapeHtml(address)}</div>
                    <div style="color: #6c757d; font-size: 13px; background: #e9ecef; padding: 8px 12px; border-radius: 4px; margin-top: 8px;">
                        ${this.escapeHtml(orderInfo)}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        
        // 添加页脚
        const footer = document.createElement('div');
        footer.className = 'export-footer';
        footer.style.cssText = `
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        `;
        footer.innerHTML = `
            <div>智能地址订单管理系统 - 统一界面版</div>
            <div style="margin-top: 5px;">© ${new Date().getFullYear()} 版权所有 | 数据导出时间: ${this.getFormattedTimestamp()}</div>
        `;
        
        container.appendChild(header);
        container.appendChild(table);
        container.appendChild(footer);
        
        return container;
    }

    /**
     * 导出图片
     */
    exportImage() {
        // 检查html2canvas是否可用
        if (typeof html2canvas === 'undefined') {
            this.showMessage('html2canvas 库未加载，无法导出图片', 'danger');
            return;
        }
        
        // 确保表格容器存在（但不显示预览）
        let tableContainer = document.getElementById('table-container');
        
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.id = 'table-container';
            tableContainer.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                visibility: hidden;
            `;
            document.body.appendChild(tableContainer);
        }
        
        // 创建表格（仅用于图片导出，不显示预览）
        if (tableContainer.children.length === 0) {
            try {
                const table = this.createTableElement();
                tableContainer.innerHTML = '';
                tableContainer.appendChild(table);
                
                // 等待DOM更新后捕获
                setTimeout(() => this.captureTable(), 100);
            } catch (error) {
                console.error('创建图片导出表格失败:', error);
                this.showMessage(`创建表格失败: ${error.message}`, 'danger');
                return;
            }
        } else {
            this.captureTable();
        }
    }

    /**
     * 捕获表格为图片
     */
    captureTable() {
        const tableContainer = document.getElementById('table-container');
        if (!tableContainer) {
            this.showMessage('表格容器不存在', 'danger');
            return;
        }
        
        // 显示加载提示
        this.showMessage('正在生成图片，请稍候...', 'info');
        
        html2canvas(tableContainer, {
            scale: 2, // 提高清晰度
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false, // 禁用日志
            removeContainer: true, // 移除临时容器
            imageTimeout: 15000, // 15秒超时
            onrendered: function() {} // 空的渲染回调
        }).then(canvas => {
            // 创建下载链接
            const filename = `${this.getPlatformName(this.currentPlatform)}_订单_${this.getFormattedTimestamp()}.png`;
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('图片已导出成功', 'success');
            
        }).catch(error => {
            console.error('图片导出失败:', error);
            
            // 特殊错误处理
            let errorMessage = error.message;
            if (error.message.includes('addColorStop') || error.message.includes('CanvasGradient')) {
                errorMessage = '图片渲染失败，可能是样式兼容性问题';
            } else if (error.message.includes('non-finite')) {
                errorMessage = '渲染参数错误，请检查表格数据';
            }
            
            this.showMessage(`图片导出失败: ${errorMessage}`, 'danger');
        });
    }

    /**
     * 导出PDF
     */
    exportPdf() {
        // 检查jsPDF是否可用
        if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
            this.showMessage('jsPDF 库未加载，无法导出PDF', 'danger');
            return;
        }
        
        // 检查html2canvas是否可用
        if (typeof html2canvas === 'undefined') {
            this.showMessage('html2canvas 库未加载，无法导出PDF', 'danger');
            return;
        }
        
        // 确保表格容器存在（但不显示预览）
        let tableContainer = document.getElementById('table-container');
        
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.id = 'table-container';
            tableContainer.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                visibility: hidden;
            `;
            document.body.appendChild(tableContainer);
        }
        
        // 创建表格（仅用于PDF导出，不显示预览）
        if (tableContainer.children.length === 0) {
            try {
                const table = this.createTableElement();
                tableContainer.innerHTML = '';
                tableContainer.appendChild(table);
                
                // 等待DOM更新后生成PDF
                setTimeout(() => this.generatePdf(), 100);
            } catch (error) {
                console.error('创建PDF导出表格失败:', error);
                this.showMessage(`创建表格失败: ${error.message}`, 'danger');
                return;
            }
        } else {
            this.generatePdf();
        }
    }

    /**
     * 生成PDF
     */
    generatePdf() {
        const tableContainer = document.getElementById('table-container');
        if (!tableContainer) {
            this.showMessage('表格容器不存在', 'danger');
            return;
        }
        
        // 显示加载提示
        this.showMessage('正在生成PDF，请稍候...', 'info');
        
        html2canvas(tableContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false, // 禁用日志
            removeContainer: true, // 移除临时容器
            imageTimeout: 15000, // 15秒超时
            width: tableContainer.scrollWidth,
            height: tableContainer.scrollHeight,
            onrendered: function() {} // 空的渲染回调
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
            
            // 设置PDF元数据 - 使用英文避免乱码
            pdf.setProperties({
                title: `Order Information - ${this.getPlatformName(this.currentPlatform)}`,
                subject: 'Smart Address Order Management System Export',
                author: 'Smart Address Order Management System',
                creator: 'Unified Interface',
                producer: 'jsPDF',
                keywords: `order,management,${this.getPlatformName(this.currentPlatform)},address`,
                creationDate: new Date()
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let position = margin;
            
            // 创建页眉区域 - 使用简单的标识而不是中文文字
            const headerHeight = 20;
            
            // 添加简单的标题标识
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            const title = `${this.getPlatformName(this.currentPlatform)} Orders`;
            const titleWidth = pdf.getTextWidth(title);
            pdf.text(title, (pageWidth - titleWidth) / 2, position + 5);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            const exportInfo = `Export: ${new Date().toLocaleDateString()} | Total: ${this.finalData.length} items`;
            const infoWidth = pdf.getTextWidth(exportInfo);
            pdf.text(exportInfo, (pageWidth - infoWidth) / 2, position + 12);
            
            // 添加分隔线
            pdf.setLineWidth(0.3);
            pdf.line(margin, position + 15, pageWidth - margin, position + 15);
            
            position += headerHeight;
            
            // 计算可用空间
            const footerHeight = 15;
            const availableHeight = pageHeight - position - margin - footerHeight;
            
            if (imgHeight <= availableHeight) {
                // 单页显示
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            } else {
                // 多页显示 - 使用简化的方法
                // 第一页
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                
                // 计算需要的额外页面
                const extraHeight = imgHeight - availableHeight;
                const pageContentHeight = pageHeight - headerHeight - footerHeight - margin;
                const additionalPages = Math.ceil(extraHeight / pageContentHeight);
                
                // 添加额外页面提示
                for (let page = 1; page <= additionalPages; page++) {
                    pdf.addPage();
                    
                    // 添加延续页标题
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'normal');
                    const continueTitle = `${this.getPlatformName(this.currentPlatform)} Orders (Page ${page + 1})`;
                    pdf.text(continueTitle, margin, margin + 10);
                    pdf.line(margin, margin + 12, pageWidth - margin, margin + 12);
                    
                    // 添加说明文字
                    pdf.setFontSize(10);
                    pdf.text('Table continues from previous page...', margin, margin + 25);
                }
            }
            
            // 添加页脚 - 使用英文和数字避免乱码
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                
                // 页码
                const pageInfo = `Page ${i} of ${totalPages}`;
                pdf.text(pageInfo, margin, pageHeight - margin + 5);
                
                // 时间戳
                const timestamp = this.getFormattedTimestamp();
                const timestampWidth = pdf.getTextWidth(timestamp);
                pdf.text(timestamp, pageWidth - margin - timestampWidth, pageHeight - margin + 5);
            }
            
            // 下载PDF
            const filename = `${this.getPlatformName(this.currentPlatform)}_Orders_${this.getFormattedTimestamp()}.pdf`;
            pdf.save(filename);
            
            this.showMessage('PDF已导出成功', 'success');
            
        }).catch(error => {
            console.error('PDF导出失败:', error);
            
            // 特殊错误处理
            let errorMessage = error.message;
            if (error.message.includes('addColorStop') || error.message.includes('CanvasGradient')) {
                errorMessage = 'PDF渲染失败，可能是样式兼容性问题';
            } else if (error.message.includes('non-finite')) {
                errorMessage = '渲染参数错误，请检查表格数据';
            } else if (error.message.includes('jsPDF')) {
                errorMessage = 'PDF生成库错误，请刷新页面重试';
            }
            
            this.showMessage(`PDF导出失败: ${errorMessage}`, 'danger');
        });
    }

    /**
     * 清空所有结果
     */
    clearResults() {
        const sections = [
            'results-section',
            'order-config-section',
            'final-orders-section',
            'table-preview-section'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('d-none');
                section.classList.remove('fade-in', 'slide-in');
            }
        });
        
        // 重置数据
        this.processedData = null;
        this.finalData = null;
        this.stats.totalProcessed = 0;
        this.stats.totalOrders = 0;
        this.updateStats();
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const elements = {
            totalProcessed: document.getElementById('total-processed'),
            totalOrders: document.getElementById('total-orders')
        };
        
        if (elements.totalProcessed) {
            elements.totalProcessed.textContent = this.stats.totalProcessed.toString();
        }
        
        if (elements.totalOrders) {
            elements.totalOrders.textContent = this.stats.totalOrders.toString();
        }
    }

    /**
     * 获取平台名称
     * @param {string} platform - 平台标识
     * @returns {string} 平台名称
     */
    getPlatformName(platform) {
        return PLATFORM_CONFIG[platform]?.name || platform;
    }

    /**
     * 获取格式化的时间戳
     * @returns {string} 格式化的时间戳 (YYYY-MM-DD_HH-mm-ss)
     */
    getFormattedTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text || '');
        }
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }


    /**
     * 获取当前状态
     * @returns {Object} 当前状态信息
     */
    getStatus() {
        return {
            currentPlatform: this.currentPlatform,
            hasProcessedData: Boolean(this.processedData),
            hasFinalData: Boolean(this.finalData),
            stats: { ...this.stats }
        };
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.UnifiedInterfaceManager = UnifiedInterfaceManager;
}
