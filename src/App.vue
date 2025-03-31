<template>
  <div id="app">
    <h1>{{ dateInfo }}</h1>
    <div class="link-container">
      <a href="https://readhub.cn/daily" target="_blank">每日早报</a>
      <a href="https://www.ithome.com/" target="_blank">IT之家</a>
    </div>
    <draggable 
      v-model="newsList" 
      :options="sortableOptions"
      class="news-list"
    >
      <div 
        v-for="(news, index) in newsList" 
        :key="index" 
        class="news-item"
      >
        <input 
          v-if="editingIndex === index" 
          v-model="newsList[index]" 
          @keyup.enter="saveEdit(index)" 
          @blur="saveEdit(index)"
        >
        <span v-else @click="startEdit(index)">{{ news }}</span>
        <button @click="deleteNews(index)">删除</button>
      </div>
    </draggable>
    <input v-model="newNews" placeholder="输入新的新闻内容">
    <button @click="addNews">添加新闻</button>
    <button @click="outputNews">输出前十项新闻</button>
    <button @click="toggleDate">切换到 {{ isToday ? '明天' : '今天' }}</button>
    <button @click="clearNewsList">一键清空列表</button>
    <pre v-if="outputText">{{ outputText }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import Lunar from 'lunar-javascript';

const newsList = ref([]);
const dateInfo = ref('');
const outputText = ref('');
const isToday = ref(false);
const newNews = ref('');
const editingIndex = ref(-1);

const getDateInfo = () => {
  let now = new Date();
  if (!isToday.value) {
    now.setDate(now.getDate() + 1);
  }
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];

  const solar = Lunar.Solar.fromDate(now);
  const lunar = solar.getLunar();
  const lunarMonth = lunar.getMonthInChinese();
  const lunarDay = lunar.getDayInChinese();

  dateInfo.value = `${year}年${month}月${day}日 ${lunarMonth}${lunarDay} ${week}`;
};

const outputNews = () => {
  let text = `${dateInfo.value}\n`;
  newsList.value.slice(0, 10).forEach((news, index) => {
    text += `${index + 1}. ${news}\n\n`;
  });
  outputText.value = text;
};

const toggleDate = () => {
  isToday.value = !isToday.value;
  getDateInfo();
};

const addNews = () => {
  if (newNews.value.trim()) {
    newsList.value.push(newNews.value);
    newNews.value = '';
    saveNewsToLocalStorage();
  }
};

const startEdit = (index) => {
  editingIndex.value = index;
};

const saveEdit = (index) => {
  editingIndex.value = -1;
  saveNewsToLocalStorage();
};

const deleteNews = (index) => {
  newsList.value.splice(index, 1);
  saveNewsToLocalStorage();
};

const saveNewsToLocalStorage = () => {
  localStorage.setItem('newsList', JSON.stringify(newsList.value));
};

const loadNewsFromLocalStorage = () => {
  const storedNews = localStorage.getItem('newsList');
  if (storedNews) {
    newsList.value = JSON.parse(storedNews);
  } else {
    newsList.value = [];
  }
};

const sortableOptions = {
  animation: 150,
  onEnd: (evt) => {
    console.log('排序完成', evt);
    saveNewsToLocalStorage();
  }
};

const clearNewsList = () => {
  if (confirm('确定要清空新闻列表吗？')) {
    newsList.value = [];
    saveNewsToLocalStorage();
  }
};

onMounted(() => {
  loadNewsFromLocalStorage();
  getDateInfo();
  setInterval(getDateInfo, 1000 * 60);
});

watch(newsList, () => {
  saveNewsToLocalStorage();
});
</script>

<style scoped>
.link-container {
  margin: 20px 0;
}

.link-container a {
  display: inline-block;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  margin-right: 10px;
  transition: background-color 0.3s;
}

.link-container a:hover {
  background-color: #3eaf7c;
}

.news-list {
  border: 1px solid #ccc;
  padding: 10px;
  min-height: 200px;
}

.news-item {
  padding: 10px;
  margin: 5px 0;
  background-color: #f0f0f0;
  cursor: grab;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.news-item input {
  flex: 1;
  margin-right: 10px;
}

.news-item button {
  margin-left: 10px;
}

.news-item:active {
  cursor: grabbing;
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
</style>