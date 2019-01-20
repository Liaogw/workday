package com.linkcld.workday.resource;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.linkcld.workday.service.WorkDayService;
import com.linkcld.workday.utils.CacheMap;

@Controller
@RequestMapping(value = "api")
public class WorkDayResource {

	@Autowired
	private WorkDayService workDayService;

	@Autowired
	private CacheMap CacheMap;

	@RequestMapping()
	@ResponseBody
	public void cacheMap() {
		CacheMap.setCacheMap();
	}

	@RequestMapping("notWorkDay")
	@ResponseBody
	public List<Map<String, Object>> getNotWorkDay(String start, String end) {
		return findNotWorkday(start, end);
	}

	@RequestMapping("find/not/workday")
	@ResponseBody
	public List<Map<String, Object>> findNotWorkday(String start, String end) {
		return workDayService.getNotWorkDayList(start, end);
	}

	@RequestMapping("nowToGetFewDays")
	@ResponseBody
	public String getNowToGetFewDays(int workDay) {
		return addNowWorkdays(workDay);
	}

	@RequestMapping("add/now/workdays")
	@ResponseBody
	public String addNowWorkdays(int workDay) {
		return workDayService.addWorkDays(workDay);
	}

	@RequestMapping("dateToGetFewDays")
	@ResponseBody
	public String getDateToGetFewDays(String date, int workDay) {
		return addDateWorkdays(date, workDay);
	}

	@RequestMapping("add/date/workdays")
	@ResponseBody
	public String addDateWorkdays(String date, int workDay) {
		return workDayService.addWorkDays(date, workDay);
	}

	@RequestMapping("isWorkDay")
	@ResponseBody
	public Boolean getIsWorkDay(String date) {
		return judgedWorkDay(date);
	}

	@RequestMapping("judged/workday")
	@ResponseBody
	public Boolean judgedWorkDay(String date) {
		if (workDayService.getISWorkDay(date) == 0) {
			return false;
		} else {
			return true;
		}
	}

	@RequestMapping("saveWorkDay")
	@ResponseBody
	public Boolean saveWorkDay(String date, int isWorkDay) {
		return updateWorkday(date, isWorkDay);
	}

	@RequestMapping("update/workday")
	@ResponseBody
	public Boolean updateWorkday(String date, int isWorkDay) {
		return workDayService.getTimeEntiy(date, isWorkDay);
	}

	@RequestMapping("manage")
	public String manage() {
		return "workday/workday";
	}

	@RequestMapping("edit")
	public String edit(Model model, String date) {
		model.addAttribute("date", date);
		return "workday/editDay";
	}

	@RequestMapping("month/workdays")
	@ResponseBody
	public Integer monthOfWorkDays(String date) {
		LocalDate localDate = LocalDate.parse(date);
		return workDayService.monthOfWorkDays(localDate);
	}
}
