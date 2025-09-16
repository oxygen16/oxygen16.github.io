/**
 * 智能地址订单管理系统 - 工具类
 * 提供通用的DOM操作、消息提示、数据处理等功能
 */

/**
 * DOM操作工具类
 */
class DOMUtils {
    /**
     * 获取元素
     * @param {string} id - 元素ID
     * @returns {HTMLElement|null}
     */
    static getElement(id) {
        return document.getElementById(id);
    }

    /**
     * 获取平台相关的所有DOM元素
     * @param {string} platform - 平台标识
     * @returns {Object} 包含所有相关DOM元素的对象
     */
    static getPlatformElements(platform) {
        const { SELECTORS } = window.AddressManagerConfig;
        return {
            input: this.getElement(SELECTORS.input(platform)),
            result: this.getElement(SELECTORS.result(platform)),
            output: this.getElement(SELECTORS.output(platform)),
            orderSection: this.getElement(SELECTORS.orderSection(platform)),
            finalResult: this.getElement(SELECTORS.finalResult(platform)),
            finalOutput: this.getElement(SELECTORS.finalOutput(platform)),
            tablePreview: this.getElement(SELECTORS.tablePreview(platform)),
            tableContainer: this.getElement(SELECTORS.tableContainer(platform)),
            addressList: this.getElement(SELECTORS.addressList(platform))
        };
    }

    /**
     * 显示/隐藏元素
     * @param {HTMLElement} element - 要操作的元素
     * @param {boolean} show - 是否显示
     */
    static toggleElement(element, show) {
        if (!element) return;
        const { CSS_CLASSES } = window.AddressManagerConfig;
        
        if (show) {
            element.classList.remove(CSS_CLASSES.hidden);
            element.classList.add(CSS_CLASSES.visible);
        } else {
            element.classList.add(CSS_CLASSES.hidden);
            element.classList.remove(CSS_CLASSES.visible);
        }
    }

    /**
     * 批量显示/隐藏元素
     * @param {Object} elements - 元素对象
     * @param {Object} visibility - 显示状态对象
     */
    static toggleElements(elements, visibility) {
        Object.keys(visibility).forEach(key => {
            if (elements[key]) {
                this.toggleElement(elements[key], visibility[key]);
            }
        });
    }

    /**
     * 清空元素内容
     * @param {HTMLElement} element - 要清空的元素
     */
    static clearElement(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    /**
     * 设置元素文本内容
     * @param {HTMLElement} element - 目标元素
     * @param {string} text - 文本内容
     */
    static setTextContent(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * 添加HTML内容到元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} html - HTML内容
     */
    static appendHTML(element, html) {
        if (element) {
            element.insertAdjacentHTML('beforeend', html);
        }
    }
}

/**
 * 消息提示工具类
 */
class MessageUtils {
    /**
     * 显示Toast消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, danger, warning, info)
     */
    static showToast(message, type = 'info') {
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

    /**
     * 根据消息模板显示消息
     * @param {string} templateKey - 模板键名
     * @param {string} type - 消息类型
     * @param {...any} args - 模板参数
     */
    static showMessage(templateKey, type = 'info', ...args) {
        const { MESSAGE_TEMPLATES } = window.AddressManagerConfig;
        const template = MESSAGE_TEMPLATES[templateKey];
        
        if (typeof template === 'function') {
            this.showToast(template(...args), type);
        } else if (typeof template === 'string') {
            this.showToast(template, type);
        } else {
            console.warn(`消息模板 ${templateKey} 不存在`);
        }
    }
}

/**
 * 剪贴板操作工具类
 */
class ClipboardUtils {
    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @param {string} successMessage - 成功消息
     * @param {string} failMessage - 失败消息
     * @returns {Promise<boolean>}
     */
    static async copyToClipboard(text, successMessage, failMessage) {
        try {
            await navigator.clipboard.writeText(text);
            MessageUtils.showToast(successMessage, 'success');
            return true;
        } catch (error) {
            console.error('复制失败:', error);
            MessageUtils.showToast(failMessage, 'danger');
            return false;
        }
    }

    /**
     * 使用消息模板复制文本
     * @param {string} text - 要复制的文本
     * @param {string} platform - 平台标识
     * @param {string} type - 复制类型 ('result' | 'order')
     * @returns {Promise<boolean>}
     */
    static async copyWithTemplate(text, platform, type = 'result') {
        const { PLATFORM_CONFIG, MESSAGE_TEMPLATES } = window.AddressManagerConfig;
        const platformName = PLATFORM_CONFIG[platform]?.name || platform;
        
        let successMessage, failMessage;
        
        if (type === 'result') {
            successMessage = MESSAGE_TEMPLATES.copySuccess(platformName);
            failMessage = MESSAGE_TEMPLATES.copyFailed();
        } else {
            successMessage = MESSAGE_TEMPLATES.orderCopySuccess();
            failMessage = MESSAGE_TEMPLATES.copyFailed();
        }
        
        return this.copyToClipboard(text, successMessage, failMessage);
    }
}

/**
 * 数据验证工具类
 */
class ValidationUtils {
    /**
     * 验证输入数据
     * @param {string} input - 输入数据
     * @param {string} platform - 平台标识
     * @returns {Object} 验证结果 {isValid: boolean, message: string}
     */
    static validateInput(input, platform) {
        const { PLATFORM_CONFIG, VALIDATION_RULES } = window.AddressManagerConfig;
        const config = PLATFORM_CONFIG[platform];
        
        if (!config) {
            return { isValid: false, message: '不支持的平台' };
        }
        
        if (!VALIDATION_RULES.required(input)) {
            return { 
                isValid: false, 
                message: `请输入${config.name}地址` 
            };
        }
        
        // 平台特定验证
        if (platform === 'pdd') {
            const lines = this.preprocessPddInput(input).split('\n').filter(line => line.trim() !== '');
            if (!config.validator(lines)) {
                return {
                    isValid: false,
                    message: config.errorMessage(lines)
                };
            }
        }
        
        return { isValid: true, message: '' };
    }

