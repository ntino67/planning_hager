package main

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func getEmployeesWithCESector(c *gin.Context, db *sql.DB) {
	query := `
        SELECT e.id, e.name, ces.name AS ce_name, s.name AS sector_name
        FROM employees e
        JOIN ces ON e.ce_id = ces.id
        JOIN sectors s ON e.sector_id = s.id
    `
	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var employees []EmployeeWithCESector
	for rows.Next() {
		var employee EmployeeWithCESector
		if err := rows.Scan(&employee.EmployeeID, &employee.EmployeeName, &employee.CEName, &employee.SectorName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		employees = append(employees, employee)
	}

	c.JSON(http.StatusOK, employees)
}

func addEmployee(c *gin.Context, db *sql.DB) {
	var newEmployee NewEmployee
	if err := c.BindJSON(&newEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var ceID, sectorID int
	err := db.QueryRow("SELECT id FROM ces WHERE name = ?", newEmployee.CE).Scan(&ceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "CE not found"})
		return
	}
	err = db.QueryRow("SELECT id FROM sectors WHERE name = ?", newEmployee.Sector).Scan(&sectorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Sector not found"})
		return
	}

	_, err = db.Exec("INSERT INTO employees (name, ce_id, sector_id) VALUES (?, ?, ?)", newEmployee.Name, ceID, sectorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Employee added"})
}

func deleteEmployee(c *gin.Context, db *sql.DB) {
	var delEmployee DeleteEmployee
	if err := c.BindJSON(&delEmployee); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Deleting employee: %+v", delEmployee)

	// Log the individual values for clarity
	log.Printf("Searching for employee with Name: %s, CE: %s, Sector: %s", delEmployee.Name, delEmployee.CE, delEmployee.Sector)

	// Log the exact SQL query being executed
	var employeeID int
	query := "SELECT id FROM employees WHERE name = ? AND ce_id = (SELECT id FROM ces WHERE name = ?) AND sector_id = (SELECT id FROM sectors WHERE name = ?)"
	log.Printf("Executing query: %s", query)
	err := db.QueryRow(query, delEmployee.Name, delEmployee.CE, delEmployee.Sector).Scan(&employeeID)
	if err != nil {
		log.Printf("Error finding employee: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Employee not found"})
		return
	}

	log.Printf("Employee ID to delete: %d", employeeID)

	_, err = db.Exec("DELETE FROM employees WHERE id = ?", employeeID)
	if err != nil {
		log.Printf("Error deleting employee: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Employee deleted"})
}

func modifyEmployee(c *gin.Context, db *sql.DB) {
	var modEmployee ModifyEmployee
	if err := c.BindJSON(&modEmployee); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Modifying employee: %+v\n", modEmployee)

	var ceID, sectorID int
	err := db.QueryRow("SELECT id FROM ces WHERE name = ?", modEmployee.CE).Scan(&ceID)
	if err != nil {
		log.Printf("Error finding CE: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "CE not found"})
		return
	}

	log.Printf("Found CE ID: %d for CE: %s", ceID, modEmployee.CE)

	err = db.QueryRow("SELECT id FROM sectors WHERE name = ?", modEmployee.Sector).Scan(&sectorID)
	if err != nil {
		log.Printf("Error finding sector: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Sector not found"})
		return
	}

	log.Printf("Found sector ID: %d for sector: %s", sectorID, modEmployee.Sector)

	result, err := db.Exec("UPDATE employees SET name = ?, ce_id = ?, sector_id = ? WHERE id = ?", modEmployee.Name, ceID, sectorID, modEmployee.ID)
	if err != nil {
		log.Printf("Error updating employee: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	log.Printf("Rows affected: %d\n", rowsAffected)

	c.JSON(http.StatusOK, gin.H{"status": "Employee modified"})
}

func getSectors(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, name FROM sectors")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var sectors []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	for rows.Next() {
		var sector struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		}
		if err := rows.Scan(&sector.ID, &sector.Name); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		sectors = append(sectors, sector)
	}

	c.JSON(http.StatusOK, sectors)
}

func createSector(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func updateSector(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func deleteSector(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func getEmployees(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func createEmployee(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func updateEmployee(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func getCEs(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, name FROM ces")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ces []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	for rows.Next() {
		var ce struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		}
		if err := rows.Scan(&ce.ID, &ce.Name); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ces = append(ces, ce)
	}

	c.JSON(http.StatusOK, ces)
}

func createCE(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func updateCE(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func deleteCE(c *gin.Context, db *sql.DB) {
	// Implement this function
}

func getPlanning(c *gin.Context, db *sql.DB) {
	date := c.Query("date")
	rows, err := db.Query("SELECT * FROM planning WHERE date = ?", date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var planning []PlanningEntry
	for rows.Next() {
		var entry PlanningEntry
		if err := rows.Scan(&entry.ID, &entry.Date, &entry.SectorID, &entry.EmployeeID, &entry.Shift, &entry.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		planning = append(planning, entry)
	}
	c.JSON(http.StatusOK, planning)
}

func createPlanning(c *gin.Context, db *sql.DB) {
	var entry PlanningEntry
	if err := c.BindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.Exec("INSERT INTO planning (date, sector_id, employee_id, shift, status) VALUES (?, ?, ?, ?, ?)", entry.Date, entry.SectorID, entry.EmployeeID, entry.Shift, entry.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	entry.ID = int(id)
	c.JSON(http.StatusOK, entry)
}

func updatePlanning(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var entry PlanningEntry
	if err := c.BindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec("UPDATE planning SET date = ?, sector_id = ?, employee_id = ?, shift = ?, status = ? WHERE id = ?", entry.Date, entry.SectorID, entry.EmployeeID, entry.Shift, entry.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, entry)
}

func deletePlanning(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	_, err := db.Exec("DELETE FROM planning WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Planning entry deleted"})
}
