# workday
提供一个简单的工作日计算服务，并提供维护页面

## 一、使用环境

### JDK1.8
### redis 数据库

## 二、实现

判断日期是否为工作日：根据日期计算当天是否为特殊日期，不是则按正常工作日计算。

特殊日期：周一至周五是休息日、周六周日是工作日，数据保存到redis中。

增加N个工作日：for(int i = 0; i < n; i++) // 获取下一个日期，计算每个日期是否为工作日，否则i--
