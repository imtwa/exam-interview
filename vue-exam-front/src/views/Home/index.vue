<template>
  <div class="home-page">
    <!-- 搜索区域 -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-title">
          <h1>搜索试题/文档</h1>
        </div>

        <div class="search-content">
          <div class="search-left">
            <div class="search-item">
              <div class="item-icon">
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
              <div class="item-content">
                <h3>免费搜题</h3>
                <p>
                  36亿+职业资格试题，不私藏不到答案，支持拍照、语音、文字和AI搜题，轻松找到试题答案和解析
                </p>
              </div>
            </div>

            <div class="search-item">
              <div class="item-icon">
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
              <div class="item-content">
                <h3>免费文档下载</h3>
                <p>100万+海量资料库，全面覆盖职业资格考试，持续更新，紧随考试动态</p>
              </div>
            </div>

            <div class="search-action">
              <el-button type="primary" class="search-btn">免费搜索</el-button>
            </div>
          </div>

          <div class="search-right">
            <div class="search-demo">
              <div class="demo-header">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="demo-body">
                <div class="demo-search">
                  <el-input placeholder="搜索试题/文档" v-model="searchText">
                    <template #append>
                      <el-button type="primary">搜索</el-button>
                    </template>
                  </el-input>
                </div>

                <div class="demo-files">
                  <div class="file-item">
                    <div class="file-info">
                      <p class="file-name">试题文档.doc</p>
                      <p class="file-size">260页</p>
                    </div>
                    <div class="file-action">
                      <el-button type="text" class="download-btn">
                        <el-icon>
                          <Download />
                        </el-icon>
                      </el-button>
                    </div>
                  </div>

                  <div class="file-item">
                    <div class="file-info">
                      <p class="file-name">报告资料.xlsx</p>
                      <p class="file-size">35页</p>
                    </div>
                    <div class="file-action">
                      <el-button type="text" class="download-btn">
                        <el-icon>
                          <Download />
                        </el-icon>
                      </el-button>
                    </div>
                  </div>

                  <div class="file-item">
                    <div class="file-info">
                      <p class="file-name">考研资料.pdf</p>
                      <p class="file-size">66页</p>
                    </div>
                    <div class="file-action">
                      <el-button type="text" class="download-btn">
                        <el-icon>
                          <Download />
                        </el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>

                <div class="demo-features">
                  <div class="feature-tags">
                    <div class="tag-item">单选题</div>
                    <div class="tag-item">答案</div>
                    <div class="tag-item">解析</div>
                  </div>
                  <div class="feature-stats">
                    <div class="stat-item">
                      <div class="stat-number">36亿+</div>
                      <div class="stat-label">职业资格试题</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">100万+</div>
                      <div class="stat-label">海量资料库</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台数据统计 -->
    <section class="stats-section">
      <div class="stats-container">
        <h2 class="section-title">为广大个人用户和企业用户 提供一站式招聘考试平台</h2>

        <div class="stats-content">
          <div class="stat-card">
            <div class="stat-number">36<span class="unit">亿+</span></div>
            <div class="stat-label">试题总数</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">2000<span class="unit">万+</span></div>
            <div class="stat-label">题库总数</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">100<span class="unit">万+</span></div>
            <div class="stat-label">文档资料</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">100<span class="unit">万+</span></div>
            <div class="stat-label">累计发布考试</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">10000<span class="unit">+</span></div>
            <div class="stat-label">每年服务企业</div>
          </div>
        </div>

        <div class="stats-action">
          <el-button type="primary" class="action-btn">免费使用</el-button>
        </div>
      </div>
    </section>

    <!-- 核心功能展示 -->
    <section class="features-section">
      <div class="features-container">
        <h2 class="section-title">多重核心功能，满足考试通关需求</h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Menu />
              </el-icon>
            </div>
            <div class="feature-name">顺序练习</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Refresh />
              </el-icon>
            </div>
            <div class="feature-name">随机练习</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <div class="feature-name">模拟考试</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Tickets />
              </el-icon>
            </div>
            <div class="feature-name">历年真题</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Collection />
              </el-icon>
            </div>
            <div class="feature-name">章节练习</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Edit />
              </el-icon>
            </div>
            <div class="feature-name">题型练习</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Finished />
              </el-icon>
            </div>
            <div class="feature-name">高频考题</div>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <el-icon>
                <Star />
              </el-icon>
            </div>
            <div class="feature-name">错题/收藏题练习</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 招聘信息区域 -->
    <section class="job-section">
      <div class="job-container">
        <h2 class="section-title">热门招聘信息</h2>

        <div class="job-list">
          <div class="job-card">
            <div class="job-header">
              <h3 class="job-title">前端开发工程师</h3>
              <div class="job-salary">15K-25K</div>
            </div>
            <div class="job-info">
              <span class="job-company">云面官科技有限公司</span>
              <span class="job-location">北京</span>
              <span class="job-exp">3-5年</span>
            </div>
            <div class="job-tags">
              <span class="tag">Vue</span>
              <span class="tag">React</span>
              <span class="tag">TypeScript</span>
            </div>
          </div>

          <div class="job-card">
            <div class="job-header">
              <h3 class="job-title">Java开发工程师</h3>
              <div class="job-salary">20K-35K</div>
            </div>
            <div class="job-info">
              <span class="job-company">云面官科技有限公司</span>
              <span class="job-location">上海</span>
              <span class="job-exp">5-10年</span>
            </div>
            <div class="job-tags">
              <span class="tag">Java</span>
              <span class="tag">Spring Boot</span>
              <span class="tag">微服务</span>
            </div>
          </div>

          <div class="job-card">
            <div class="job-header">
              <h3 class="job-title">产品经理</h3>
              <div class="job-salary">18K-30K</div>
            </div>
            <div class="job-info">
              <span class="job-company">云面官科技有限公司</span>
              <span class="job-location">深圳</span>
              <span class="job-exp">3-5年</span>
            </div>
            <div class="job-tags">
              <span class="tag">产品设计</span>
              <span class="tag">需求分析</span>
              <span class="tag">用户体验</span>
            </div>
          </div>
        </div>

        <div class="job-action">
          <el-button type="primary" class="action-btn">查看更多</el-button>
        </div>
      </div>
    </section>

    <!-- 企业服务介绍 -->
    <section class="enterprise-section">
      <div class="enterprise-container">
        <h2 class="section-title">企业招聘解决方案</h2>

        <div class="enterprise-content">
          <div class="content-left">
            <h3>一站式招聘流程管理</h3>
            <p>从发布职位、简历筛选到面试安排、候选人跟踪，提供完整的招聘流程管理解决方案</p>
            <ul>
              <li>智能简历匹配，精准推荐合适人才</li>
              <li>在线视频面试，节省时间与成本</li>
              <li>定制专属题库，科学评估应聘者能力</li>
              <li>数据分析报表，优化招聘策略</li>
            </ul>
            <el-button type="primary" class="contact-btn">联系我们</el-button>
          </div>

          <div class="content-right">
            <div class="enterprise-image">
              <!-- 可以放置企业服务相关的图片 -->
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Menu,
  Refresh,
  Document,
  Tickets,
  Collection,
  Edit,
  Star,
  Finished,
  Download,
  ArrowRight
} from '@element-plus/icons-vue'

