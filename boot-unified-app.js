/**
 * 智能地址订单管理系统 - 统一界面主应用
 * 统一界面版本的主应用程序入口
 */

/**
 * 统一界面应用程序类
 */
class UnifiedAddressOrderApp {
    constructor() {
        this.initialized = false;
        this.touchHandlersAdded = false;
        this.interface = null;
    }

    /**
     * 初始化应用程序
     */
    async init() {
        if (this.initialized) {
            console.warn('统一界面应用程序已经初始化');
            return;
        }

        try {
            // 检查依赖
            this.checkDependencies();
            
            // 初始化防刷新功能
            this.initTouchHandlers();
            
            // 初始化统一界面管理器
            this.initUnifiedInterface();
            
            // 添加全局键盘快捷键
            this.initKeyboardShortcuts();
            
            this.initialized = true;
            console.log('智能地址订单管理系统（统一界面版）初始化完成');
            
            // 显示欢迎消息
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('统一界面应用程序初始化失败:', error);
            this.showError(`系统初始化失败: ${error.message}`);
        }
    }

    /**
     * 检查必要的依赖是否已加载
     */
    checkDependencies() {
        const errors = [];
        const warnings = [];

        // 检查配置文件
        if (typeof PLATFORM_CONFIG === 'undefined') {
            errors.push('配置文件未加载，请检查 boot-config.js');
        }

        if (typeof PRODUCT_OPTIONS === 'undefined') {
            errors.push('产品配置未加载，请检查 boot-config.js');
        }

        // 检查地址处理器
        if (typeof AddressProcessor === 'undefined') {
            errors.push('地址处理器未加载，请检查 boot-address-processor.js');
        } else if (!AddressProcessor.AddressProcessorFactory) {
            errors.push('AddressProcessorFactory 未找到，请检查 boot-address-processor.js 的导出');
        }

        // 检查统一界面管理器
        if (typeof UnifiedInterfaceManager === 'undefined') {
            errors.push('统一界面管理器未加载，请检查 boot-unified-handlers.js');
        }

        // 检查可选依赖
        if (typeof bootstrap === 'undefined') {
            warnings.push('Bootstrap未正确加载，某些功能可能不可用');
        }

        if (typeof jspdf === 'undefined') {
            warnings.push('jsPDF未加载，PDF导出功能将不可用');
        }

        if (typeof html2canvas === 'undefined') {
            warnings.push('html2canvas未加载，图片和PDF导出功能将不可用');
        }

        // 输出警告
        warnings.forEach(warning => console.warn(warning));

        // 如果有错误，抛出异常
        if (errors.length > 0) {
            console.error('依赖检查失败:', errors);
            throw new Error(`依赖检查失败:\n${errors.join('\n')}`);
        }

        console.log('依赖检查完成');
    }

    /**
     * 初始化触摸事件处理器（防止移动端下拉刷新）
     */
    initTouchHandlers() {
        if (this.touchHandlersAdded) return;

        let startY = 0;
        let isAtTop = false;
        let isAtBottom = false;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isAtTop = window.scrollY === 0;
            isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
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

        this.touchHandlersAdded = true;
        console.log('触摸事件处理器已初始化');
    }

