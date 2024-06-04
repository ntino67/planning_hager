package main

import (
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"net/http"
)

var db *gorm.DB

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	// Migrate the schema
	if err := db.AutoMigrate(&Employee{}, &Sector{}, &CE{}, &Skill{}, &EmployeeSkill{}); err != nil {
		log.Fatal("Failed to migrate database schema")
	}

	router := gin.Default()
	router.Use(corsMiddleware())

	router.GET("/sectors", getSectors)
	router.GET("/ces", getCEs)
	router.GET("/skills", getSkills)
	router.GET("/employees_ce_sector", getEmployeesWithCESector)
	router.POST("/add_employee", addEmployee)
	router.POST("/modify_employee", modifyEmployee)
	router.POST("/delete_employee", deleteEmployee)
	router.GET("/employee_skills/:id", getEmployeeSkills)

	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
