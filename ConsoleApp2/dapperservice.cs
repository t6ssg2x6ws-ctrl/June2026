using System.Data;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Data.SqlClient;
using Dapper;

namespace ConsoleApp2
{
    internal class _DapperService
    {
        private readonly SqlConnectionStringBuilder sb = new SqlConnectionStringBuilder
        {
            DataSource = "localhost,1433",
            InitialCatalog = "SecC_db",
            UserID = "sa",
            Password = "sasa@123",
            TrustServerCertificate = true
        };
        public void Read()
        {
            using (IDbConnection db = new SqlConnection(sb.ConnectionString))
            {
                db.Open();
                List<UIT> lst = db.Query<UIT>("select * from [dbo].[data_UIT];").ToList();
                foreach (var item in lst)
                {
                    Console.WriteLine($"ID: {item.STUDENT_ID} Name: {item.STUDENT_NAME}");
                }
                int result = db.Execute(
                    "Delete from data_UIT where Student_ID='TNT-0204'"
                    );
                Console.WriteLine($"The Role Affected is {result}");
                db.Close();//no need to close
            }
        }
        public void Create()
        {
            using(IDbConnection db = new SqlConnection(sb.ConnectionString))
            {
                db.Open();
                int result = db.Execute(
                    @"insert into [dbo].[data_UIT](
                    STUDENT_ID,
                    STUDENT_NAME,
                    FATHER_NAME,
                    ENROLL_DATE,
                    city)
                    values
                    ('TNT - 0000',
                    'Insert Person',
                    'TeeSayar',
                    '2026-6-18',
                    'ThawThar')"
                );
                Console.WriteLine($"The insert data is on Line {result}");
                
            }
        } 
        public void Update() {
            using(IDbConnection db = new SqlConnection(sb.ConnectionString))
            {   
                db.Open();
                int result = db.Execute(
                    @"update data_UIT
                    SET
                    STUDENT_NAME='Phoe La Min'
                    where 
                    Student_ID='TNT-0201'
                    "
                );
                Console.WriteLine($"The Update happen on Line no {result}");
            }
        }
        public void Delete()
        {
            using (IDbConnection db = new SqlConnection(sb.ConnectionString))
            {
                db.Open();
                int result =  db.Execute(
                    @"delete from
                    data_UIT 
                    where 
                    Student_ID='TNT-2534'"
                );
                Console.WriteLine($"The line deleted was on {result} ");
            }
        }
    }
}
public class UIT
{
    public string STUDENT_ID { get; set; } = string.Empty;
    public string STUDENT_NAME { get; set; } = string.Empty;
    public string FATHER_NAME { get; set; } = string.Empty;
    public DateTime ENROLL_DATE { get; set; }
    public string city { get; set; } = string.Empty;

    public string age { get; set;}= string.Empty;

    public string Mother_Name {get;set;}=string.Empty;
}