    /**
     * 初始化统一界面管理器
     */
    initUnifiedInterface() {
        try {
            this.interface = new UnifiedInterfaceManager();
            this.interface.init();
            console.log('统一界面管理器初始化完成');
        } catch (error) {
            console.error('统一界面管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化键盘快捷键
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 处理地址
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.interface.handleProcessAddresses();
            }
            
            // Ctrl/Cmd + Shift + C: 清空输入
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.interface.handleClearInput();
            }
            
            // Ctrl/Cmd + Shift + 1/2/3: 切换平台
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.interface.switchPlatform('pdd');
                        break;
                    case '2':
                        e.preventDefault();
                        this.interface.switchPlatform('dy');
                        break;
                    case '3':
                        e.preventDefault();
                        this.interface.switchPlatform('tb');
                        break;
                }
            }
            
            // ESC: 隐藏所有结果面板
            if (e.key === 'Escape') {
                this.interface.clearResults();
            }
        });
        
        console.log('键盘快捷键已初始化');
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        // 使用统一界面管理器显示欢迎消息
        setTimeout(() => {
            if (this.interface && this.interface.showMessage) {
                this.interface.showMessage('欢迎使用智能地址订单管理系统！选择平台开始处理地址数据吧 🎉', 'success');
            }
        }, 1000);
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        // 在页面上显示错误信息
        try {
            // 尝试创建一个错误显示区域
            let errorDiv = document.getElementById('init-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'init-error';
                errorDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #dc3545;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 10000;
                    max-width: 90%;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                `;
                document.body.appendChild(errorDiv);
            }
            
            errorDiv.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <strong>⚠️ 系统初始化失败</strong>
                </div>
                <div style="margin-bottom: 12px; font-size: 14px;">
                    ${message}
                </div>
                <div style="font-size: 12px; opacity: 0.9;">
                    <a href="debug-unified.html" style="color: #fff; text-decoration: underline;" target="_blank">
                        点击这里查看详细诊断
                    </a>
                    或
                    <a href="#" onclick="location.reload()" style="color: #fff; text-decoration: underline;">
                        刷新页面重试
                    </a>
                </div>
            `;
            
            console.error('系统错误:', message);
        } catch (displayError) {
            // 如果连DOM操作都失败了，使用alert
            console.error('显示错误信息失败:', displayError);
            alert(`系统初始化失败: ${message}`);
        }
    }

    /**
     * 获取应用状态
     * @returns {Object} 应用状态信息
     */
    getAppStatus() {
        return {
            initialized: this.initialized,
            touchHandlersAdded: this.touchHandlersAdded,
            dependencies: this.getDependencyStatus(),
            interface: this.interface?.getStatus(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 获取依赖状态
     * @returns {Object} 依赖加载状态
     */
    getDependencyStatus() {
        return {
            bootstrap: typeof bootstrap !== 'undefined',
            jspdf: typeof jspdf !== 'undefined',
            html2canvas: typeof html2canvas !== 'undefined',
            platformConfig: typeof PLATFORM_CONFIG !== 'undefined',
            productOptions: typeof PRODUCT_OPTIONS !== 'undefined',
            addressProcessor: typeof AddressProcessor !== 'undefined',
            addressProcessorFactory: typeof AddressProcessor !== 'undefined' && Boolean(AddressProcessor.AddressProcessorFactory),
            unifiedInterfaceManager: typeof UnifiedInterfaceManager !== 'undefined'
        };
    }

    /**
     * 重新初始化应用（调试用）
     */
    reinitialize() {
        this.initialized = false;
        this.touchHandlersAdded = false;
        this.interface = null;
        
        console.log('重新初始化统一界面应用程序...');
        
        return this.init();
    }

    /**
     * 获取性能统计
     * @returns {Object} 性能统计信息
     */
    getPerformanceStats() {
        if (!this.interface) return null;
        
        const status = this.interface.getStatus();
        const timing = performance.timing;
        
        return {
            interface: status,
            loadTime: timing.loadEventEnd - timing.navigationStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            renderTime: timing.loadEventEnd - timing.domContentLoadedEventEnd,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
            } : 'Not available'
        };
    }

    /**
     * 导出应用配置（调试用）
     * @returns {Object} 应用配置
     */
    exportConfig() {
        return {
            appStatus: this.getAppStatus(),
            performanceStats: this.getPerformanceStats(),
            platformConfig: typeof PLATFORM_CONFIG !== 'undefined' ? PLATFORM_CONFIG : null,
            productOptions: typeof PRODUCT_OPTIONS !== 'undefined' ? PRODUCT_OPTIONS : null,
            interfaceStatus: this.interface?.getStatus() || null
        };
    }

    /**
     * 切换到指定平台（API接口）
     * @param {string} platform - 平台标识
     */
    switchToPlatform(platform) {
        if (this.interface) {
            this.interface.switchPlatform(platform);
        }
    }

    /**
     * 处理地址数据（API接口）
     * @param {string} input - 输入数据
     */
    processAddresses(input) {
        if (this.interface) {
            const addressInput = document.getElementById('address-input');
            if (addressInput) {
                addressInput.value = input;
                this.interface.handleProcessAddresses();
            }
        }
    }

    /**
     * 获取处理结果（API接口）
     * @returns {Array|null} 处理结果
     */
    getProcessedResults() {
        return this.interface?.processedData || null;
    }

    /**
     * 获取最终订单（API接口）
     * @returns {Array|null} 最终订单
     */
    getFinalOrders() {
        return this.interface?.finalData || null;
    }
}

/**
 * 全局应用实例
 */
const unifiedAddressOrderApp = new UnifiedAddressOrderApp();

/**
 * DOM加载完成后自动初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化统一界面应用程序...');
    
    // 添加运行时检查
    try {
        // 简单的模块存在性检查
        const moduleChecks = [
            { name: 'PLATFORM_CONFIG', value: typeof PLATFORM_CONFIG !== 'undefined' },
            { name: 'PRODUCT_OPTIONS', value: typeof PRODUCT_OPTIONS !== 'undefined' },
            { name: 'AddressProcessor', value: typeof AddressProcessor !== 'undefined' },
            { name: 'UnifiedInterfaceManager', value: typeof UnifiedInterfaceManager !== 'undefined' }
        ];
        
        const failedChecks = moduleChecks.filter(check => !check.value);
        if (failedChecks.length > 0) {
            const missingModules = failedChecks.map(check => check.name).join(', ');
            console.error('缺少模块:', missingModules);
            unifiedAddressOrderApp.showError(`缺少必要模块: ${missingModules}`);
            return;
        }
        
        // 如果基础检查通过，尝试初始化
        unifiedAddressOrderApp.init().catch(error => {
            console.error('统一界面应用程序启动失败:', error);
        });
        
    } catch (preCheckError) {
        console.error('预检查失败:', preCheckError);
        unifiedAddressOrderApp.showError(`预检查失败: ${preCheckError.message}`);
    }
});

/**
 * 页面卸载前清理
 */
window.addEventListener('beforeunload', () => {
    // 清理全局状态（如果需要）
    console.log('统一界面应用程序正在关闭...');
    // 可以在这里保存状态到localStorage等
});

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 如果是严重错误，可以提示用户
    if (event.error?.name === 'TypeError' || event.error?.name === 'ReferenceError') {
        // 简单的错误提示
        console.error('系统遇到严重错误，建议刷新页面');
        if (unifiedAddressOrderApp?.interface?.showMessage) {
            unifiedAddressOrderApp.interface.showMessage('系统遇到错误，请刷新页面', 'danger');
        }
    }
});

