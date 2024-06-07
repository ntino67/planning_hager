package main

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

var db *gorm.DB

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("planning.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	db.AutoMigrate(&Sector{}, &CE{}, &Skill{}, &Employee{}, &EmployeeSkill{})

	r := setupRouter()
	r.Run(":8080")
}
