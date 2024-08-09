package main

// Personio User
Event struct {
	ID struct {
		Label       string `json:"label"`
		Value       int    `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"id"`
	FirstName struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"first_name"`
	LastName struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"last_name"`
	Email struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"email"`
	Gender struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"gender"`
	Status struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"status"`
	Position struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"position"`
	Supervisor struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID struct {
					Label       string `json:"label"`
					Value       int    `json:"value"`
					Type        string `json:"type"`
					UniversalID string `json:"universal_id"`
				} `json:"id"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"supervisor"`
	EmploymentType struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"employment_type"`
	WeeklyWorkingHours struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"weekly_working_hours"`
	HireDate struct {
		Label       string    `json:"label"`
		Value       time.Time `json:"value"`
		Type        string    `json:"type"`
		UniversalID string    `json:"universal_id"`
	} `json:"hire_date"`
	ContractEndDate struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"contract_end_date"`
	TerminationDate struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"termination_date"`
	TerminationType struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"termination_type"`
	TerminationReason struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"termination_reason"`
	ProbationPeriodEnd struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"probation_period_end"`
	CreatedAt struct {
		Label       string    `json:"label"`
		Value       time.Time `json:"value"`
		Type        string    `json:"type"`
		UniversalID string    `json:"universal_id"`
	} `json:"created_at"`
	LastModifiedAt struct {
		Label       string    `json:"label"`
		Value       time.Time `json:"value"`
		Type        string    `json:"type"`
		UniversalID string    `json:"universal_id"`
	} `json:"last_modified_at"`
	Subcompany struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"subcompany"`
	Office struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"office"`
	Department struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"department"`
	CostCenters struct {
		Label string `json:"label"`
		Value []struct {
			Type       string `json:"type"`
			Attributes struct {
				ID         int    `json:"id"`
				Name       string `json:"name"`
				Percentage int    `json:"percentage"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"cost_centers"`
	HolidayCalendar struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID      int    `json:"id"`
				Name    string `json:"name"`
				Country string `json:"country"`
				State   string `json:"state"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"holiday_calendar"`
	AbsenceEntitlement struct {
		Label string `json:"label"`
		Value []struct {
			Type       string `json:"type"`
			Attributes struct {
				ID          int    `json:"id"`
				Name        string `json:"name"`
				Category    string `json:"category"`
				Entitlement int    `json:"entitlement"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"absence_entitlement"`
	WorkSchedule struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID        int         `json:"id"`
				Name      string      `json:"name"`
				ValidFrom interface{} `json:"valid_from"`
				Monday    string      `json:"monday"`
				Tuesday   string      `json:"tuesday"`
				Wednesday string      `json:"wednesday"`
				Thursday  string      `json:"thursday"`
				Friday    string      `json:"friday"`
				Saturday  string      `json:"saturday"`
				Sunday    string      `json:"sunday"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"work_schedule"`
	FixSalary struct {
		Label       string `json:"label"`
		Value       int    `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"fix_salary"`
	FixSalaryInterval struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"fix_salary_interval"`
	HourlySalary struct {
		Label       string `json:"label"`
		Value       int    `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"hourly_salary"`
	VacationDayBalance struct {
		Label       string `json:"label"`
		Value       int    `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"vacation_day_balance"`
	LastWorkingDay struct {
		Label       string      `json:"label"`
		Value       interface{} `json:"value"`
		Type        string      `json:"type"`
		UniversalID string      `json:"universal_id"`
	} `json:"last_working_day"`
	ProfilePicture struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"profile_picture"`
	Team struct {
		Label string `json:"label"`
		Value struct {
			Type       string `json:"type"`
			Attributes struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			} `json:"attributes"`
		} `json:"value"`
		Type        string `json:"type"`
		UniversalID string `json:"universal_id"`
	} `json:"team"`
	Dynamic24407 struct {
		Label       string      `json:"label"`
		Value       string      `json:"value"`
		UniversalID interface{} `json:"universal_id"`
		Type        string      `json:"type"`
	} `json:"dynamic_24407"`
	Dynamic21827 struct {
		Label       string `json:"label"`
		Value       string `json:"value"`
		UniversalID string `json:"universal_id"`
		Type        string `json:"type"`
	} `json:"dynamic_21827"`
	Dynamic33400 struct {
		Label       string      `json:"label"`
		Value       time.Time   `json:"value"`
		UniversalID interface{} `json:"universal_id"`
		Type        string      `json:"type"`
	} `json:"dynamic_33400"`
}

