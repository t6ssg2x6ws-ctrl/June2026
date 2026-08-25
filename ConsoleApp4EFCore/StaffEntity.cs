using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsoleApp4EFCore
{
    [Table("Staff")]
    public class Staffentity
    {
        [Key]
            [Column("StaffId")]
            public int Id { get; set; }
            [Column("Name")]
            public string StaffName { get; set; }
    }
}