const searchText = ref('')
</script>

<style lang="less" scoped>
.home-page {
  width: 100%;
  overflow-x: hidden;
}

// 搜索区域样式
.search-section {
  background: linear-gradient(135deg, #04aaf7 0%, #0352c9 100%);
  padding: 60px 0;

  .search-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .search-title {
    h1 {
      font-size: 36px;
      color: #fff;
      text-align: left;
      margin-bottom: 40px;
    }
  }

  .search-content {
    display: flex;
    justify-content: space-between;

    @media (max-width: 992px) {
      flex-direction: column;
    }
  }

  .search-left {
    flex: 1;
    margin-right: 60px;

    @media (max-width: 992px) {
      margin-right: 0;
      margin-bottom: 40px;
    }
  }

  .search-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 30px;

    .item-icon {
      margin-right: 15px;
      color: #fff;
      font-size: 18px;
    }

    .item-content {
      h3 {
        font-size: 20px;
        color: #fff;
        margin-bottom: 10px;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
        font-size: 16px;
      }
    }
  }

  .search-action {
    margin-top: 40px;

    .search-btn {
      height: 50px;
      padding: 0 40px;
      font-size: 18px;
      background-color: #fff;
      color: #0352c9;
      border: none;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }

  .search-right {
    width: 45%;

    @media (max-width: 992px) {
      width: 100%;
    }
  }

  .search-demo {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

    .demo-header {
      background-color: #f5f5f5;
      padding: 10px;
      display: flex;
      align-items: center;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 6px;

        &.red {
          background-color: #ff5f56;
        }

        &.yellow {
          background-color: #ffbd2e;
        }

        &.green {
          background-color: #27c93f;
        }
      }
    }

    .demo-body {
      padding: 20px;
    }

    .demo-search {
      margin-bottom: 20px;
    }

    .demo-files {
      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .file-info {
          .file-name {
            font-size: 16px;
            color: #333;
            margin-bottom: 5px;
          }

          .file-size {
            font-size: 14px;
            color: #999;
          }
        }

        .download-btn {
          color: #0352c9;
          font-size: 20px;
        }
      }
    }

    .demo-features {
      margin-top: 20px;

      .feature-tags {
        display: flex;
        margin-bottom: 15px;

        .tag-item {
          padding: 6px 12px;
          background-color: #f1f7ff;
          color: #0352c9;
          border-radius: 4px;
          margin-right: 10px;
          font-size: 14px;
        }
      }

      .feature-stats {
        display: flex;
        justify-content: space-between;

        .stat-item {
          text-align: center;

          .stat-number {
            font-size: 24px;
            color: #0352c9;
            font-weight: bold;
          }

          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 8px;
          }
        }
      }
    }
  }
}

