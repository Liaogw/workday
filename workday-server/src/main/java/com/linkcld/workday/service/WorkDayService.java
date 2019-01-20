package com.linkcld.workday.service;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.linkcld.workday.model.Workday;
import com.linkcld.workday.repository.WorkDayRepository;
import com.linkcld.workday.utils.CacheMap;
import com.linkcld.workday.utils.CheckWorkDay;
import com.linkcld.workday.utils.Utils;

@Service("workDayService")
public class WorkDayService{

	@Autowired
	private WorkDayRepository workDayRepository;

	@Autowired
	private CacheMap CacheMap;

	// 获取时间段内的节假日
	public List<Map<String, Object>> getNotWorkDayList(String start, String end) {
		// 是否需要更新缓存
		cacheMap();
		LocalDate startDate = Utils.getLocalDate(start);
		LocalDate endDate = Utils.getLocalDate(end);
		long number = startDate.until(endDate, ChronoUnit.DAYS);
		List<Map<String, Object>> dayList = new ArrayList<>();
		String date = "";
		int flag = 0;
		for (int i = 0; i < number; i++) {
			LocalDate LocalDate = startDate.plusDays(i);
			date = Utils.LocalDateToString(LocalDate);
			flag = CheckWorkDay.isWorkDay(date);
			if (flag == 0) {
				Map<String, Object> resultMap = new HashMap<>();
				resultMap.put("title", "节假日");
				resultMap.put("start", date);
				dayList.add(resultMap);
			}
		}
		return dayList;
	}

	// 获取当前日期+工作日 的具体工作日日期
	public String addWorkDays(int workDay) {
		// 是否需要更新缓存
		cacheMap();
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		String date = format.format(new Date());
		for (int i = 0; i < workDay; i++) {
			date = getNextDay(date);
			int flag = CheckWorkDay.isWorkDay(date);
			if (flag == 0) {
				i--;
			}
		}
		return date;
	}

	// 获取自定义日期+工作日 的具体工作日日期
	public String addWorkDays(String date, int workDay) {
		String string = date;
		for (int i = 0; i < workDay; i++) {
			string = getNextDay(string);
			int flag = getISWorkDay(string);
			if (flag == 0) {
				i--;
			}
		}
		return string;
	}

	// 判断传入日期是否为工作日
	public int getISWorkDay(String time) {
		// 是否需要更新缓存
		cacheMap();
		return CheckWorkDay.isWorkDay(time);
	}

	// 获取下一题的日期时间
	public String getNextDay(String string) {
		DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		LocalDate date = LocalDate.parse(string, f);
		LocalDate firstDayOf2015 = date.plusDays(1);
		String str = firstDayOf2015.format(f);
		return str;
	}

	public boolean getTimeEntiy(String time, int isWorkDay) {
		Workday workday = workDayRepository.findByDay(LocalDate.parse(time));
		if (workday == null) {
			workday = new Workday();
			workday.setDay(Utils.getLocalDate(time));
			workday.setIsWorkday(isWorkDay);
		}
		workday.setIsWorkday(isWorkDay);
		workDayRepository.save(workday);
		// 更新缓存
		CacheMap.setCacheMap();
		return true;
	}

	private void cacheMap() {
		if (!CacheMap.getCacheFlag()) {
			CacheMap.setCacheMap();
		}
	}

	/**
	 * 获取日期是第几个工作日
	 */
	public Integer monthOfWorkDays(LocalDate localDate) {
		DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		Integer days = localDate.getDayOfMonth();
		Integer result = 0;
		// 如果传入日期不是工作日，直接返回
		if (getISWorkDay(localDate.format(format)) == 0) {
			return result;
		}
		for (int i = 0; i < days; i++) {
			String date = localDate.minusDays(i).format(format);
			result += getISWorkDay(date);
		}
		return result;
	}
}
