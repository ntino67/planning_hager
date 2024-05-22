package main

type EmployeeWithCESector struct {
	EmployeeID   int    `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
	CEName       string `json:"ce_name"`
	SectorName   string `json:"sector_name"`
}

type NewEmployee struct {
	Name   string `json:"name"`
	CE     string `json:"ce"`
	Sector string `json:"sector"`
}

type DeleteEmployee struct {
	Name   string `json:"name"`
	CE     string `json:"ce"`
	Sector string `json:"sector"`
}

type ModifyEmployee struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	CE     string `json:"ce"`
	Sector string `json:"sector"`
}

type PlanningEntry struct {
	ID         int    `json:"id"`
	Date       string `json:"date"`
	SectorID   int    `json:"sector_id"`
	EmployeeID int    `json:"employee_id"`
	Shift      int    `json:"shift"`
	Status     int    `json:"status"`
}
