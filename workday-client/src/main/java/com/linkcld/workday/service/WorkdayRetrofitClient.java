package com.linkcld.workday.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.linkcld.workday.manager.WorkdayManager;

import lombok.extern.slf4j.Slf4j;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

@Slf4j
public class WorkdayRetrofitClient {

	private String baseUrl;

	private WorkdayManager workdayManager;

	public WorkdayRetrofitClient(String baseUrl) {
		if (StringUtils.isBlank(baseUrl)) {
			throw new IllegalArgumentException("baseUrl can not be blank");
		}
		if (!baseUrl.endsWith("/")) {
			baseUrl += "/";
		}
		this.baseUrl = baseUrl;
	}

	public WorkdayManager getManager() {
		if (workdayManager == null) {
			this.workdayManager = new Retrofit.Builder().baseUrl(this.baseUrl)
					.addConverterFactory(JacksonConverterFactory.create()).build()
					.create(WorkdayManager.class);
		}
		return workdayManager;
	}

	/**
	 * 获取一段时间内休息日
	 * 
	 * @param strart yyyy-mm-dd
	 * @param end    yyyy-mm-dd
	 * @return
	 * @throws Exception 
	 */
	public List<Map<String, Object>> notWorkDay(String start, String end) throws Exception {
		try {
			Response<List<Map<String, Object>>> resp = this.getManager().notWorkDay(start, end).execute();
			if (!resp.isSuccessful()) {
				log.error("notWorkDay error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("notWorkDay error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

	/**
	 * 获取现在到某个工作日
	 * 
	 * @param
	 * @return
	 * @throws Exception 
	 */
	public String nowToGetFewDays(int workday) throws Exception {
		try {
			Response<String> resp = this.getManager().nowToGetFewDays(workday).execute();
			if (!resp.isSuccessful()) {
				log.error("nowToGetFewDays error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("nowToGetFewDays error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

	/**
	 * 某日到某个工作日
	 * 
	 * @param
	 * @return
	 * @throws Exception 
	 */
	public String dateToGetFewDays(String date, int workday) throws Exception {
		try {
			Response<String> resp = this.getManager().dateToGetFewDays(date, workday).execute();
			if (!resp.isSuccessful()) {
				log.error("dateToGetFewDays error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("dateToGetFewDays error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

	/**
	 * 是否工作日
	 * 
	 * @param
	 * @return
	 * @throws Exception 
	 */
	public Boolean isWorkDay(String date) throws Exception {
		try {
			Response<Boolean> resp = this.getManager().isWorkDay(date).execute();
			if (!resp.isSuccessful()) {
				log.error("isWorkDay error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("isWorkDay error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

	/**
	 * 更改工作日
	 * 
	 * @param date      日期 yyyy-mm-dd
	 * @param isWorkDay 数字0或1
	 * @return
	 * @throws Exception 
	 */
	public Boolean saveWorkDay(String date, int isWorkDay) throws Exception {
		try {
			Response<Boolean> resp = this.getManager().saveWorkDay(date, isWorkDay).execute();
			if (!resp.isSuccessful()) {
				log.error("isWorkDay error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("isWorkDay error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

	/**
	 * 获取日期是当月第几个工作日
	 * @throws Exception 
	 */
	public Integer monthOfWorkDays(String date) throws Exception {
		try {
			Response<Integer> resp = this.getManager().monthOfWorkDays(date).execute();
			if (!resp.isSuccessful()) {
				log.error("isWorkDay error code: {}", resp.code());
				throw new Exception( resp.errorBody().string());
			}
			return resp.body();
		} catch (IOException e) {
			log.error("isWorkDay error msg: {}", e.getMessage());
			throw new Exception("Internal Server Error");
		}
	}

}
