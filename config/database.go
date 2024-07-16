package config

import (
	"gorm.io/gorm"
	"planning_hager/models"
)

func MigrateDB(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.Sector{},
		&models.CE{},
		&models.Skill{},
		&models.Employee{},
		&models.EmployeeSkill{},
		&models.Planning{},
		&models.Reservist{},
	)
	if err != nil {
		return
	}
}
