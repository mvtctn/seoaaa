import { logger } from '../logger'

/**
 * Image Utility - AI Powered & Context Aware
 * Translates and optimizes prompts for high relevance.
 */

export async function generateImage(prompt: string, width: number = 1024, height: number = 600) {
    logger.info("Optimizing prompt for relevance:", prompt);

    // 1. Translate common SEO/Technical terms to English for better AI understanding
    let enPrompt = prompt.toLowerCase();
    const dictionary: { [key: string]: string } = {
        "hệ thống": "system",
        "thoát nước": "drainage",
        "siphonic": "siphonic",
        "mưa": "rain",
        "nhà xưởng": "industrial factory",
        "công nghiệp": "industrial",
        "mái": "roof",
        "nguyên lý": "principle",
        "cấu tạo": "structure",
        "kỹ thuật": "engineering",
        "lợi ích": "benefits",
        "ứng dụng": "application"
    };

    Object.keys(dictionary).forEach(key => {
        enPrompt = enPrompt.replace(new RegExp(key, 'g'), dictionary[key]);
    });

    // 2. Clean and build a high-quality AI prompt
    let cleaned = removeVietnameseTones(enPrompt);
    cleaned = cleaned.replace(/[^\w\s]/g, '').trim();

    // limit to core keywords for stability
    const coreKeywords = cleaned.split(' ').slice(0, 10).join(' ');

    // Add professional style modifiers
    const finalAIPrompt = `${coreKeywords}, professional 3d technical render, architectural visualization, blue-print style, industrial engineering, high detail, 4k`;

    // 3. Use placeholder service to avoid Pollinations.AI rate limit ads
    // Alternative: Use via.placeholder.com for clean, professional placeholders
    const placeholderText = encodeURIComponent(coreKeywords.substring(0, 30));
    return `https://via.placeholder.com/${width}x${height}/1e293b/ffffff?text=${placeholderText}`;

    // Note: If you want to use Pollinations.AI again, uncomment below and remove the placeholder line above
    // const seed = Math.floor(Math.random() * 1000000);
    // return `https://image.pollinations.ai/prompt/${encodeURIComponent(finalAIPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=turbo`;
}

function removeVietnameseTones(str: string) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

export async function generateImagePrompt(title: string, keyword: string) {
    return `${keyword} ${title}`;
}
