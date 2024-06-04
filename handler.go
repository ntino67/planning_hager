package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
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

	result, err := db.Exec("INSERT INTO employees (name, ce_id, sector_id) VALUES (?, ?, ?)", newEmployee.Name, ceID, sectorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	employeeID, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, skill := range newEmployee.Skills {
		_, err := db.Exec("INSERT INTO employee_skills (employee_id, skill) VALUES (?, ?)", employeeID, skill)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "Employee added"})
}

func modifyEmployee(c *gin.Context, db *sql.DB) {
	var modEmployee ModifyEmployee
	if err := c.BindJSON(&modEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var ceID, sectorID int
	err := db.QueryRow("SELECT id FROM ces WHERE name = ?", modEmployee.CE).Scan(&ceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "CE not found"})
		return
	}

	err = db.QueryRow("SELECT id FROM sectors WHERE name = ?", modEmployee.Sector).Scan(&sectorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Sector not found"})
		return
	}

	_, err = db.Exec("UPDATE employees SET name = ?, ce_id = ?, sector_id = ? WHERE id = ?", modEmployee.Name, ceID, sectorID, modEmployee.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = db.Exec("DELETE FROM employee_skills WHERE employee_id = ?", modEmployee.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, skill := range modEmployee.Skills {
		_, err := db.Exec("INSERT INTO employee_skills (employee_id, skill) VALUES (?, ?)", modEmployee.ID, skill)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "Employee modified"})
}

func deleteEmployee(c *gin.Context, db *sql.DB) {
	var delEmployee DeleteEmployee
	if err := c.BindJSON(&delEmployee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec("DELETE FROM employee_skills WHERE employee_id = ?", delEmployee.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = db.Exec("DELETE FROM employees WHERE id = ?", delEmployee.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Employee deleted"})
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

func getSkills(c *gin.Context, db *sql.DB) {
	rows, err := db.Query("SELECT id, name FROM skills")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var skills []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	for rows.Next() {
		var skill struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		}
		if err := rows.Scan(&skill.ID, &skill.Name); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		skills = append(skills, skill)
	}

	fmt.Printf("Skills: %+v\n", skills)
	c.JSON(http.StatusOK, skills)
}

func getEmployees(c *gin.Context, db *sql.DB) {
	search := c.Query("search")
	query := "SELECT id, name FROM employees"
	var rows *sql.Rows
	var err error

	if search != "" {
		query += " WHERE name LIKE ?"
		rows, err = db.Query(query, "%"+search+"%")
	} else {
		rows, err = db.Query(query)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var employees []SearchEmployee
	for rows.Next() {
		var e SearchEmployee
		if err := rows.Scan(&e.EmployeeID, &e.EmployeeName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		employees = append(employees, e)
	}

	c.JSON(http.StatusOK, employees)
}

func getEmployeeSkills(c *gin.Context, db *sql.DB) {
	employeeID := c.Param("id")
	query := `
        SELECT skill
        FROM employee_skills
        WHERE employee_id = ?
    `
	rows, err := db.Query(query, employeeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var skills []string
	for rows.Next() {
		var skill string
		if err := rows.Scan(&skill); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		skills = append(skills, skill)
	}

	fmt.Printf("Employee Skills: %+v\n", skills)
	c.JSON(http.StatusOK, skills)
}

func createEmployee(c *gin.Context, db *sql.DB) {
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

func getPlannings(c *gin.Context, db *sql.DB) {
	query := `
        SELECT p.id, p.date, p.shift, p.ce_id, pd.sector_id, pd.employee_id, e.name as employee_name, s.name as sector_name, ce.name as ce_name, p.status
        FROM plannings p
        LEFT JOIN planning_details pd ON p.id = pd.planning_id
        LEFT JOIN employees e ON pd.employee_id = e.id
        LEFT JOIN sectors s ON pd.sector_id = s.id
        LEFT JOIN ces ce ON p.ce_id = ce.id
    `
	rows, err := db.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var plannings []struct {
		ID           int    `json:"id"`
		Date         string `json:"date"`
		Shift        int    `json:"shift"`
		CEID         int    `json:"ce_id"`
		SectorID     int    `json:"sector_id"`
		EmployeeID   int    `json:"employee_id"`
		Status       int    `json:"status"`
		EmployeeName string `json:"employee_name"`
		SectorName   string `json:"sector_name"`
		CEName       string `json:"ce_name"`
	}
	for rows.Next() {
		var planning struct {
			ID           int    `json:"id"`
			Date         string `json:"date"`
			Shift        int    `json:"shift"`
			CEID         int    `json:"ce_id"`
			SectorID     int    `json:"sector_id"`
			EmployeeID   int    `json:"employee_id"`
			Status       int    `json:"status"`
			EmployeeName string `json:"employee_name"`
			SectorName   string `json:"sector_name"`
			CEName       string `json:"ce_name"`
		}
		if err := rows.Scan(&planning.ID, &planning.Date, &planning.Shift, &planning.CEID, &planning.SectorID, &planning.EmployeeID, &planning.Status, &planning.EmployeeName, &planning.SectorName, &planning.CEName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		plannings = append(plannings, planning)
	}

	c.JSON(http.StatusOK, plannings)
}

func savePlanning(c *gin.Context, db *sql.DB) {
	var plannings []struct {
		ID         int    `json:"id"`
		Date       string `json:"date"`
		Shift      int    `json:"shift"`
		CEID       int    `json:"ce_id"`
		SectorID   int    `json:"sector_id"`
		EmployeeID int    `json:"employee_id"`
		Status     int    `json:"status"`
	}
	if err := c.BindJSON(&plannings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	for _, planning := range plannings {
		// Insert or update the plannings table
		result, err := tx.Exec(`
            INSERT INTO plannings (id, date, shift, ce_id, status)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                date=excluded.date,
                shift=excluded.shift,
                ce_id=excluded.ce_id,
                status=excluded.status
            `, planning.ID, planning.Date, planning.Shift, planning.CEID, planning.Status)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		planningID, err := result.LastInsertId()
		if err != nil {
			planningID = int64(planning.ID) // Use existing ID if it's an update
		}

		// Insert or update the planning_details table
		if _, err := tx.Exec(`
            INSERT INTO planning_details (planning_id, sector_id, employee_id)
            VALUES (?, ?, ?)
            ON CONFLICT(planning_id, sector_id, employee_id) DO UPDATE SET
                sector_id=excluded.sector_id,
                employee_id=excluded.employee_id
            `, planningID, planning.SectorID, planning.EmployeeID); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Planning saved"})
}

func getEmployeesByCE(c *gin.Context, db *sql.DB) {
	ceID := c.Param("ce_id")

	query := `
        SELECT e.id, e.name, e.ce_id, e.sector_id
        FROM employees e
        WHERE e.ce_id = ?
    `
	rows, err := db.Query(query, ceID)
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

func searchEmployees(c *gin.Context, db *sql.DB) {
	query := c.Query("query")
	searchQuery := "%" + query + "%"

	queryString := `
        SELECT e.id, e.name, ces.name AS ce_name, s.name AS sector_name
        FROM employees e
        JOIN ces ON e.ce_id = ces.id
        JOIN sectors s ON e.sector_id = s.id
        WHERE e.name LIKE ?
    `
	rows, err := db.Query(queryString, searchQuery)
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
