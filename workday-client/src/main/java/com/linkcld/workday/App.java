package com.linkcld.workday;

import com.linkcld.workday.service.WorkdayRetrofitClient;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {
        WorkdayRetrofitClient client = new WorkdayRetrofitClient("http://10.100.32.66:8080/workday/");
        try {
			 String date = client.nowToGetFewDays(6);
			 System.out.println(date);
		} catch (Exception e) {
			e.printStackTrace();
		}
    }
}
