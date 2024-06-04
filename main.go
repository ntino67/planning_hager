package main

import (
	"database/sql"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

func main() {
	db, err := sql.Open("sqlite3", "./planning.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}
	defer db.Close()

	router := gin.Default()
	router.Use(cors.Default())

	router.GET("/sectors", func(c *gin.Context) { getSectors(c, db) })
	router.GET("/ces", func(c *gin.Context) { getCEs(c, db) })
	router.GET("/skills", func(c *gin.Context) { getSkills(c, db) }) // Ensure this route is added

	router.POST("/sectors", func(c *gin.Context) { createSector(c, db) })
	router.PUT("/sectors/:id", func(c *gin.Context) { updateSector(c, db) })
	router.DELETE("/sectors/:id", func(c *gin.Context) { deleteSector(c, db) })

	router.GET("/employees", func(c *gin.Context) { getEmployees(c, db) })
	router.POST("/employees", func(c *gin.Context) { createEmployee(c, db) })
	router.PUT("/employees/:id", func(c *gin.Context) { modifyEmployee(c, db) })
	router.DELETE("/employees/:id", func(c *gin.Context) { deleteEmployee(c, db) })

	router.POST("/ces", func(c *gin.Context) { createCE(c, db) })
	router.PUT("/ces/:id", func(c *gin.Context) { updateCE(c, db) })
	router.DELETE("/ces/:id", func(c *gin.Context) { deleteCE(c, db) })

	router.GET("/employees_ce_sector", func(c *gin.Context) { getEmployeesWithCESector(c, db) })
	router.POST("/add_employee", func(c *gin.Context) { addEmployee(c, db) })
	router.POST("/delete_employee", func(c *gin.Context) { deleteEmployee(c, db) })
	router.POST("/modify_employee", func(c *gin.Context) { modifyEmployee(c, db) })
	router.GET("/employee_skills/:id", func(c *gin.Context) { getEmployeeSkills(c, db) })

	router.GET("/planning")

	router.Run(":8080")
}
