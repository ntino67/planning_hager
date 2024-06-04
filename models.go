package main

import (
	"time"
)

type EmployeeWithCESector struct {
	EmployeeID   int    `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
	CEName       string `json:"ce_name"`
	SectorName   string `json:"sector_name"`
}

type NewEmployee struct {
	Name   string   `json:"name"`
	CE     string   `json:"ce"`
	Sector string   `json:"sector"`
	Skills []string `json:"skills"`
}

type DeleteEmployee struct {
	ID int `json:"id"`
}

type ModifyEmployee struct {
	ID     int      `json:"id"`
	Name   string   `json:"name"`
	CE     string   `json:"ce"`
	Sector string   `json:"sector"`
	Skills []string `json:"skills"`
}

type SearchEmployee struct {
	EmployeeID   int    `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
}

type Planning struct {
	ID         int       `json:"id"`
	Date       time.Time `json:"date"`
	Shift      int       `json:"shift"` // 0: 4 AM - 12 PM, 1: 12 PM - 8 PM, 2: 8 PM - 4 AM
	CEID       *int      `json:"ce_id"`
	SectorID   *int      `json:"sector_id"`
	EmployeeID *int      `json:"employee_id"`
	Status     *int      `json:"status"` // 0: present, 1: planned absence, 2: unplanned absence, 3: formation in team, 4: formation whole day, 5: sorting on post
}
