package models

import (
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
	"time"
)

type Sector struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Name           string         `gorm:"not null" json:"name"`
	RequiredSkills []Skill        `gorm:"many2many:sector_required_skills;" json:"required_skills"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type CE struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Employees []Employee     `gorm:"foreignKey:CEID" json:"employees"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type Skill struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type Employee struct {
	gorm.Model
	Name     string
	CEID     uint
	CE       CE `gorm:"foreignKey:CEID"`
	SectorID uint
	Sector   Sector  `gorm:"foreignKey:SectorID"`
	Skills   []Skill `gorm:"many2many:employee_skills;"`
}

type EmployeeSkill struct {
	EmployeeID uint `gorm:"primaryKey" json:"employee_id"`
	SkillID    uint `gorm:"primaryKey" json:"skill_id"`
}

type Planning struct {
	gorm.Model
	Date         time.Time
	Week         int
	Year         int
	Weekday      string `gorm:"->"`
	Shift        string
	CEID         *uint
	CE           *CE `gorm:"foreignKey:CEID"`
	SectorID     *uint
	Sector       *Sector `gorm:"foreignKey:SectorID"`
	EmployeeID   *uint
	Employee     *Employee `gorm:"foreignKey:EmployeeID"`
	Status       string
	SubstituteID *uint
	Substitute   *Employee `gorm:"foreignKey:SubstituteID"`
}

type User struct {
	gorm.Model
	Username string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"not null"`
}

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

type SectorRequiredSkill struct {
	SectorID uint `json:"sector_id"`
	SkillID  uint `json:"skill_id"`
}

type Reservist struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Skills    []Skill        `gorm:"many2many:reservist_skills;" json:"skills"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}
