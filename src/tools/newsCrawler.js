// newsCrawler.js
import axios from 'axios';
import * as cheerio from 'cheerio';

const keywords = [
    ["vivo", "新品发布", "产品数据统计", "重大事件举措"],
    ["苹果", "三星", "荣耀", "华为", "OPPO", "小米"],
    ["阿里巴巴", "腾讯", "百度", "字节跳动", "微软", "亚马逊"],
    ["高通", "英伟达", "ARM", "台积电"]
];

const tabooWords = ["消息人士称", "据悉", "或", "曝光"];

// 优化后的去重函数（保留中文大小写，仅处理空格）
export const isDuplicate = (title, existingTitles) => {
    const normalizedTitle = title.trim().replace(/\s+/g, ''); // 去除所有空格
    return existingTitles.some(t => t.trim().replace(/\s+/g, '') === normalizedTitle);
};

async function fetchIthomeNews() {
    try {
        const response = await fetch('/api/ithome');
        const text = await response.text();
        const $ = cheerio.load(text, { xmlMode: true });
        return $('item title').map((_, el) => $(el).text()).get();
    } catch (error) {
        console.error('IT之家 RSS 请求失败:', error);
        return [];
    }
}


function filterNews(newsTitles) {
    return newsTitles
        .filter(title => !tabooWords.some(word => title.includes(word)))
        .reduce((acc, title) => {
            keywords.forEach((group, index) => {
                if (group.some(keyword => new RegExp(keyword, 'i').test(title)) && acc[index].length < 3) {
                    acc[index].push(title);
                }
            });
            return acc;
        }, [[], [], [], []])
        .flat();
}

export default async function getFilteredNews() {
    const ithomeNews = await fetchIthomeNews();
    return filterNews(ithomeNews);
}
