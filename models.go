package main

import "gorm.io/gorm"

type Employee struct {
	gorm.Model
	Name     string
	CEID     int
	CE       CE
	SectorID int
	Sector   Sector
	Skills   []Skill `gorm:"many2many:employee_skills"`
}

type Sector struct {
	gorm.Model
	Name string
}

type CE struct {
	gorm.Model
	Name string
}

type Skill struct {
	gorm.Model
	Name string
}

type EmployeeSkill struct {
	EmployeeID int
	SkillID    int
}

type EmployeeWithCESector struct {
	EmployeeID   uint   `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
	CEName       string `json:"ce_name"`
	SectorName   string `json:"sector_name"`
}

type NewEmployee struct {
	Name   string `json:"name"`
	CE     int    `json:"ce"`
	Sector int    `json:"sector"`
	Skills []int  `json:"skills"`
}

type ModifyEmployee struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	CE     int    `json:"ce"`
	Sector int    `json:"sector"`
	Skills []int  `json:"skills"`
}

type DeleteEmployee struct {
	ID uint `json:"id"`
}
