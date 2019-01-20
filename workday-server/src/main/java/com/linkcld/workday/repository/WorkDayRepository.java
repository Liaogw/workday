package com.linkcld.workday.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.linkcld.workday.model.Workday;

@Repository("workDayRepository")
public interface WorkDayRepository extends JpaRepository<Workday, String>,JpaSpecificationExecutor<Workday> {

	@Query(value = "select t from Workday t where t.day = ?1")
	Workday findByDay(LocalDate time);

}