// 平台数据统计区域样式
.stats-section {
  background-color: #f5f9ff;
  padding: 80px 0;

  .stats-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  .section-title {
    font-size: 32px;
    color: #333;
    margin-bottom: 60px;
  }

  .stats-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .stat-card {
    width: 18%;
    margin-bottom: 30px;

    @media (max-width: 992px) {
      width: 30%;
    }

    @media (max-width: 768px) {
      width: 100%;
    }

    .stat-number {
      font-size: 42px;
      color: #0352c9;
      font-weight: bold;
      line-height: 1.2;

      .unit {
        font-size: 24px;
      }
    }

    .stat-label {
      font-size: 16px;
      color: #666;
      margin-top: 10px;
    }
  }

  .stats-action {
    margin-top: 60px;

    .action-btn {
      height: 50px;
      padding: 0 40px;
      font-size: 18px;
      background-color: #0352c9;
      border: none;

      &:hover {
        background-color: #0244a8;
      }
    }
  }
}

// 核心功能展示区域样式
.features-section {
  padding: 80px 0;

  .features-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
  }

  .features-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 50px;
  }

  .feature-card {
    width: 22%;
    background-color: #fff;
    border-radius: 8px;
    padding: 30px 20px;
    margin: 1.5%;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    @media (max-width: 992px) {
      width: 30%;
    }

    @media (max-width: 768px) {
      width: 45%;
    }

    @media (max-width: 576px) {
      width: 100%;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 36px;
      color: #0352c9;
      margin-bottom: 20px;
    }

    .feature-name {
      font-size: 18px;
      color: #333;
    }
  }
}

// 招聘信息区域样式
.job-section {
  background-color: #f5f9ff;
  padding: 80px 0;

  .job-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .job-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
  }

  .job-card {
    width: calc(33.33% - 30px);
    margin: 15px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    @media (max-width: 992px) {
      width: calc(50% - 30px);
    }

    @media (max-width: 576px) {
      width: 100%;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .job-title {
        font-size: 18px;
        color: #333;
        font-weight: 600;
      }

      .job-salary {
        color: #ff4d4f;
        font-weight: 600;
      }
    }

    .job-info {
      margin-bottom: 15px;

      span {
        color: #666;
        margin-right: 15px;
        font-size: 14px;

        &:last-child {
          margin-right: 0;
        }
      }
    }

    .job-tags {
      .tag {
        display: inline-block;
        padding: 4px 8px;
        background-color: #f1f7ff;
        color: #0352c9;
        border-radius: 4px;
        margin-right: 8px;
        margin-bottom: 8px;
        font-size: 12px;
      }
    }
  }

  .job-action {
    text-align: center;
    margin-top: 40px;

    .action-btn {
      height: 50px;
      padding: 0 40px;
      font-size: 18px;
      background-color: #0352c9;
      border: none;

      &:hover {
        background-color: #0244a8;
      }
    }
  }
}

// 企业服务介绍区域样式
.enterprise-section {
  padding: 80px 0;

  .enterprise-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .enterprise-content {
    display: flex;
    margin-top: 40px;

    @media (max-width: 992px) {
      flex-direction: column;
    }
  }

  .content-left {
    flex: 1;
    padding-right: 60px;

    @media (max-width: 992px) {
      padding-right: 0;
      margin-bottom: 40px;
    }

    h3 {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    ul {
      margin-bottom: 30px;
      padding-left: 20px;

      li {
        line-height: 1.8;
        font-size: 16px;
        color: #666;
        margin-bottom: 10px;

        &:before {
          content: '✓';
          color: #0352c9;
          margin-right: 10px;
        }
      }
    }

    .contact-btn {
      height: 45px;
      padding: 0 30px;
      font-size: 16px;
      background-color: #0352c9;
      border: none;

      &:hover {
        background-color: #0244a8;
      }
    }
  }

  .content-right {
    width: 45%;

    @media (max-width: 992px) {
      width: 100%;
    }

    .enterprise-image {
      height: 350px;
      background-color: #f5f9ff;
      border-radius: 8px;
    }
  }
}

.section-title {
  font-size: 32px;
  color: #333;
  text-align: center;
  margin-bottom: 50px;
}
</style>
