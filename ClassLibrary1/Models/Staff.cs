using System;
using System.Collections.Generic;

namespace ClassLibrary1.Models;

public partial class Staff
{
    public int StaffId { get; set; }

    public string Name { get; set; } = null!;

    public string password_hash { get; set; } = string.Empty;

}
