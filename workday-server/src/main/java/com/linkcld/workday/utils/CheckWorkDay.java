package com.linkcld.workday.utils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.HashMap;

public class CheckWorkDay {

	public static Integer isWorkDay(String date) {
		LocalDate local = LocalDate.parse(date);
		HashMap<String, Integer> map = CacheMap.getCacheMap();
		if (map.get(date) != null) {
			return map.get(date);
		} else {
			// 读取当天日期
			DayOfWeek dow = DayOfWeek.of(local.get(ChronoField.DAY_OF_WEEK));
			if ((dow == DayOfWeek.SATURDAY) || (dow == DayOfWeek.SUNDAY)) {
				return 0;
			}
		}
		return 1;
	}
}
