using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using UitWebApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Register Repository Service
builder.Services.AddSingleton<StudentRepository>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Authentication Endpoint (users table)
app.MapPost("/api/auth/login", (LoginRequest req, StudentRepository repo) =>
{
    bool success = repo.Login(req.Username, req.Password);
    if (success)
    {
        return Results.Ok(new { success = true, message = "Login Success", username = req.Username });
    }
    return Results.Unauthorized();
});

// 2. Get All Students (data_UIT table)
app.MapGet("/api/students", (StudentRepository repo) =>
{
    var students = repo.GetAllStudents();
    return Results.Ok(students);
});

// 3. Create Student (data_UIT table)
app.MapPost("/api/students", (UitStudentModel student, StudentRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(student.STUDENT_ID) || string.IsNullOrWhiteSpace(student.STUDENT_NAME))
    {
        return Results.BadRequest(new { message = "STUDENT_ID and STUDENT_NAME are required." });
    }

    bool created = repo.CreateStudent(student);
    if (created)
    {
        return Results.Created($"/api/students/{student.STUDENT_ID}", student);
    }
    return Results.Conflict(new { message = $"Student ID '{student.STUDENT_ID}' already exists." });
});

// 4. Update Student (data_UIT table)
app.MapPut("/api/students/{id}", (string id, UitStudentModel student, StudentRepository repo) =>
{
    student.STUDENT_ID = id;
    bool updated = repo.UpdateStudent(student);
    if (updated)
    {
        return Results.Ok(student);
    }
    return Results.NotFound(new { message = $"Student ID '{id}' not found." });
});

// 5. Delete Student (data_UIT table)
app.MapDelete("/api/students/{id}", (string id, StudentRepository repo) =>
{
    bool deleted = repo.DeleteStudent(id);
    if (deleted)
    {
        return Results.Ok(new { message = $"Student '{id}' deleted successfully." });
    }
    return Results.NotFound(new { message = $"Student ID '{id}' not found." });
});

// 6. DB Info & Schema metadata endpoint
app.MapGet("/api/db/info", () =>
{
    return Results.Ok(new
    {
        dataSource = "localhost,1433",
        initialCatalog = "login_db",
        userId = "sa",
        trustServerCertificate = true,
        tables = new[] { "[dbo].[users]", "[dbo].[data_UIT]" }
    });
});

app.Run();

// DTO for login request
public record LoginRequest(string Username, string Password);