    /**
     * 预处理拼多多输入格式
     * @param {string} input - 原始输入
     * @returns {string} 处理后的输入
     */
    static preprocessPddInput(input) {
        let processedInput = input;
        if (input.includes('；')) {
            processedInput = input.replace(/；\s*/g, '\n').replace(/\n+/g, '\n').trim();
        }
        return processedInput;
    }

    /**
     * 验证数量输入
     * @param {string|number} value - 数量值
     * @returns {boolean}
     */
    static validateQuantity(value) {
        const { VALIDATION_RULES } = window.AddressManagerConfig;
        return VALIDATION_RULES.isPositiveNumber(value) || Number(value) === 0;
    }
}

/**
 * 文件操作工具类
 */
class FileUtils {
    /**
     * 生成时间戳
     * @returns {string}
     */
    static generateTimestamp() {
        const { TIMESTAMP_GENERATOR } = window.AddressManagerConfig;
        return TIMESTAMP_GENERATOR();
    }

    /**
     * 生成文件名
     * @param {string} platform - 平台标识
     * @param {string} type - 文件类型
     * @returns {string}
     */
    static generateFileName(platform, type) {
        const { FILE_NAME_TEMPLATES } = window.AddressManagerConfig;
        const timestamp = this.generateTimestamp();
        return FILE_NAME_TEMPLATES[type](platform, timestamp);
    }

    /**
     * 下载文件
     * @param {Blob} blob - 文件数据
     * @param {string} filename - 文件名
     */
    static downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * CSV转义
     * @param {string} value - 要转义的值
     * @returns {string}
     */
    static csvEscape(value) {
        const str = (value ?? '').toString().replace(/"/g, '""');
        return '"' + str + '"';
    }
}

/**
 * 加载状态管理工具类
 */
class LoadingUtils {
    /**
     * 显示/隐藏加载状态
     * @param {boolean} show - 是否显示加载
     */
    static showLoading(show) {
        const loadingEl = DOMUtils.getElement('loading');
        DOMUtils.toggleElement(loadingEl, show);
    }

    /**
     * 执行带加载状态的异步操作
     * @param {Function} asyncOperation - 异步操作函数
     * @returns {Promise}
     */
    static async withLoading(asyncOperation) {
        this.showLoading(true);
        try {
            const result = await asyncOperation();
            return result;
        } finally {
            this.showLoading(false);
        }
    }
}

/**
 * 打印容器工具类
 */
class PrintUtils {
    /**
     * 在可见的打印容器中执行操作
     * @param {Function} operation - 要执行的操作
     * @returns {Promise}
     */
    static withVisiblePrintContainer(operation) {
        const pc = DOMUtils.getElement('print-container');
        const prev = { 
            display: pc.style.display, 
            position: pc.style.position, 
            left: pc.style.left, 
            top: pc.style.top 
        };
        
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
        
        return operation().finally(finalize);
    }
}

/**
 * 平台工具类
 */
class PlatformUtils {
    /**
     * 获取平台名称
     * @param {string} platform - 平台标识
     * @returns {string}
     */
    static getPlatformName(platform) {
        const { PLATFORM_CONFIG } = window.AddressManagerConfig;
        return PLATFORM_CONFIG[platform]?.name || platform;
    }

    /**
     * 获取平台配置
     * @param {string} platform - 平台标识
     * @returns {Object}
     */
    static getPlatformConfig(platform) {
        const { PLATFORM_CONFIG } = window.AddressManagerConfig;
        return PLATFORM_CONFIG[platform];
    }

    /**
     * 获取所有平台列表
     * @returns {string[]}
     */
    static getAllPlatforms() {
        const { PLATFORM_CONFIG } = window.AddressManagerConfig;
        return Object.keys(PLATFORM_CONFIG);
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.AddressManagerUtils = {
        DOMUtils,
        MessageUtils,
        ClipboardUtils,
        ValidationUtils,
        FileUtils,
        LoadingUtils,
        PrintUtils,
        PlatformUtils
    };
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOMUtils,
        MessageUtils,
        ClipboardUtils,
        ValidationUtils,
        FileUtils,
        LoadingUtils,
        PrintUtils,
        PlatformUtils
    };
}
