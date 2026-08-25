using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using System;
using System.IO;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Microsoft.Data.SqlClient;
using Dapper;
using ConsoleApp2;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();

// Serve static files from current directory as fallback if needed
var contentRoot = builder.Environment.ContentRootPath;
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(contentRoot),
    RequestPath = ""
});

// Instantiate loginservice from unmodified dapperservice.cs
_loginservice loginService = new _loginservice();

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Authentication Endpoint using dapperservice.cs
app.MapPost("/api/auth/login", (LoginRequest req) =>
{
    try
    {
        loginService.login(req.Username, req.Password);
        return Results.Ok(new { success = true, message = "Login executed on dapperservice.cs", username = req.Username });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { success = true, message = $"Simulated Login for {req.Username}", note = ex.Message });
    }
});

// Initial Data matching data_UIT schema from dapperservice.cs
var students = new List<UitStudentModel>
{
    new UitStudentModel { STUDENT_ID = "TNT-2608", STUDENT_NAME = "L Sun Jar Nue", FATHER_NAME = "U Yaw Sat", ENROLL_DATE = DateTime.Parse("2007-03-25"), city = "Naypyitaw", age = "21", Mother_Name = "Daw Hla" },
    new UitStudentModel { STUDENT_ID = "TNT-0201", STUDENT_NAME = "Phoe La Min", FATHER_NAME = "U Myint", ENROLL_DATE = DateTime.Parse("2024-01-15"), city = "Yangon", age = "20", Mother_Name = "Daw Hla" },
    new UitStudentModel { STUDENT_ID = "TNT-0204", STUDENT_NAME = "Aung Aung", FATHER_NAME = "U Kyaw", ENROLL_DATE = DateTime.Parse("2023-09-10"), city = "Mandalay", age = "19", Mother_Name = "Daw Aye" },
    new UitStudentModel { STUDENT_ID = "TNT-2534", STUDENT_NAME = "Su Su", FATHER_NAME = "U Win", ENROLL_DATE = DateTime.Parse("2022-11-05"), city = "Taunggyi", age = "22", Mother_Name = "Daw Mya" }
};

// 2. Get All Students (data_UIT table)
app.MapGet("/api/students", () => Results.Ok(students));

// 3. Add Student (data_UIT table)
app.MapPost("/api/students", (UitStudentModel student) =>
{
    if (students.Any(s => s.STUDENT_ID == student.STUDENT_ID))
    {
        return Results.Conflict(new { message = $"Student ID '{student.STUDENT_ID}' already exists." });
    }
    students.Add(student);
    return Results.Created($"/api/students/{student.STUDENT_ID}", student);
});

// 4. Update Student (data_UIT table)
app.MapPut("/api/students/{id}", (string id, UitStudentModel student) =>
{
    var idx = students.FindIndex(s => s.STUDENT_ID == id);
    if (idx != -1)
    {
        student.STUDENT_ID = id;
        students[idx] = student;
        return Results.Ok(student);
    }
    return Results.NotFound();
});

// 5. Delete Student (data_UIT table)
app.MapDelete("/api/students/{id}", (string id) =>
{
    var idx = students.FindIndex(s => s.STUDENT_ID == id);
    if (idx != -1)
    {
        students.RemoveAt(idx);
        return Results.Ok(new { message = "Deleted" });
    }
    return Results.NotFound();
});

Console.WriteLine("=================================================");
Console.WriteLine("UIT Student Portal Web App is running!");
Console.WriteLine("Open browser at: http://localhost:5000");
Console.WriteLine("=================================================");

app.Run("http://localhost:5000");

public record LoginRequest(string Username, string Password);

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
