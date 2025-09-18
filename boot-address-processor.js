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
        const trimmed = parts.map(p => p.trim()).filter(Boolean);

        // 支持无逗号的单行通用格式：地址 姓名 电话
        if (trimmed.length === 1) {
            const line = trimmed[0];
            // 匹配末尾电话：固话(可带分机) 或 手机(可带后缀)
            const phoneAtEnd = line.match(/(\d{3,4}-\d{6,8}(?:-\d{3,4})?|1\d{10}(?:-\d{3,4})?)\s*$/);
            if (phoneAtEnd) {
                let phonePart = phoneAtEnd[1];
                let beforePhone = line.slice(0, phoneAtEnd.index).trim();

                // 检查前面是否紧邻一个固话（组合情形：固话 手机-后缀）
                const landlineAtEnd = beforePhone.match(/(\d{3,4}-\d{6,8})\s*$/);
                if (landlineAtEnd && this.isMobileWithSuffix(phonePart)) {
                    const landline = landlineAtEnd[1];
                    const ext = this.extractMobileExtension(phonePart);
                    phonePart = `${landline}-${ext}`;
                    beforePhone = beforePhone.slice(0, landlineAtEnd.index).trim();
                }

                // 提取末尾姓名（2-8位中文，含·/•）
                const nameMatch = beforePhone.match(/([\u4e00-\u9fa5·•]{2,8})\s*$/);
                let namePart = '';
                let addressPart = '';
                if (nameMatch) {
                    namePart = nameMatch[1];
                    addressPart = beforePhone.slice(0, nameMatch.index).trim();
                } else {
                    // 兜底：无法识别姓名时，整体视为地址
                    addressPart = beforePhone;
                }

                return { phonePart, namePart, addressPart };
            }
        }
        let index = trimmed.length - 1;

        // 从末尾开始收集可能的电话号码片段（最多收集两个）
        const phoneTokens = [];
        while (index >= 0 && this.isPhoneLike(trimmed[index]) && phoneTokens.length < 2) {
            phoneTokens.unshift(trimmed[index]);
            index--;
        }

        let phonePart = '';
        let namePart = '';
        let addressPart = '';

        if (phoneTokens.length >= 2) {
            // 如果同时包含 固话 和 带后缀的手机，则合并为 固话-后缀
            const landline = phoneTokens.find(t => this.isLandline(t));
            const mobileWithExt = phoneTokens.find(t => this.isMobileWithSuffix(t));
            if (landline && mobileWithExt) {
                const ext = this.extractMobileExtension(mobileWithExt);
                phonePart = `${landline}-${ext}`;
            } else {
                // 其他情况，取最后一个作为电话
                phonePart = phoneTokens[phoneTokens.length - 1];
            }
            namePart = trimmed[index] || '';
            index--;
            addressPart = trimmed.slice(0, Math.max(0, index + 1)).join(',').trim();
        } else if (phoneTokens.length === 1) {
            // 正常：末尾一个电话
            phonePart = phoneTokens[0];
            namePart = trimmed[index] || '';
            index--;
            addressPart = trimmed.slice(0, Math.max(0, index + 1)).join(',').trim();
        } else {
            // 兜底：按 地址, 姓名, 电话 结构（可能不完全符合）
            const len = trimmed.length;
            const hasEnough = len >= 3;
            phonePart = hasEnough ? trimmed[len - 1] : '';
            namePart = hasEnough ? trimmed[len - 2] : (trimmed[len - 1] || '');
            addressPart = hasEnough ? trimmed.slice(0, len - 2).join(',').trim() : trimmed.slice(0, Math.max(0, len - 1)).join(',').trim();
        }

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
            const segments = phoneNumber.split('-');
            if (segments.length >= 3) {
                // 例如：0416-3860170-5404 → 使用最后一段作为短地址后缀
                phoneSuffix = '-' + segments[segments.length - 1];
            } else if (segments.length === 2) {
                // 例如：0416-3860170 或 17896112393-5404
                phoneSuffix = '-' + segments[1];
            } else {
                const suffix = phoneNumber.length >= 4 ? phoneNumber.slice(-4) : phoneNumber;
                phoneSuffix = '-' + suffix;
            }
        }

        return { phoneNumber, phoneSuffix };
    }

    /**
     * 判断是否为固话
     * @param {string} value
     * @returns {boolean}
     */
    isLandline(value) {
        return /^\d{3,4}-\d{6,8}$/.test(value);
    }

    /**
     * 判断是否为11位手机号
     * @param {string} value
     * @returns {boolean}
     */
    isMobile(value) {
        return /^1\d{10}$/.test(value);
    }

    /**
     * 判断是否为携带后缀的手机号（如 17896112393-5404）
     * @param {string} value
     * @returns {boolean}
     */
    isMobileWithSuffix(value) {
        return /^1\d{10}-\d{3,4}$/.test(value);
    }

    /**
     * 是否像电话号码
     * @param {string} value
     * @returns {boolean}
     */
    isPhoneLike(value) {
        return this.isLandline(value) || this.isMobileWithSuffix(value) || this.isMobile(value);
    }

    /**
     * 提取手机号的后缀（-后3~4位）
     * @param {string} mobile
     * @returns {string}
     */
    extractMobileExtension(mobile) {
        const match = mobile.match(/-(\d{3,4})$/);
        return match ? match[1] : (mobile.slice(-4) || '');
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
