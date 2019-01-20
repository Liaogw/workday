package com.linkcld.workday.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;


@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	public void configure(WebSecurity web) {

		// @formatter:off
		web.ignoring().antMatchers("/").antMatchers("/error", "/**/js/**", "/**/imgs/**", "/**/css/**", "/webjars/**")
		        .antMatchers("/api/**").antMatchers("/**/*.js").antMatchers("/**/*.css")
		        .antMatchers("/info", "/health");
		// @formatter:on

	}

	}





