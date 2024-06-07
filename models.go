package main

import (
	_ "gorm.io/gorm"
)

type Sector struct {
	ID   int    `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

type CE struct {
	ID   int    `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

type Skill struct {
	ID   int    `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

type Employee struct {
	ID       int     `json:"id" gorm:"primaryKey"`
	Name     string  `json:"name"`
	CEID     int     `json:"ce_id"`
	SectorID int     `json:"sector_id"`
	Skills   []Skill `gorm:"many2many:employee_skills;"`
	CE       CE      `json:"ce" gorm:"foreignKey:CEID"`
	Sector   Sector  `json:"sector" gorm:"foreignKey:SectorID"`
}

type EmployeeSkill struct {
	EmployeeID int `json:"employee_id"`
	SkillID    int `json:"skill_id"`
}

type EmployeeWithCESector struct {
	EmployeeID   int    `json:"employee_id"`
	EmployeeName string `json:"employee_name"`
	CEName       string `json:"ce_name"`
	SectorName   string `json:"sector_name"`
}
