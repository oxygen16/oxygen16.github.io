/**
 * 智能地址订单管理系统 - 配置文件
 * 统一管理平台信息、产品配置和消息模板
 */

// 平台配置
const PLATFORM_CONFIG = {
    pdd: {
        id: 'pdd',
        name: '拼多多',
        icon: 'bi-shop',
        inputFormat: '每条地址3行，多条地址连续输入',
        placeholder: '请输入拼多多地址，例如：\n王凯[9989]\n19590448537\n山东省 青岛市 市南区 如东路17号[9989]\n杨宁\n17281428495\n福建省 三明市 泰宁县 三涧路东洲小区7号楼402，杨宁',
        example: '示例格式：\n王凯[9989]\n19590448537\n山东省 青岛市 市南区 如东路17号[9989]',
        description: '支持批量处理，每条地址占3行（姓名、电话、地址）。支持分号（；）分隔的格式',
        validator: (lines) => lines.length % 3 === 0,
        errorMessage: (lines) => `输入的总行数应为3的倍数（姓名、电话、地址）。当前行数：${lines.length}。请检查后重试。`
    },
    dy: {
        id: 'dy',
        name: '抖音',
        icon: 'bi-music-note',
        inputFormat: '每行一条：姓名，电话[-后四位]，地址',
        placeholder: '例如：\n高先生，15782103569-9142，新疆维吾尔自治区 喀什地区 麦盖提县 麦盖提镇 巴扎结米路麦盖提镇刀郎社区幸福小区\n张三，13800001234，浙江省 杭州市 西湖区 XX路100号',
        example: '示例：姓名，电话[-后四位]，地址',
        description: '支持批量处理，每行一条',
        validator: () => true,
        errorMessage: () => '输入格式错误，请检查后重试。'
    },
    tb: {
        id: 'tb',
        name: '淘宝',
        icon: 'bi-cart',
        inputFormat: '每行一条地址',
        placeholder: '请输入淘宝地址，例如：\n上海上海市松江区岳阳街道松汇中路518弄云间名门3号201, 汤亚英, 18466662574-5448\n江苏省苏州市太仓市城厢镇南园西路11号南洋壹号公馆西门 8幢B单元1701, 张珂悦, 15162592550',
        example: '示例格式：\n上海上海市松江区岳阳街道松汇中路518弄云间名门3号201, 汤亚英, 18466662574-5448',
        description: '支持批量处理，每行一条地址，地址格式为：详细地址, 姓名, 电话号码[-虚拟号]',
        validator: () => true,
        errorMessage: () => '输入格式错误，请检查后重试。'
    }
};

// 产品选项配置
const PRODUCT_OPTIONS = [
    { id: 'p5-white', name: '5支装白色', group: '5支装', color: '白色' },
    { id: 'p5-3color', name: '5支装3色', group: '5支装', color: '3色' },
    { id: 'p5-5color', name: '5支装彩色', group: '5支装', color: '彩色' },
    { id: 'p72-white', name: '72支装白色', group: '72支装', color: '白色' },
    { id: 'p72-3color', name: '72支装3色', group: '72支装', color: '3色' },
    { id: 'p72-6color', name: '72支装彩色', group: '72支装', color: '彩色' },
    { id: 'gift-bag', name: '礼品袋', group: '礼品袋', color: '' }
];

// 按钮配置
const BUTTON_CONFIG = {
    process: { 
        icon: 'bi-gear', 
        text: '处理地址并添加订单', 
        class: 'btn-primary' 
    },
    copy: { 
        icon: 'bi-clipboard', 
        text: '复制结果', 
        class: 'btn-success' 
    },
    addOrder: { 
        icon: 'bi-plus-circle', 
        text: '添加订单信息', 
        class: 'btn-purple' 
    },
    generateFinal: { 
        icon: 'bi-check-circle', 
        text: '生成最终订单', 
        class: 'btn-orange w-100' 
    },
    finalCopy: { 
        icon: 'bi-clipboard', 
        text: '复制', 
        class: 'btn-success btn-sm' 
    },
    exportTable: { 
        icon: 'bi-table', 
        text: '导出表格', 
        class: 'btn-danger btn-sm' 
    },
    exportImage: { 
        icon: 'bi-image', 
        text: '导出图片', 
        class: 'btn-warning btn-sm' 
    },
    exportPdf: { 
        icon: 'bi-file-pdf', 
        text: '导出PDF', 
        class: 'btn-purple btn-sm' 
    }
};

