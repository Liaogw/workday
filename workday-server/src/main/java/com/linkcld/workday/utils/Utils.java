package com.linkcld.workday.utils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class Utils {

	// 将字符串时间转换为Date类型
	public static Date getDate(String string) {
		DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		LocalDate date = LocalDate.parse(string, f);
		ZoneId zone = ZoneId.systemDefault();
		Date date2 = Date.from(date.atStartOfDay().atZone(zone).toInstant());
		return date2;
	}

	// 将字符串时间转换为Date类型
	public static LocalDate getLocalDate(String string) {
		DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		LocalDate date = LocalDate.parse(string, f);
		return date;
	}

	// 将字符串时间转换为Date类型
	public static String LocalDateToString(LocalDate date) {
		DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String String = date.format(f);
		return String;
	}

}
