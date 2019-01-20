package com.linkcld.workday.model;

import java.io.Serializable;
import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

/**
 * The persistent class for the CFG_WORKDAY database table.
 * 
 */
@Entity
@Table(name = "CFG_WORKDAY")
@NamedQuery(name = "CfgWorkday.findAll", query = "SELECT c FROM Workday c")
public class Workday implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(generator = "system-uuid")
	@GenericGenerator(name = "system-uuid", strategy = "uuid2")
	private String id;

	@Column(name = "DAY")
	private LocalDate day;

	@Column(name = "IS_WORKDAY")
	private Integer isWorkday;

	public Workday() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public LocalDate getDay() {
		return this.day;
	}

	public void setDay(LocalDate day) {
		this.day = day;
	}

	public Integer getIsWorkday() {
		return this.isWorkday;
	}

	public void setIsWorkday(Integer isWorkday) {
		this.isWorkday = isWorkday;
	}

}