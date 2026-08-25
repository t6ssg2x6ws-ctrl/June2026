using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ConsoleApp4EFCore
{
    public class June2026AppDbContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
           if(!optionsBuilder.IsConfigured)
            {
                SqlConnectionStringBuilder sb = new SqlConnectionStringBuilder
                {
                    DataSource = "localhost,1433",
                    InitialCatalog = "staff",
                    UserID = "sa",
                    Password = "sasa@123",
                    TrustServerCertificate = true
                };
                optionsBuilder.UseSqlServer(sb.ConnectionString);
            }
        }public DbSet<Staffentity> Staffs { get; set; } = null!;
    }   
    }