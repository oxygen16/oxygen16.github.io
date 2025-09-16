/**
 * 智能地址订单管理系统 - 优化版主脚本
 * 整合所有模块，提供简洁的初始化和功能接口
 */

/**
 * 应用程序主类
 */
class AddressOrderApp {
    constructor() {
        this.initialized = false;
        this.touchHandlersAdded = false;
    }

    /**
     * 初始化应用程序
     */
    async init() {
        if (this.initialized) {
            console.warn('应用程序已经初始化');
            return;
        }

        try {
            // 检查依赖
            this.checkDependencies();
            
            // 初始化防刷新功能
            this.initTouchHandlers();
            
            // 初始化事件监听器
            this.initEventListeners();
            
            this.initialized = true;
            console.log('智能地址订单管理系统初始化完成');
            
        } catch (error) {
            console.error('应用程序初始化失败:', error);
            this.showError('系统初始化失败，请刷新页面重试');
        }
    }

    /**
     * 检查必要的依赖是否已加载
     */
    checkDependencies() {
        const requiredModules = [
            'AddressManagerConfig',
            'AddressManagerUtils',
            'AddressProcessor',
            'AddressManagerEventHandlers',
            'AddressManagerCore'
        ];

        const missingModules = requiredModules.filter(module => !window[module]);
        
        if (missingModules.length > 0) {
            throw new Error(`缺少必要模块: ${missingModules.join(', ')}`);
        }

        // 检查Bootstrap是否已加载
        if (typeof bootstrap === 'undefined') {
            throw new Error('Bootstrap未正确加载');
        }

        // 检查外部库是否已加载
        if (typeof jspdf === 'undefined') {
            console.warn('jsPDF未加载，PDF导出功能将不可用');
        }

        if (typeof html2canvas === 'undefined') {
            console.warn('html2canvas未加载，图片和PDF导出功能将不可用');
        }
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
     * 初始化所有事件监听器
     */
    initEventListeners() {
        const { EventHandlerFactory } = window.AddressManagerEventHandlers;
        
        try {
            EventHandlerFactory.initializeAllEvents();
            console.log('事件监听器初始化完成');
        } catch (error) {
            console.error('事件监听器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        // 如果工具类可用，使用Toast，否则使用alert
        if (window.AddressManagerUtils?.MessageUtils) {
            window.AddressManagerUtils.MessageUtils.showToast(message, 'danger');
        } else {
            alert(message);
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
            config: typeof window.AddressManagerConfig !== 'undefined',
            utils: typeof window.AddressManagerUtils !== 'undefined',
            processor: typeof window.AddressProcessor !== 'undefined',
            eventHandlers: typeof window.AddressManagerEventHandlers !== 'undefined',
            core: typeof window.AddressManagerCore !== 'undefined'
        };
    }

    /**
     * 重新初始化应用（调试用）
     */
    reinitialize() {
        this.initialized = false;
        this.touchHandlersAdded = false;
        
        // 清除现有事件监听器（如果需要的话）
        console.log('重新初始化应用程序...');
        
        return this.init();
    }

    /**
     * 获取平台统计信息
     * @returns {Object} 平台统计
     */
    getPlatformStats() {
        const { PlatformUtils } = window.AddressManagerUtils;
        const platforms = PlatformUtils.getAllPlatforms();
        
        const stats = {};
        platforms.forEach(platform => {
            const elements = window.AddressManagerUtils.DOMUtils.getPlatformElements(platform);
            stats[platform] = {
                hasInput: Boolean(elements.input?.value?.trim()),
                hasResults: Boolean(elements.output?.textContent?.trim()),
                hasFinalResults: Boolean(elements.finalOutput?.textContent?.trim()),
                addressCount: this.getAddressCount(platform)
            };
        });
        
        return stats;
    }

    /**
     * 获取平台地址数量
     * @param {string} platform - 平台标识
     * @returns {number} 地址数量
     */
    getAddressCount(platform) {
        try {
            const addressList = document.getElementById(`${platform}-address-list`);
            return addressList ? addressList.querySelectorAll('.address-item').length : 0;
        } catch {
            return 0;
        }
    }

    /**
     * 导出应用配置（调试用）
     * @returns {Object} 应用配置
     */
    exportConfig() {
        return {
            appStatus: this.getAppStatus(),
            platformStats: this.getPlatformStats(),
            config: window.AddressManagerConfig,
            globalState: window.AddressManagerCore?.globalStateManager?.getAllState()
        };
    }
}

/**
 * 全局应用实例
 */
const addressOrderApp = new AddressOrderApp();

/**
 * DOM加载完成后自动初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化应用程序...');
    addressOrderApp.init().catch(error => {
        console.error('应用程序启动失败:', error);
    });
});

/**
 * 页面卸载前清理
 */
window.addEventListener('beforeunload', () => {
    // 清理全局状态（如果需要）
    if (window.AddressManagerCore?.globalStateManager) {
        // 可以在这里保存状态到localStorage等
        console.log('应用程序正在关闭...');
    }
});

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 如果是严重错误，可以提示用户
    if (event.error?.name === 'TypeError' || event.error?.name === 'ReferenceError') {
        if (window.AddressManagerUtils?.MessageUtils) {
            window.AddressManagerUtils.MessageUtils.showToast('系统遇到错误，请刷新页面', 'danger');
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
    
    if (window.AddressManagerUtils?.MessageUtils) {
        window.AddressManagerUtils.MessageUtils.showToast('操作失败，请重试', 'warning');
    }
});

// 导出到全局作用域供调试使用
window.AddressOrderApp = {
    app: addressOrderApp,
    AddressOrderApp
};

// 提供简化的API
window.appAPI = {
    // 获取应用状态
    status: () => addressOrderApp.getAppStatus(),
    
    // 获取平台统计
    stats: () => addressOrderApp.getPlatformStats(),
    
    // 重新初始化
    reinit: () => addressOrderApp.reinitialize(),
    
    // 导出配置
    export: () => addressOrderApp.exportConfig(),
    
    // 清理数据
    clear: (platform) => {
        if (platform) {
            window.AddressManagerCore.globalStateManager.clearPlatformState(platform);
        } else {
            window.AddressManagerCore.globalStateManager.reset();
        }
    }
};

console.log('智能地址订单管理系统脚本加载完成');
console.log('调试API可通过 window.appAPI 访问');
console.log('应用实例可通过 window.AddressOrderApp.app 访问');
