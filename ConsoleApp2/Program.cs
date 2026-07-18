using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;
using System.Net;
using ConsoleApp2;

_DapperService service = new _DapperService();
service.Read();
service.Create();
service.Update();
service.Delete();
// dynamic a = new { Student_ID = "TNT - 2904", Student_Name = "Ko Ko"};
// string b = a.Student_ID;
// string c = a.Student_Name;
// fire();
