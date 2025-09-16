/**
 * 智能地址订单管理系统 - 地址处理器
 * 使用策略模式处理不同平台的地址格式
 */

/**
 * 地址处理结果接口
 * @typedef {Object} AddressResult
 * @property {string} shortAddress - 短地址标识
 * @property {string} originalName - 原始姓名
 * @property {string} phone - 电话号码
 * @property {string} address - 详细地址
 */

/**
 * 抽象地址处理策略基类
 */
class AddressProcessorStrategy {
    /**
     * 处理地址数据
     * @param {string} input - 输入数据
     * @returns {AddressResult[]} 处理结果数组
     */
    process(input) {
        throw new Error('process方法必须被子类实现');
    }

    /**
     * 验证输入格式
     * @param {string} input - 输入数据
     * @returns {boolean} 是否有效
     */
    validate(input) {
        return Boolean(input && input.trim());
    }

    /**
     * 获取平台名称
     * @returns {string} 平台名称
     */
    getPlatformName() {
        throw new Error('getPlatformName方法必须被子类实现');
    }
}

/**
 * 拼多多地址处理策略
 */
class PddAddressProcessor extends AddressProcessorStrategy {
    /**
     * 处理拼多多地址格式
     * @param {string} input - 输入数据
     * @returns {AddressResult[]}
     */
    process(input) {
        const results = [];
        
        // 预处理输入（支持分号分隔格式）
        let processedInput = this.preprocessInput(input);
        
        const lines = processedInput.split('\n').filter(line => line.trim() !== '');
        
        // 验证行数必须是3的倍数
        if (lines.length % 3 !== 0) {
            throw new Error(`输入的总行数应为3的倍数（姓名、电话、地址）。当前行数：${lines.length}。请检查后重试。`);
        }
        
        // 每3行处理一条地址
        for (let i = 0; i < lines.length; i += 3) {
            const nameLine = lines[i].trim();
            const phoneLine = lines[i + 1].trim();
            const addressLine = this.cleanAddress(lines[i + 2].trim());
            
            const shortAddress = this.generateShortAddress(nameLine, phoneLine);
            
            results.push({
                shortAddress,
                originalName: nameLine,
                phone: phoneLine,
                address: addressLine
            });
        }
        
        return results;
    }

    /**
     * 预处理输入数据，支持分号分隔格式
     * @param {string} input - 原始输入
     * @returns {string} 处理后的输入
     */
    preprocessInput(input) {
        if (input.includes('；')) {
            return input.replace(/；\s*/g, '\n').replace(/\n+/g, '\n').trim();
        }
        return input;
    }

    /**
     * 清理地址中的多余符号
     * @param {string} address - 原始地址
     * @returns {string} 清理后的地址
     */
    cleanAddress(address) {
        return address.replace(/；\s*$/, '').replace(/\[\d+\]；\s*$/, '').trim();
    }

    /**
     * 生成短地址标识
     * @param {string} name - 姓名
     * @param {string} phone - 电话
     * @returns {string} 短地址
     */
    generateShortAddress(name, phone) {
        // 如果姓名已包含[]格式，直接使用
        if (name.includes('[') && name.includes(']')) {
            return name;
        }
        
        // 否则生成 姓名-电话后四位 格式
        const phoneSuffix = phone.length >= 4 ? phone.slice(-4) : phone;
        return `${name}-${phoneSuffix}`;
    }

    /**
     * 验证拼多多地址格式
     * @param {string} input - 输入数据
     * @returns {boolean}
     */
    validate(input) {
        if (!super.validate(input)) return false;
        
        const processedInput = this.preprocessInput(input);
        const lines = processedInput.split('\n').filter(line => line.trim() !== '');
        
        return lines.length % 3 === 0 && lines.length > 0;
    }

    getPlatformName() {
        return '拼多多';
    }
}

/**
 * 抖音地址处理策略
 */
class DouyinAddressProcessor extends AddressProcessorStrategy {
    /**
     * 处理抖音地址格式
     * @param {string} input - 输入数据
     * @returns {AddressResult[]}
     */
    process(input) {
        const results = [];
        const lines = input.split('\n').filter(line => line.trim() !== '');
        
        for (const rawLine of lines) {
            const processedLine = this.preprocessLine(rawLine);
            const parts = this.parseLine(processedLine);
            
            if (parts.length < 2) continue;
            
            const namePart = parts[0];
            const phonePart = parts[1] || '';
            const addressPart = parts.slice(2).join(',');
            
            const { phoneNumber, phoneSuffix } = this.parsePhone(phonePart);
            const shortAddress = namePart + phoneSuffix;
            
            results.push({
                shortAddress,
                originalName: namePart,
                phone: phoneNumber,
                address: addressPart
            });
        }
        
        return results;
    }

    /**
     * 预处理行数据
     * @param {string} line - 原始行
     * @returns {string} 处理后的行
     */
    preprocessLine(line) {
        return line.replace(/，/g, ',');
    }

    /**
     * 解析行数据
     * @param {string} line - 处理后的行
     * @returns {string[]} 分割后的部分
     */
    parseLine(line) {
        return line.split(',').map(p => p.trim()).filter(Boolean);
    }

