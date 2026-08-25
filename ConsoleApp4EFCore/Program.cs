using ClassLibrary1.Models;
using ConsoleApp4EFCore;

Console.WriteLine("Hello, World!");

June2026AppDbContext db = new June2026AppDbContext();
_AppDbContext db1 = new _AppDbContext();
var x = db1.Staff.ToList();
db1.SaveChanges();


// CRUD

// var lst = db.Staffs.ToList();
// db.SaveChanges();
// foreach(var item in lst)
// {
//     Console.WriteLine(item.Id);
//     Console.WriteLine(item.StaffName);
// }

// db.Staffs.Where(x=> x.Id == 1).FirstOrDefault();
// db.Staffs.Where(x=> x.Id == 1000).FirstOrDefault();

// Console.ReadLine();
// Staffentity staffentity = new Staffentity()
// {
//     StaffName = "Moe Sandi Myint"
// };
// db.Staffs.Add(staffentity);
// var staff = db.Staffs.Where(x => x.Id == 3).FirstOrDefault();
// if(staff is null)
// {
//     Console.WriteLine("Staff not found");
// }else
// {
//     staff.StaffName = "Myat Thin Nwe";
//     db.SaveChanges();
// }
// Console.ReadLine();
var staff3 = db.Staffs.Where(x => x.Id == 3).FirstOrDefault();
if(staff3 is null)
{
    Console.WriteLine("Staff not found");
}else
{
    db.Staffs.Remove(staff3);
    db.SaveChanges();
}
Console.ReadLine();