/**
 * Promise错误处理
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason);
    
    // 防止控制台显示错误
    event.preventDefault();
    
    if (unifiedAddressOrderApp?.interface?.showMessage) {
        unifiedAddressOrderApp.interface.showMessage('操作失败，请重试', 'warning');
    }
});

// 导出到全局作用域供调试使用
window.UnifiedAddressOrderApp = {
    app: unifiedAddressOrderApp,
    UnifiedAddressOrderApp
};

// 提供简化的API
window.unifiedAPI = {
    // 获取应用状态
    status: () => unifiedAddressOrderApp.getAppStatus(),
    
    // 获取性能统计
    performance: () => unifiedAddressOrderApp.getPerformanceStats(),
    
    // 重新初始化
    reinit: () => unifiedAddressOrderApp.reinitialize(),
    
    // 导出配置
    export: () => unifiedAddressOrderApp.exportConfig(),
    
    // 切换平台
    switchTo: (platform) => unifiedAddressOrderApp.switchToPlatform(platform),
    
    // 处理地址
    process: (input) => unifiedAddressOrderApp.processAddresses(input),
    
    // 获取结果
    getResults: () => unifiedAddressOrderApp.getProcessedResults(),
    
    // 获取订单
    getOrders: () => unifiedAddressOrderApp.getFinalOrders(),
    
    // 清理数据
    clear: () => {
        if (unifiedAddressOrderApp.interface) {
            unifiedAddressOrderApp.interface.clearResults();
        }
    }
};

console.log('智能地址订单管理系统（统一界面版）脚本加载完成');
console.log('调试API可通过 window.unifiedAPI 访问');
console.log('应用实例可通过 window.UnifiedAddressOrderApp.app 访问');
console.log('');
console.log('🚀 键盘快捷键:');
console.log('  Ctrl/Cmd + Enter: 处理地址');
console.log('  Ctrl/Cmd + Shift + C: 清空输入');
console.log('  Ctrl/Cmd + Shift + 1/2/3: 切换平台 (拼多多/抖音/淘宝)');
console.log('  ESC: 隐藏所有结果面板');
