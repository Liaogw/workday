package com.linkcld.workday.manager;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface WorkdayManager {

	@GET("api/find/not/workday")
	Call<List<Map<String, Object>>> notWorkDay(@Query("start") String start, @Query("end") String end);

	@GET("api/add/now/workdays")
	Call<String> nowToGetFewDays(@Query("workDay") int workDay);

	@GET("api/add/date/workdays")
	Call<String> dateToGetFewDays(@Query("date") String date, @Query("workDay") int workDay);

	@GET("api/judged/workday")
	Call<Boolean> isWorkDay(@Query("date") String date);

	@GET("api/update/workday")
	Call<Boolean> saveWorkDay(@Query("date") String date, @Query("isWorkDay") int isWorkDay);

	@GET("api/month/workdays")
	Call<Integer> monthOfWorkDays(@Query("date") String date);
}