    /**
     * 解析电话号码
     * @param {string} phonePart - 电话部分
     * @returns {Object} {phoneNumber: string, phoneSuffix: string}
     */
    parsePhone(phonePart) {
        let phoneSuffix = '';
        let phoneNumber = phonePart;
        
        if (phoneNumber) {
            const hyphenParts = phoneNumber.split('-');
            if (hyphenParts.length >= 2) {
                phoneSuffix = '-' + hyphenParts[1];
                phoneNumber = hyphenParts[0];
            } else {
                const suffix = phoneNumber.length >= 4 ? phoneNumber.slice(-4) : phoneNumber;
                phoneSuffix = '-' + suffix;
            }
        }
        
        return { phoneNumber, phoneSuffix };
    }

    getPlatformName() {
        return '抖音';
    }
}

/**
 * 淘宝地址处理策略
 */
class TaobaoAddressProcessor extends AddressProcessorStrategy {
    /**
     * 处理淘宝地址格式
     * @param {string} input - 输入数据
     * @returns {AddressResult[]}
     */
    process(input) {
        const results = [];
        const lines = input.split('\n').filter(line => line.trim() !== '');
        
        for (const rawLine of lines) {
            const processedLine = this.preprocessLine(rawLine);
            const parts = this.parseLine(processedLine);
            
            if (parts.length < 2) continue;
            
            const { phonePart, namePart, addressPart } = this.extractParts(parts);
            const { phoneNumber, phoneSuffix } = this.parsePhone(phonePart);
            const shortAddress = namePart + phoneSuffix;
            
            results.push({
                shortAddress,
                originalName: namePart,
                phone: phoneNumber,
                address: addressPart
            });
        }
        
        return results;
    }

    /**
     * 预处理行数据
     * @param {string} line - 原始行
     * @returns {string} 处理后的行
     */
    preprocessLine(line) {
        return line.replace(/，/g, ',');
    }

    /**
     * 解析行数据
     * @param {string} line - 处理后的行
     * @returns {string[]} 分割后的部分
     */
    parseLine(line) {
        return line.split(',');
    }

    /**
     * 提取地址各部分（倒序解析：电话、姓名、地址）
     * @param {string[]} parts - 分割后的部分
     * @returns {Object} {phonePart: string, namePart: string, addressPart: string}
     */
    extractParts(parts) {
        const phonePart = parts.length >= 3 ? parts[parts.length - 1].trim() : '';
        const namePart = parts[parts.length - 2].trim();
        const addressPart = parts.slice(0, parts.length - 2).join(',').trim();
        
        return { phonePart, namePart, addressPart };
    }

    /**
     * 解析电话号码
     * @param {string} phonePart - 电话部分
     * @returns {Object} {phoneNumber: string, phoneSuffix: string}
     */
    parsePhone(phonePart) {
        let phoneSuffix = '';
        let phoneNumber = phonePart;
        
        if (phoneNumber) {
            const phoneHyphenParts = phoneNumber.split('-');
            if (phoneHyphenParts.length >= 2) {
                phoneSuffix = '-' + phoneHyphenParts[1];
            } else {
                const suffix = phoneNumber.length >= 4 ? phoneNumber.slice(-4) : phoneNumber;
                phoneSuffix = '-' + suffix;
            }
        }
        
        return { phoneNumber, phoneSuffix };
    }

    getPlatformName() {
        return '淘宝';
    }
}

/**
 * 地址处理器工厂
 */
class AddressProcessorFactory {
    static strategies = {
        pdd: new PddAddressProcessor(),
        dy: new DouyinAddressProcessor(),
        tb: new TaobaoAddressProcessor()
    };

    /**
     * 获取处理策略
     * @param {string} platform - 平台标识
     * @returns {AddressProcessorStrategy}
     */
    static getProcessor(platform) {
        const processor = this.strategies[platform];
        if (!processor) {
            throw new Error(`不支持的平台: ${platform}`);
        }
        return processor;
    }

    /**
     * 处理地址数据
     * @param {string} platform - 平台标识
     * @param {string} input - 输入数据
     * @returns {AddressResult[]}
     */
    static processAddresses(platform, input) {
        const processor = this.getProcessor(platform);
        return processor.process(input);
    }

    /**
     * 验证地址格式
     * @param {string} platform - 平台标识
     * @param {string} input - 输入数据
     * @returns {boolean}
     */
    static validateAddresses(platform, input) {
        try {
            const processor = this.getProcessor(platform);
            return processor.validate(input);
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取支持的平台列表
     * @returns {string[]}
     */
    static getSupportedPlatforms() {
        return Object.keys(this.strategies);
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.AddressProcessor = {
        AddressProcessorStrategy,
        PddAddressProcessor,
        DouyinAddressProcessor,
        TaobaoAddressProcessor,
        AddressProcessorFactory
    };
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AddressProcessorStrategy,
        PddAddressProcessor,
        DouyinAddressProcessor,
        TaobaoAddressProcessor,
        AddressProcessorFactory
    };
}
