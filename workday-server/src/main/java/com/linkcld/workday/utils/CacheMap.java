package com.linkcld.workday.utils;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.linkcld.workday.model.Workday;
import com.linkcld.workday.repository.WorkDayRepository;

@Component
public class CacheMap {

	/** 保存查询结果集的Map **/
	private static HashMap<String, Integer> cacheMap = new HashMap<>();

	/**
	 * 是否缓存
	 */
	private static Boolean cacheFlag = false;

	@Autowired
	private WorkDayRepository workDayRepository;

	@Scheduled(cron = "00 00 0 * * ?")
	public void setCacheMap() {

		DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		List<Workday> listWorkDay = workDayRepository.findAll();
		cacheMap = new HashMap<>();
		for (Workday workDay : listWorkDay) {
			cacheMap.put(workDay.getDay().format(f), workDay.getIsWorkday());
		}
		cacheFlag = true;
	}

	public static HashMap<String, Integer> getCacheMap() {
		return cacheMap;
	}

	public static void setCacheMap(HashMap<String, Integer> cacheMap) {
		CacheMap.cacheMap = cacheMap;
	}

	public Boolean getCacheFlag() {
		return cacheFlag;
	}

	public static void setCacheFlag(Boolean cacheFlag) {
		CacheMap.cacheFlag = cacheFlag;
	}
}
