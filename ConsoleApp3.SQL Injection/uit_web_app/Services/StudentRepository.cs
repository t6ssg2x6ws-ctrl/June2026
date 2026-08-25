using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Microsoft.Data.SqlClient;
using Dapper;

namespace UitWebApp.Services
{
    // Student model matching exact fields in dapperservice.cs
    public class UitStudentModel
    {
        public string STUDENT_ID { get; set; } = string.Empty;
        public string STUDENT_NAME { get; set; } = string.Empty;
        public string FATHER_NAME { get; set; } = string.Empty;
        public DateTime ENROLL_DATE { get; set; } = DateTime.Now;
        public string city { get; set; } = string.Empty;
        public string age { get; set; } = string.Empty;
        public string Mother_Name { get; set; } = string.Empty;
    }

    public class UserLoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }

    public class StudentRepository
    {
        private readonly SqlConnectionStringBuilder sb = new SqlConnectionStringBuilder
        {
            DataSource = "localhost,1433",
            InitialCatalog = "login_db",
            UserID = "sa",
            Password = "sasa@123",
            TrustServerCertificate = true
        };

        // In-memory fallback list matching dapperservice.cs sample data
        private static readonly List<UitStudentModel> _inMemoryStudents = new List<UitStudentModel>
        {
            new UitStudentModel { STUDENT_ID = "TNT-2608", STUDENT_NAME = "L Sun Jar Nue", FATHER_NAME = "U Yaw Sat", ENROLL_DATE = DateTime.Parse("2007-03-25"), city = "Naypyitaw", age = "21", Mother_Name = "Daw Hla" },
            new UitStudentModel { STUDENT_ID = "TNT-0201", STUDENT_NAME = "Phoe La Min", FATHER_NAME = "U Myint", ENROLL_DATE = DateTime.Parse("2024-01-15"), city = "Yangon", age = "20", Mother_Name = "Daw Hla" },
            new UitStudentModel { STUDENT_ID = "TNT-0204", STUDENT_NAME = "Aung Aung", FATHER_NAME = "U Kyaw", ENROLL_DATE = DateTime.Parse("2023-09-10"), city = "Mandalay", age = "19", Mother_Name = "Daw Aye" },
            new UitStudentModel { STUDENT_ID = "TNT-2534", STUDENT_NAME = "Su Su", FATHER_NAME = "U Win", ENROLL_DATE = DateTime.Parse("2022-11-05"), city = "Taunggyi", age = "22", Mother_Name = "Daw Mya" }
        };

        private static readonly List<UserLoginModel> _inMemoryUsers = new List<UserLoginModel>
        {
            new UserLoginModel { Username = "admin", PasswordHash = "admin123" },
            new UserLoginModel { Username = "user1", PasswordHash = "pass123" }
        };

        // Check SQL Server Connection
        private bool TryGetConnection(out IDbConnection? db)
        {
            try
            {
                var conn = new SqlConnection(sb.ConnectionString);
                conn.Open();
                db = conn;
                return true;
            }
            catch
            {
                db = null;
                return false;
            }
        }

        // Authenticate User using parameterized Dapper query matching dapperservice.cs
        public bool Login(string username, string passwordHash)
        {
            if (TryGetConnection(out var db) && db != null)
            {
                using (db)
                {
                    var result = db.Query<ConsoleApp2.Service>(
                        "select * from [dbo].[users] where username=@username and password_hash=@password_hash",
                        new { username = username, password_hash = passwordHash }
                    ).ToList();

                    return result.Count > 0;
                }
            }

            // Fallback in-memory authentication
            return _inMemoryUsers.Any(u => u.Username == username && u.PasswordHash == passwordHash);
        }

        // Read all students from data_UIT
        public List<UitStudentModel> GetAllStudents()
        {
            if (TryGetConnection(out var db) && db != null)
            {
                using (db)
                {
                    return db.Query<UitStudentModel>("select * from [dbo].[data_UIT];").ToList();
                }
            }

            return _inMemoryStudents.ToList();
        }

        // Create student in data_UIT
        public bool CreateStudent(UitStudentModel student)
        {
            if (TryGetConnection(out var db) && db != null)
            {
                using (db)
                {
                    int rows = db.Execute(@"
                        insert into [dbo].[data_UIT] (STUDENT_ID, STUDENT_NAME, FATHER_NAME, ENROLL_DATE, city, age, Mother_Name)
                        values (@STUDENT_ID, @STUDENT_NAME, @FATHER_NAME, @ENROLL_DATE, @city, @age, @Mother_Name)",
                        student);
                    return rows > 0;
                }
            }

            if (_inMemoryStudents.Any(s => s.STUDENT_ID == student.STUDENT_ID))
                return false;

            _inMemoryStudents.Add(student);
            return true;
        }

        // Update student in data_UIT
        public bool UpdateStudent(UitStudentModel student)
        {
            if (TryGetConnection(out var db) && db != null)
            {
                using (db)
                {
                    int rows = db.Execute(@"
                        update data_UIT 
                        SET STUDENT_NAME=@STUDENT_NAME, FATHER_NAME=@FATHER_NAME, ENROLL_DATE=@ENROLL_DATE, city=@city, age=@age, Mother_Name=@Mother_Name
                        where Student_ID=@STUDENT_ID",
                        student);
                    return rows > 0;
                }
            }

            var index = _inMemoryStudents.FindIndex(s => s.STUDENT_ID == student.STUDENT_ID);
            if (index != -1)
            {
                _inMemoryStudents[index] = student;
                return true;
            }
            return false;
        }

        // Delete student from data_UIT
        public bool DeleteStudent(string studentId)
        {
            if (TryGetConnection(out var db) && db != null)
            {
                using (db)
                {
                    int rows = db.Execute("delete from data_UIT where Student_ID=@StudentId", new { StudentId = studentId });
                    return rows > 0;
                }
            }

            var index = _inMemoryStudents.FindIndex(s => s.STUDENT_ID == studentId);
            if (index != -1)
            {
                _inMemoryStudents.RemoveAt(index);
                return true;
            }
            return false;
        }
    }
}
