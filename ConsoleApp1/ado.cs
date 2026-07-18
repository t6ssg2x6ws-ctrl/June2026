using System.Data;
using Microsoft.Data.SqlClient;

namespace ConsoleApp1
{
    internal class AdoDotNetService
    {   
        private readonly SqlConnectionStringBuilder sb;

        public AdoDotNetService()
        {
            sb = new SqlConnectionStringBuilder
            {
                DataSource = "localhost,1433",//local or sever name
                InitialCatalog = "SecC_db",//Database name
                UserID = "sa",
                Password = "sasa@123",
                TrustServerCertificate = true
            };
        }

        public void Read()
        {
            

            Console.WriteLine("Hello, World!");

            Console.WriteLine($"The Connection is {sb.ConnectionString}");

            SqlConnection connection = new SqlConnection(sb.ConnectionString);

            Console.WriteLine("The Connection is opening");
            connection.Open();
            Console.WriteLine("The Connection is opened");

            // SqlCommand cmd = new SqlCommand(@"select [STUDENT_ID],
            // [STUDENT_NAME],
            // [FATHER_NAME],
            // [ENROLL_DATE],
            // [city]
            // from data_UIT",connection);if u want more clear version build query
            string query = @"select [STUDENT_ID],
[STUDENT_NAME],
[FATHER_NAME],
[ENROLL_DATE],
[city]
from data_UIT";

            SqlCommand cmd = new SqlCommand(query, connection);
            //to carry this command we need adapter 
            SqlDataAdapter adp = new SqlDataAdapter(cmd);
            //to execute data we need table 
            DataTable tb = new DataTable();
            //now we need to fill the data so 
            adp.Fill(tb);

            Console.WriteLine("The Connection is closing");
            connection.Close();
            Console.WriteLine("The Connection is closed");

            foreach (DataRow item in tb.Rows)
            {
                Console.WriteLine(item["STUDENT_ID"]);
                Console.WriteLine(item["STUDENT_NAME"]);
                Console.WriteLine(item["FATHER_NAME"]);
                DateTime dt = Convert.ToDateTime(item["ENROLL_DATE"]);
                Console.WriteLine(dt.ToString("dd-MMM-yyyy"));
            }

            Console.ReadLine();

        }
        public void Create()
        {

            SqlConnection connection = new SqlConnection(sb.ConnectionString);
            connection.Open();

            string query = @"INSERT INTO data_UIT ([STUDENT_ID], [STUDENT_NAME], [FATHER_NAME], [ENROLL_DATE], [city])
VALUES 
('TNT-0201', 'Aung Kyaw', 'U Ba', '2026-06-01', 'Yangon'),
('TNT-0202', 'Su Sandar', 'U Hla', '2026-06-01', 'Mandalay'),
('TNT-1245', 'Min Thaw', 'U Mya', '2026-06-02', 'Naypyidaw'),
('TNT-0204', 'Thiri Thu', 'U Kyaw', '2026-06-03', 'Yangon'),
('TNT-3299', 'Zayar Lin', 'U Tin', '2026-06-05', 'Taunggyi');
 ";
            SqlCommand cmd = new SqlCommand(query , connection);
            cmd.ExecuteNonQuery();

            connection.Close();

        }
        public void Update()
        {
            SqlConnection connection = new SqlConnection(sb.ConnectionString);
            connection.Open();

            string query = @"UPDATE data_UIT
SET [STUDENT_ID] = CASE [STUDENT_ID]
    WHEN 'TNT-0001' THEN 'TNT-0201'
    WHEN 'TNT-0002' THEN 'TNT-0202'
    WHEN 'TNT-0003' THEN 'TNT-0203'
    WHEN 'TNT-0004' THEN 'TNT-0204'
    WHEN 'TNT-0005' THEN 'TNT-0205'
    WHEN 'TNT-0006' THEN 'TNT-0206'
    WHEN 'TNT-0007' THEN 'TNT-0207'
END
WHERE [STUDENT_ID] IN ('TNT-0001', 'TNT-0002', 'TNT-0003', 'TNT-0004', 'TNT-0005', 'TNT-0006', 'TNT-0007');
";
            SqlCommand cmd = new SqlCommand(query , connection);
            cmd.ExecuteNonQuery();

            connection.Close();
        }
        public void Delete()
        {
            SqlConnection connection = new SqlConnection(sb.ConnectionString);
            connection.Open();

            string query = @"DELETE FROM data_UIT 
WHERE [STUDENT_ID] = 'TNT-3299';
";
            SqlCommand cmd = new SqlCommand(query , connection);
            cmd.ExecuteNonQuery();

            connection.Close();
  
        }
    }
}