// 消息模板
const MESSAGE_TEMPLATES = {
    inputRequired: (platformName) => `请输入${platformName}地址`,
    copySuccess: (platformName) => `${platformName}处理结果已复制到剪贴板`,
    copyFailed: () => '复制失败，请手动复制',
    noContent: () => '没有可复制的内容，请先处理地址',
    orderCopySuccess: () => '订单信息已复制到剪贴板',
    noOrderContent: () => '没有可复制的内容，请先生成订单信息',
    generateOrderFirst: () => '请先生成订单信息',
    noDataToExport: () => '没有数据可导出',
    exportSuccess: (type) => `${type}已导出成功`,
    exportFailed: (type) => `生成${type}失败，请重试`,
    invalidFormat: () => '无法提取信息，请检查输入格式'
};

// 颜色排序配置
const COLOR_ORDER = {
    '5支装': ['白色', '3色', '5色'],
    '72支装': ['白色', '3色', '6色']
};

// DOM选择器配置
const SELECTORS = {
    input: (platform) => `${platform}-input`,
    result: (platform) => `${platform}-result`,
    output: (platform) => `${platform}-output`,
    orderSection: (platform) => `${platform}-order-section`,
    finalResult: (platform) => `${platform}-final-result`,
    finalOutput: (platform) => `${platform}-final-output`,
    tablePreview: (platform) => `${platform}-table-preview`,
    tableContainer: (platform) => `${platform}-table-container`,
    addressList: (platform) => `${platform}-address-list`,
    
    // 按钮选择器
    processBtn: (platform) => `${platform}-process-btn`,
    copyBtn: (platform) => `${platform}-copy`,
    addOrderBtn: (platform) => `${platform}-add-order-btn`,
    generateFinalBtn: (platform) => `${platform}-generate-final-btn`,
    finalCopyBtn: (platform) => `${platform}-final-copy`,
    exportTableBtn: (platform) => `${platform}-export-table`,
    exportImageBtn: (platform) => `${platform}-export-image`,
    exportPdfBtn: (platform) => `${platform}-export-pdf`
};

// 导出文件名模板
const FILE_NAME_TEMPLATES = {
    csv: (platform, timestamp) => `${PLATFORM_CONFIG[platform].name}订单数据_${timestamp}.csv`,
    png: (platform, timestamp) => `${PLATFORM_CONFIG[platform].name}订单数据_${timestamp}.png`,
    pdf: (platform, timestamp) => `${PLATFORM_CONFIG[platform].name}订单数据_${timestamp}.pdf`
};

// 时间戳生成器
const TIMESTAMP_GENERATOR = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// CSS类名常量
const CSS_CLASSES = {
    hidden: 'd-none',
    visible: 'd-block',
    loading: 'loading-overlay',
    addressItem: 'address-item p-3 mb-3',
    addressOption: 'address-order-option p-2 me-2 mb-2 d-inline-flex align-items-center',
    addressQuantity: 'form-control address-quantity',
    checkbox: 'form-check-input address-order-checkbox me-1',
    label: 'form-check-label me-1 small'
};

// 验证规则
const VALIDATION_RULES = {
    required: (value) => value && value.trim() !== '',
    minLength: (value, min) => value && value.trim().length >= min,
    isNumber: (value) => !isNaN(value) && isFinite(value),
    isPositiveNumber: (value) => !isNaN(value) && isFinite(value) && Number(value) > 0
};

// 导出配置对象（用于模块化）
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.AddressManagerConfig = {
        PLATFORM_CONFIG,
        PRODUCT_OPTIONS,
        BUTTON_CONFIG,
        MESSAGE_TEMPLATES,
        COLOR_ORDER,
        SELECTORS,
        FILE_NAME_TEMPLATES,
        TIMESTAMP_GENERATOR,
        CSS_CLASSES,
        VALIDATION_RULES
    };
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PLATFORM_CONFIG,
        PRODUCT_OPTIONS,
        BUTTON_CONFIG,
        MESSAGE_TEMPLATES,
        COLOR_ORDER,
        SELECTORS,
        FILE_NAME_TEMPLATES,
        TIMESTAMP_GENERATOR,
        CSS_CLASSES,
        VALIDATION_RULES
    };
}
